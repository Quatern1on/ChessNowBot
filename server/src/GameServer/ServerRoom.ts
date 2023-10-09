import {Chess} from "chess.js";
import config from "config";
import debug from "debug";
import {DateTime} from "luxon";
import ShortUniqueId from "short-unique-id";
import {DisconnectReason} from "socket.io";
import {EventNames, EventParams} from "socket.io/dist/typed-events";

import {PlayedGame} from "@/GameServer/Database";
import {
    Color,
    GameResolution,
    GameRules,
    GameState,
    GameStatus,
    Member,
    Move,
    Room,
    ServerToClientEvents,
    TimerState,
    User,
} from "@/GameServer/DataModel";
import {AlreadyConnectedError, IllegalMoveError} from "@/GameServer/Errors";
import {Socket} from "@/GameServer/GameServer";
import {PausableTimer} from "@/GameServer/PausableTimer";
import {catchErrors} from "@/GameServer/SocketErrorHandler";
import {TypedEventEmitter} from "@/GameServer/TypedEventEmitter";

const UID = new ShortUniqueId({length: 24});

const log = debug("GameServer:ServerRoom");

interface MemberSession {
    member: Member;
    socket: Socket | null;
    joined: DateTime;
    disconnectTimer?: PausableTimer | null;
}

interface ServerRoomEvents {
    connectedUsersChange: [];
    gameStatusChange: [];
    destroy: [];
}

//Room will be destroyed after 3 minutes if no one is connected
export const InactivityTimeout = config.get<number>("gameServer.inactivityTimeout") * 1000;

//If user disconnects mid-game for more than 1 minute, he automatically looses
export const DisconnectTimeout = config.get<number>("gameServer.disconnectTimeout") * 1000;

export class ServerRoom extends TypedEventEmitter<ServerRoomEvents> {
    public readonly id: string;

    public readonly hostID: number;

    public readonly createdDateTime: DateTime;

    public readonly gameRules: GameRules;

    public readonly isFake: boolean;

    private readonly _gameState: Omit<GameState, "turn" | "pgn" | "timer">;

    private readonly sessions: {[key: number]: MemberSession};

    private readonly chess: Chess;

    private whitePlayerID: number | undefined;
    private blackPlayerID: number | undefined;

    private whiteTimer: PausableTimer | undefined;
    private blackTimer: PausableTimer | undefined;

    private inactivityTimer: PausableTimer;

    public static randomColor(): Color {
        return Math.floor(Math.random() * 2) === 1 ? Color.White : Color.Black;
    }

    public static swapColor(color: Color): Color {
        return color === Color.White ? Color.Black : Color.White;
    }

    public constructor(host: User, gameRules: GameRules, id?: string) {
        super();

        if (id) {
            this.id = id;
        } else {
            this.id = UID.rnd();
        }

        log('Created new room("%s")', this.id);

        this.createdDateTime = DateTime.now();

        this.sessions = {};
        this.sessions[host.id] = {
            member: {
                user: host,
                state: {
                    connected: false,
                    isPlayer: true,
                    color: gameRules.hostPreferredColor || ServerRoom.randomColor(),
                },
            },
            socket: null,
            joined: this.createdDateTime,
        };

        this.hostID = host.id;
        this.gameRules = gameRules;
        this._gameState = {
            status: GameStatus.NotStarted,
        };
        this.chess = new Chess();

        if (this.sessions[host.id].member.state.color === Color.White) {
            this.whitePlayerID = host.id;
        } else {
            this.blackPlayerID = host.id;
        }

        this.inactivityTimer = new PausableTimer(catchErrors()(this.handleInactivityTimeout));
        this.inactivityTimer.start(InactivityTimeout);

        if (config.get<boolean>("gameServer.fakeRoom.create")) {
            this.isFake = this.id === config.get<string>("gameServer.fakeRoom.id");
        } else {
            this.isFake = false;
        }
    }

    public get gameStatus(): GameStatus {
        return this._gameState.status;
    }

    public get host(): User {
        return this.sessions[this.hostID].member.user;
    }

    public get blackPlayer(): User {
        return this.sessions[this.blackPlayerID!].member.user;
    }

    public get whitePlayer(): User {
        return this.sessions[this.whitePlayerID!].member.user;
    }

    public get connectedUsers(): User[] {
        return this.connectedSessions().map((session) => session.member.user);
    }

