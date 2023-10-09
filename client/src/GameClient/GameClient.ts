import * as ChessJS from "chess.js";
import {Chess} from "chess.js";
import * as SocketIO from "socket.io-client";

import {
    ClientToServerEvents,
    Color,
    GameResolution,
    GameState,
    GameStatus,
    Member,
    MemberState,
    Move,
    PieceSymbol,
    Room,
    ServerToClientEvents,
    Square,
    TimerState,
    User,
} from "@/GameClient/DataModel";
import {TypedEventEmitter} from "@/GameClient/TypedEventEmitter";

export interface ErrorState {
    isError: boolean;
    serverSide?: boolean;
    name?: string;
    message?: string;
}

export interface GameClientEvents {
    errorUpdate: [serverSide: boolean, name: string, message: string];
    anyUpdate: [state: ClientState];
    move: [move: Move];
}

export interface ClientRoom extends Omit<Room, "members" | "gameState"> {
    members: {[key: number]: Member};
    gameState: ClientGameState;
    me: Member;
    opponent?: Member;
    whitePlayer?: Member;
    blackPlayer?: Member;
}

export interface ClientGameState extends Omit<GameState, "pgn"> {
    fen: string;
    lastMove?: Move;
    winner?: User;
}

export interface ClientState {
    room?: ClientRoom;
    error: ErrorState;
    makingMove: boolean;
    connected: boolean;
}

export interface PossibleMove {
    to: Square;
    promotion: boolean;
}

type Socket = SocketIO.Socket<ServerToClientEvents, ClientToServerEvents>;

export class GameClient extends TypedEventEmitter<GameClientEvents> {
    private _state: ClientState;

    private readonly socket: Socket;

    private readonly chess: Chess;

    public static swapColor(color: Color): Color {
        return color === Color.White ? Color.Black : Color.White;
    }

    public constructor() {
        super();

        this.socket = SocketIO.io(import.meta.env.VITE_SERVER_URL, {
            auth: {
                initData: window.Telegram.WebApp.initData || window.fakeInitData,
            },
            transports: ["polling", "websocket"],
        });
        this.chess = new Chess();

        this._state = {
            connected: false,
            error: {isError: false},
            makingMove: false,
        };

        this.socket.on("error", this.handleServerError);
        this.socket.on("init", this.handleInit);
        this.socket.on("memberJoin", this.handleMemberJoin);
        this.socket.on("memberLeave", this.handleMemberLeave);
        this.socket.on("memberUpdate", this.handleMemberUpdate);
        this.socket.on("gameStart", this.handleGameStart);
        this.socket.on("gameEnd", this.handleGameEnd);
        this.socket.on("move", this.handleMove);
        this.socket.on("disconnect", this.handleDisconnect);
    }

    get state(): ClientState {
        return this._state;
    }

    public readonly makeMove = (move: Move): boolean => {
        if (
            this.chess.turn() !== this._state.room!.me.state.color ||
            this._state.room!.gameState.status !== GameStatus.InProgress
        ) {
            return false;
        }

        try {
            this.chess.move(move);
            this._state.makingMove = true;
            this.socket.emit("makeMove", move);
            this.chess.undo();
            return true;
        } catch (e) {
            return false;
        }
    };

    public readonly disconnect = () => {
        this.socket.disconnect();
        this._state.connected = false;

        this.emit("anyUpdate", this._state);
    };

    public getPossibleMoves = (from: Square): PossibleMove[] => {
        const squareToMoveMap: {[key: string]: PossibleMove} = {};
        const moves = this.chess.moves({verbose: true, square: from});
        for (const move of moves) {
            if (!squareToMoveMap[move.to]) {
                squareToMoveMap[move.to] = {
                    to: move.to as Square,
                    promotion: false,
                };
            }

            if (move.promotion) {
                squareToMoveMap[move.to].promotion = true;
            }
        }

        return Object.values(squareToMoveMap);
    };

    public getCheck = (): Square | undefined => {
        if (this.chess.inCheck()) {
            const board = this.chess.board();
            const color = this.chess.turn();
            for (const row of board) {
                for (const square of row) {
                    if (square?.type === ChessJS.KING && square.color === color) {
                        return square.square as Square;
                    }
                }
            }
        }
    };

    public getPieceColor = (square: Square): Color | undefined => {
        return this.chess.get(square as ChessJS.Square).color as Color;
    };

    public readonly giveUp = (): void => {
        this.socket.emit("giveUp");
    };

