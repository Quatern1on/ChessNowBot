import {Stack} from "@mui/material";
import {FC, MouseEvent, useState} from "react";

import {GameStatus, Member} from "@/GameClient/DataModel";
import {ClientRoom} from "@/GameClient/GameClient";
import {GiveUpPopup} from "@/GameView/pages/GamePage/UI/GameControlPanel/GiveUpPopup";
import {PlayerActionsBlock} from "@/GameView/pages/GamePage/UI/GameControlPanel/PlayerActionsBlock";
import {SpectatorsBlock} from "@/GameView/pages/GamePage/UI/GameControlPanel/SpectatorsBlock";

export type GameControlPanelProps = {
    room: ClientRoom;
    onGiveUp: () => void;
};

const filterSpectators = (members: {[key: number]: Member}): Member[] => {
    return Object.values(members).filter((member) => !member.state.isPlayer);
};

const sortMembers = (members: Member[], currentUserId) => {
    return members.sort((a, b) => (b.user.id === currentUserId ? 1 : -1));
};

export const GameControlPanel: FC<GameControlPanelProps> = ({room, onGiveUp}) => {
    const [giveUpOpen, setGiveUpOpen] = useState(false);
    const [giveUpAnchor, setGiveUpAnchor] = useState<null | HTMLElement>(null);

    const handleGiveUpClick = (event: MouseEvent<HTMLElement>) => {
        setGiveUpAnchor(event.currentTarget);
        setGiveUpOpen((previousOpen) => !previousOpen);
    };

    const handleGiveUpConfirm = () => {
        setGiveUpOpen(false);
        onGiveUp();
    };

    const handleGiveUpClose = () => {
        setGiveUpOpen(false);
    };

    const spectators = filterSpectators(room.members);
    const sortedSpectators = sortMembers(spectators, room.me.user.id);
    const isSpectatorsPresent = spectators.length > 0;

    const isPlayerActionsVisible = room.gameState.status === GameStatus.InProgress && room.me.state.isPlayer;

    if (!isSpectatorsPresent && !isPlayerActionsVisible) {
        return null;
    }

    return (
        <Stack
            justifyContent={isPlayerActionsVisible ? "space-between" : "flex-end"}
            sx={{px: 1, height: 34, flexShrink: 0}}
            direction="row">
            {isPlayerActionsVisible ? <PlayerActionsBlock onGiveUp={handleGiveUpClick} /> : null}
            {isSpectatorsPresent ? <SpectatorsBlock spectators={sortedSpectators} /> : null}

            <GiveUpPopup
                open={giveUpOpen}
                anchorEl={giveUpAnchor}
                onCancel={handleGiveUpClose}
                onGiveUp={handleGiveUpConfirm}
            />
        </Stack>
    );
};