    public readonly gameState = (): GameState => {
        return {
            ...this._gameState,
            turn: this.chess.turn() as Color,
            pgn: this.chess.pgn(),
            timer: this.timer,
        };
    };

    public readonly members = (): Member[] => {
        return Object.values(this.sessions).map((session) => session.member);
    };

    public readonly numberOfConnectedMembers = (): number => {
        return this.connectedSessions().length;
    };

    public readonly isUserPresent = (userID: number): boolean => {
        return Boolean(this.sessions[userID]);
    };

    public readonly isUserConnected = (userID: number): boolean => {
        return Boolean(this.sessions[userID]?.member.state.connected);
    };

    public readonly dto = (): Room => {
        return {
            id: this.id,
            members: this.members(),
            hostID: this.hostID,
            createdTimestamp: this.createdDateTime.toSeconds(),
            gameRules: this.gameRules,
            gameState: this.gameState(),
        };
    };

    public get timer(): TimerState | undefined {
        if (!this.whiteTimer || !this.blackTimer) {
            return;
        }
        return {
            whiteTimeLeft: this.whiteTimer.timeLeft,
            blackTimeLeft: this.blackTimer.timeLeft,
        };
    }

    public readonly acceptConnection = (socket: Socket, user: User): void => {
        if (this.isUserConnected(user.id)) {
            throw new AlreadyConnectedError("You can not connect to the same room twice");
        }

        if (this.inactivityTimer.isGoing) {
            this.inactivityTimer.stop();
        }

        if (this.isUserPresent(user.id)) {
            this.sessions[user.id].socket = socket;
            this.sessions[user.id].member.state.connected = true;

            socket.emit("init", this.dto(), user.id);
            this.broadcastExcept(user.id, "memberUpdate", user.id, this.sessions[user.id].member.state);

            log('User(%d) connected to room("%s")', user.id, this.id);
        } else {
            this.sessions[user.id] = {
                member: {
                    user: user,
                    state: {
                        connected: true,
                        isPlayer: false,
                    },
                },
                socket: socket,
                joined: DateTime.now(),
            };

            socket.emit("init", this.dto(), user.id);
            this.broadcastExcept(user.id, "memberJoin", this.sessions[user.id].member);

            log('User(%d) joined room("%s")', user.id, this.id);
        }

        if (this.sessions[user.id].disconnectTimer) {
            this.sessions[user.id].disconnectTimer!.stop();
            this.sessions[user.id].disconnectTimer = undefined;
        }

        socket.on(
            "disconnect",
            catchErrors()((reason: DisconnectReason) => {
                this.handleDisconnect(user.id, reason);
            })
        );

        if (
            this._gameState.status === GameStatus.NotStarted &&
            this.numberOfConnectedMembers() >= 2 &&
            this.sessions[this.hostID].member.state.connected
        ) {
            this.startGame();
        } else if (this._gameState.status === GameStatus.InProgress) {
            if (user.id === this.whitePlayerID || user.id === this.blackPlayerID) {
                this.subscribeToEvents(this.sessions[user.id]);
            }
        }

        this.emit("connectedUsersChange");
    };

    private readonly handleInactivityTimeout = (): void => {
        log('room("%s") will be destroyed due to reaching an inactivity timeout', this.id);
        this.emit("destroy");
    };

    private readonly saveGame = async (): Promise<void> => {
        if (this._gameState.status !== GameStatus.Finished) {
            throw new Error("Game is not finished yet");
        }
        if (this.isFake) {
            return;
        }

        log('Saving played game in room("%s") to the database', this.id);

        const gameState = this.gameState();

        let winner: Color | null = null;
        if (gameState.winnerID === this.whitePlayerID) {
            winner = Color.White;
        } else if (gameState.winnerID === this.blackPlayerID) {
            winner = Color.Black;
        }

        await PlayedGame.create(
            {
                id: this.id,
                timerEnabled: this.gameRules.timer,
                timerInit: this.gameRules.initialTime || 0,
                timerIncrement: this.gameRules.timerIncrement || 0,
                pgn: gameState.pgn,
                resolution: gameState.resolution!,
                winner: winner,
                whitePlayerID: this.whitePlayerID!,
                blackPlayerID: this.blackPlayerID!,
            },
            {}
        );
    };

