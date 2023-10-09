import {FC, useEffect, useMemo, useState} from "react";

import moveSound from "@/assets/audio/move.wav";
import {GameStatus} from "@/GameClient/DataModel";
import {ClientState, GameClient} from "@/GameClient/GameClient";

import {ConnectingPage, ErrorPage, GamePage, WaitingPage} from "./pages";

const moveSoundPlayer = new Audio(moveSound);

export const GameView: FC = () => {
    const [clientState, setClientState] = useState<ClientState>();

    const client = useMemo(() => new GameClient(), []);

    const handleAnyUpdate = (state: ClientState) => {
        setClientState({...state});
    };

    const handleMove = () => {
        moveSoundPlayer.play();
    };

    useEffect(() => {
        client.on("anyUpdate", handleAnyUpdate);
        client.on("move", handleMove);

        return () => {
            client.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!clientState) {
        return <ConnectingPage />;
    }

    const error = clientState.error;
    const connected = clientState.connected;
    const room = clientState.room;
    const makingMove = clientState.makingMove;

    if (error.isError) {
        return <ErrorPage />;
    }

    if (!connected || !room) {
        return <ConnectingPage />;
    }

    if (room.gameState.status === GameStatus.NotStarted) {
        return <WaitingPage room={room} />;
    }

    return <GamePage room={room} makingMove={makingMove} gameClient={client} />;
};
