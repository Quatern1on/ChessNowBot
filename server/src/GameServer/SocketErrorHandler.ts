import debug from "debug";

import {Socket} from "@/GameServer/GameServer";

const log = debug("GameServer:SocketErrorHandler");

type CallbackType<CallbackParameters extends any[]> = (...args: CallbackParameters) => void | Promise<void>;

export const catchErrors = <CallbackParameters extends any[]>(socket?: Socket) => {
    return (callback: CallbackType<CallbackParameters>): CallbackType<CallbackParameters> => {
        const handleError = (err: unknown) => {
            if (err instanceof Error) {
                if (socket && socket.connected) {
                    let name = err.name;
                    const message = err.message;

                    if (!name) {
                        name = "Unknown";
                    }

                    try {
                        socket.emit("error", name, message);
                        socket.disconnect();
                        log("Socket was disconnected due to error: %O", err);
                    } catch (e) {
                        log("A new error was thrown while handling error: %O", e);
                    }
                } else {
                    if (socket) {
                        log("An error happened, but no socket was provided: %O", err);
                    } else {
                        log("An error happened, but socket is already disconnected: %O", err);
                    }
                }
            } else {
                if (socket && socket.connected) {
                    try {
                        socket.disconnect();
                    } catch (e) {
                        log("A new error was thrown while closing the connection: %O", e);
                    }
                }
                log("Thrown error was not an instance of Error class: %o", err);
            }
        };

        return (...args: CallbackParameters): void | Promise<void> => {
            try {
                const ret = callback.apply(this, args);
                if (ret && typeof ret.catch === "function") {
                    // async handler
                    ret.catch(handleError);
                }
                return ret;
            } catch (e) {
                // sync handler
                handleError(e);
            }
        };
    };
};