    private readonly handleDisconnectTimeout = async (userID: number): Promise<void> => {
        this._gameState.resolution = GameResolution.PlayerQuit;
        this._gameState.winnerID = userID === this.whitePlayerID ? this.blackPlayerID : this.whitePlayerID;

        log('Player(%d) quit in room("%s")', userID, this.id);
        this._gameState.status = GameStatus.Finished;
        this.whiteTimer?.pause();
        this.blackTimer?.pause();
        for (const session of Object.values(this.sessions)) {
            session.disconnectTimer?.stop();
        }
        if (this.gameRules.timer) {
            this.broadcast("gameEnd", this._gameState.resolution!, this._gameState.winnerID, this.timer);
        } else {
            this.broadcast("gameEnd", this._gameState.resolution!, this._gameState.winnerID);
        }

        this.emit("gameStatusChange");

        this.checkInactivity();
        await this.saveGame();
    };

    private readonly checkInactivity = (): void => {
        if (this.numberOfConnectedMembers() === 0) {
            if (this.gameStatus === GameStatus.NotStarted) {
                this.inactivityTimer.start(InactivityTimeout);
            } else if (this.gameStatus === GameStatus.Finished) {
                this.emit("destroy");
            }
        }
    };

    private readonly handleDisconnect = (userID: number, reason: DisconnectReason): void => {
        log('User(%d) was disconnected with reason: "%s"', userID, reason);

        if (this.sessions[userID].member.state.isPlayer) {
            this.sessions[userID].member.state.connected = false;
            this.sessions[userID].socket = null;
            this.broadcast("memberUpdate", userID, this.sessions[userID].member.state);

            if (this.gameStatus === GameStatus.InProgress) {
                this.sessions[userID].disconnectTimer = new PausableTimer(
                    catchErrors()(() => {
                        this.handleDisconnectTimeout(userID);
                    })
                );
                this.sessions[userID].disconnectTimer!.start(DisconnectTimeout);
            }
        } else {
            delete this.sessions[userID];
            this.broadcast("memberLeave", userID);
        }

        this.emit("connectedUsersChange");

        this.checkInactivity();
    };

    private readonly connectedSessions = (): MemberSession[] => {
        return Object.values(this.sessions).filter((session) => session.member.state.connected);
    };

    private readonly startGame = (): void => {
        this.selectOpponent();

        this.subscribeToEvents(this.sessions[this.whitePlayerID!]);
        this.subscribeToEvents(this.sessions[this.blackPlayerID!]);

        this._gameState.status = GameStatus.InProgress;

        if (this.gameRules.timer) {
            this.whiteTimer = new PausableTimer(
                catchErrors()(() => this.handleTimerOut(Color.White)),
                this.gameRules.initialTime! * 1000
            );
            this.blackTimer = new PausableTimer(
                catchErrors()(() => this.handleTimerOut(Color.Black)),
                this.gameRules.initialTime! * 1000
            );

            this.whiteTimer.start();
        }

        this.broadcast("gameStart");
        this.emit("gameStatusChange");

        log('Game started in room("%s")', this.id);
    };

    private readonly subscribeToEvents = (session: MemberSession): void => {
        const color = session.member.state.color!;
        session.socket!.on(
            "makeMove",
            catchErrors(session.socket!)((move: Move) => {
                this.handleMove(move, color);
            })
        );
        session.socket!.on(
            "giveUp",
            catchErrors(session.socket!)(() => {
                this.handleGiveUp(color);
            })
        );
    };

    private readonly selectOpponent = (): void => {
        const hostColor = this.sessions[this.hostID].member.state.color!;

        const connectedSessions = this.connectedSessions();
        const nonPlayerSessions = connectedSessions.filter((session) => !session.member.state.isPlayer);
        //Sort by date, the first one is in the end
        nonPlayerSessions.sort((a, b) => b.joined.toMillis() - a.joined.toMillis());

        const selectedSession = nonPlayerSessions.pop()!;
        selectedSession.member.state.isPlayer = true;
        selectedSession.member.state.color = ServerRoom.swapColor(hostColor);

        if (selectedSession.member.state.color === Color.White) {
            this.whitePlayerID = selectedSession.member.user.id;
        } else {
            this.blackPlayerID = selectedSession.member.user.id;
        }

        log(
            "Promoting user(%d) to player, his color is %s",
            selectedSession.member.user.id,
            selectedSession.member.state.color
        );

        this.broadcast("memberUpdate", selectedSession.member.user.id, selectedSession.member.state);
    };

