import config from "config";
import debug from "debug";
import http from "http";
import https from "https";
import * as SocketIO from "socket.io";

import {UserProfile} from "@/GameServer/Database";
import {AuthPayload, ClientToServerEvents, GameRules, ServerToClientEvents, User} from "@/GameServer/DataModel";
import {AuthError, RoomNotFoundError} from "@/GameServer/Errors";
import {ServerRoom} from "@/GameServer/ServerRoom";
import {catchErrors} from "@/GameServer/SocketErrorHandler";
import {bot} from "@/index";
import {joinFullName} from "@/Telegram/joinFullname";
import {parseInitData} from "@/Telegram/parseInitData";
import {WebAppInitData} from "@/Telegram/Types";

const log = debug("GameServer");

export type Server = SocketIO.Server<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    Record<string, never>
>;
export type Socket = SocketIO.Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    Record<string, never>
>;

export class GameServer {
    private readonly io: Server;

    private readonly rooms: {[key: string]: ServerRoom};

    private readonly validateInitData: boolean;

    constructor(server?: http.Server | https.Server) {
        this.io = new SocketIO.Server(server, {
            cors: {
                origin: "*",
            },
            pingInterval: 2000,
            pingTimeout: 2000,
            transports: ["polling", "websocket"],
        });

        this.rooms = {};

        this.validateInitData = config.get<boolean>("gameServer.validateInitData");

        this.io.on("connect", (socket: Socket) => {
            catchErrors(socket)(this.handleConnection)(socket);
        });

        log("GameServer instance was created");

        if (config.get<boolean>("gameServer.fakeRoom.create")) {
            const id = config.get<string>("gameServer.fakeRoom.id");
            const host = config.get<User>("gameServer.fakeRoom.host");
            const fakeRoomGameRules = config.get<GameRules>("gameServer.fakeRoom.gameRules");

            this.createRoom(host, fakeRoomGameRules, id);
            log('Fake room("%s") was created', id);
        }
    }

    public get roomCount(): number {
        return Object.keys(this.rooms).length;
    }

    public createRoom = (host: User, gameRules: GameRules, id?: string): ServerRoom => {
        const room = new ServerRoom(host, gameRules, id);
        this.rooms[room.id] = room;
        room.on("destroy", () => {
            this.handleRoomDestroy(room.id);
        });
        return room;
    };

    private handleRoomDestroy = async (roomID: string) => {
        delete this.rooms[roomID];
        log('Room("%s") was destroyed', roomID);
    };

    private handleConnection = async (socket: Socket) => {
        log("New connection");

        const authPayload = socket.handshake.auth as AuthPayload;

        const initData: WebAppInitData = parseInitData(authPayload.initData, this.validateInitData);

        const roomID = initData.start_param;

        if (!roomID) {
            throw new AuthError('Launched with no "startapp" param');
        }

        if (!initData.user) {
            throw new AuthError("Information about the user was not provided");
        }

        if (!this.rooms[roomID]) {
            throw new RoomNotFoundError(`Room with id "${roomID}" was not found`);
        }

        const user: User = {
            id: initData.user.id,
            fullName: joinFullName(initData.user.first_name, initData.user.last_name),
            username: initData.user.username,
            avatarURL: await bot.getAvatar(initData.user.id),
        };

        await UserProfile.upsert({
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            languageCode: initData.user.language_code,
        });

        log("User(%d: %s) trying to connect to room %s", user.id, user.fullName, roomID);

        //The user may have already disconnected while the server was retrieving his profile picture
        if (socket.connected) {
            this.rooms[roomID].acceptConnection(socket, user);
        }
    };
}