    private readonly handleServerError = (name: string, message: string): void => {
        this._state.error.isError = true;
        this._state.error.serverSide = true;
        this._state.error.name = name;
        this._state.error.message = message;

        this.emit("errorUpdate", true, name, message);
        this.emit("anyUpdate", this._state);
    };

    private readonly findPlayers = (): void => {
        const me = this._state.room!.me;

        for (const member of Object.values(this._state.room!.members)) {
            if (member.user.id !== me.user.id && member.state.isPlayer && me.state.isPlayer) {
                this._state.room!.opponent = member;
            }
            if (member.state.isPlayer && member.state.color === Color.White) {
                this._state.room!.whitePlayer = member;
            }
            if (member.state.isPlayer && member.state.color === Color.Black) {
                this._state.room!.blackPlayer = member;
            }
        }
    };

    private readonly handleInit = (room: Room, userID: number): void => {
        const membersDict = {};
        let me: Member;
        const opponent: Member | undefined = undefined;

        for (const member of room.members) {
            membersDict[member.user.id] = member;
            if (member.user.id === userID) {
                me = member;
            }
        }

        this.chess.loadPgn(room.gameState.pgn);

        const clientGameState: ClientGameState = {
            ...room.gameState,
            fen: this.chess.fen(),
        };

        const history = this.chess.history({verbose: true});
        const lastHistoryEntry = history[history.length - 1];
        if (lastHistoryEntry) {
            clientGameState.lastMove = {
                from: lastHistoryEntry.from as Square,
                to: lastHistoryEntry.to as Square,
                promotion: lastHistoryEntry.promotion as PieceSymbol,
            };
        }

        if (room.gameState.winnerID) {
            clientGameState.winner = membersDict[room.gameState.winnerID].user;
        }

        const clientRoom: ClientRoom = {
            id: room.id,
            members: membersDict,
            hostID: room.hostID,
            createdTimestamp: room.createdTimestamp,
            gameRules: room.gameRules,
            gameState: clientGameState,
            me: me!,
            opponent: opponent,
        };

        this._state.makingMove = false;
        this._state.error = {isError: false};
        this._state.connected = true;
        this._state.room = clientRoom;

        this.findPlayers();

        this.emit("anyUpdate", this._state);
    };

    private readonly handleMemberJoin = (member: Member): void => {
        this._state.room!.members[member.user.id] = member;
        this.findPlayers();
        this.emit("anyUpdate", this._state);
    };

    private readonly handleMemberLeave = (userID: number): void => {
        delete this._state.room!.members[userID];
        this.emit("anyUpdate", this._state);
    };

    private readonly handleMemberUpdate = (userID: number, state: MemberState): void => {
        this._state.room!.members[userID].state = state;
        this.findPlayers();
        this.emit("anyUpdate", this._state);
    };

    private readonly handleGameStart = (): void => {
        this._state.room!.gameState.status = GameStatus.InProgress;
        if (this._state.room!.gameRules.timer) {
            this._state.room!.gameState.timer = {
                whiteTimeLeft: this._state.room!.gameRules.initialTime! * 1000,
                blackTimeLeft: this._state.room!.gameRules.initialTime! * 1000,
            };
        }
        this.emit("anyUpdate", this._state);
    };

    private readonly handleGameEnd = (resolution: GameResolution, winnerID?: number, timer?: TimerState): void => {
        this._state.room!.gameState.status = GameStatus.Finished;
        this._state.room!.gameState.resolution = resolution;
        this._state.room!.gameState.winnerID = winnerID;
        if (winnerID) {
            this._state.room!.gameState.winner = this._state.room!.members[winnerID].user;
        }
        if (timer) {
            this._state.room!.gameState.timer = timer;
        }
        this.emit("anyUpdate", this._state);
    };

    private readonly handleMove = (move: Move, timer?: TimerState): void => {
        this.chess.move(move);

        this._state.room!.gameState.fen = this.chess.fen();
        this._state.room!.gameState.turn = this.chess.turn() as Color;
        this._state.room!.gameState.lastMove = move;
        this._state.makingMove = false;
        if (timer) {
            this._state.room!.gameState.timer = timer;
        }

        this.emit("move", move);
        this.emit("anyUpdate", this._state);
    };

    private readonly handleDisconnect = (): void => {
        this._state.room = undefined;
        this._state.connected = false;
        this.emit("anyUpdate", this._state);
    };
}