    private readonly handleMove = (move: Move, color: Color): void => {
        if (this._gameState.status !== GameStatus.InProgress) {
            throw new IllegalMoveError("Game is not in progress");
        }

        if (this.chess.turn() !== color) {
            throw new IllegalMoveError("This was not your turn");
        }

        this.chess.move(move);

        if (this.gameRules.timer) {
            if (this.chess.turn() === Color.White) {
                this.whiteTimer!.start();
                this.blackTimer!.pause();

                this.blackTimer!.addTime(this.gameRules.timerIncrement! * 1000);
            } else {
                this.blackTimer!.start();
                this.whiteTimer!.pause();

                this.whiteTimer!.addTime(this.gameRules.timerIncrement! * 1000);
            }
            this.broadcast("move", move, this.timer);
        } else {
            this.broadcast("move", move);
        }

        log('Move from %s to %s was made in room("%s")', move.from, move.to, this.id);

        this.checkGameEnd();
    };

    private readonly handleGiveUp = async (color: Color): Promise<void> => {
        if (this.gameStatus !== GameStatus.InProgress) {
            return;
        }
        log('Game finished in room("%s"), because user gave up', this.id);

        this._gameState.resolution = GameResolution.GiveUp;
        this._gameState.winnerID = color === Color.White ? this.blackPlayerID : this.whitePlayerID;

        this._gameState.status = GameStatus.Finished;
        this.whiteTimer?.pause();
        this.blackTimer?.pause();
        for (const session of Object.values(this.sessions)) {
            session.disconnectTimer?.stop();
        }
        if (this.gameRules.timer) {
            this.broadcast("gameEnd", this._gameState.resolution!, this._gameState.winnerID, this.timer);
        } else {
            this.broadcast("gameEnd", this._gameState.resolution!, this._gameState.winnerID);
        }

        this.emit("gameStatusChange");

        this.checkInactivity();

        await this.saveGame();
    };

    private readonly checkGameEnd = async (): Promise<void> => {
        let finished: boolean = false;
        if (this.chess.isCheckmate()) {
            this._gameState.resolution = GameResolution.Checkmate;
            this._gameState.winnerID = this.chess.turn() === Color.White ? this.blackPlayerID : this.whitePlayerID;
            finished = true;
        } else if (this.chess.isStalemate()) {
            this._gameState.resolution = GameResolution.Stalemate;
            finished = true;
        } else if (this.chess.isDraw()) {
            this._gameState.resolution = GameResolution.Draw;
            finished = true;
        }

        if (finished) {
            log('Game finished in room("%s")', this.id);
            this._gameState.status = GameStatus.Finished;
            if (this.gameRules.timer) {
                this.broadcast("gameEnd", this._gameState.resolution!, this._gameState.winnerID, this.timer);
            } else {
                this.broadcast("gameEnd", this._gameState.resolution!, this._gameState.winnerID);
            }
            this.whiteTimer?.pause();
            this.blackTimer?.pause();
            for (const session of Object.values(this.sessions)) {
                session.disconnectTimer?.stop();
            }

            this.emit("gameStatusChange");

            this.checkInactivity();

            await this.saveGame();
        }
    };

    private readonly handleTimerOut = async (side: Color): Promise<void> => {
        log('Game finished in room("%s"), because the timer ran out', this.id);

        this.whiteTimer!.stop();
        this.blackTimer!.stop();
        for (const session of Object.values(this.sessions)) {
            session.disconnectTimer?.stop();
        }

        this._gameState.resolution = GameResolution.OutOfTime;
        this._gameState.winnerID = side === Color.White ? this.blackPlayerID : this.whitePlayerID;

        this._gameState.status = GameStatus.Finished;
        this.broadcast("gameEnd", this._gameState.resolution, this._gameState.winnerID, this.timer);
        this.emit("gameStatusChange");
        this.checkInactivity();

        await this.saveGame();
    };

    private readonly broadcast = <Ev extends EventNames<ServerToClientEvents>>(
        ev: Ev,
        ...args: EventParams<ServerToClientEvents, Ev>
    ): void => {
        for (const session of Object.values(this.sessions)) {
            session.socket?.emit(ev, ...args);
        }
    };

    private readonly broadcastExcept = <Ev extends EventNames<ServerToClientEvents>>(
        userID: number,
        ev: Ev,
        ...args: EventParams<ServerToClientEvents, Ev>
    ): void => {
        for (const session of Object.values(this.sessions)) {
            if (session.member.user.id !== userID) {
                session.socket?.emit(ev, ...args);
            }
        }
    };
}
