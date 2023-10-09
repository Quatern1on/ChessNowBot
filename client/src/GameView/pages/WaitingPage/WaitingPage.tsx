import {AvatarGroup, Divider, Stack, Typography} from "@mui/material";
import React from "react";
import {useTranslation} from "react-i18next";

import {ClientRoom} from "@/GameClient/GameClient";
import {UserAvatar} from "@/UI";

export interface WaitingForUserProps {
    room: ClientRoom;
}

export const WaitingPage: React.FC<WaitingForUserProps> = ({room}) => {
    const {t} = useTranslation();

    const isHost = room.hostID === room.me.user.id;
    const host = room.members[room.hostID];

    let avatars;
    let text;

    if (isHost) {
        text = t("game.waitingForAnyone");
        avatars = <UserAvatar user={room.me.user} sx={{width: 48, height: 48}} online />;
    } else {
        text = t("game.waitingForUser", {user: host.user.fullName});

        const presentUsers = Object.values(room.members)
            .sort((a) => (a.user.id === room.me.user.id ? -1 : 1))
            .filter((member) => member.user.id !== room.hostID)
            .map((member) => (
                <UserAvatar user={member.user} sx={{width: 48, height: 48}} online={member.state.connected} />
            ));

        avatars = (
            <Stack direction="row" spacing={2}>
                <AvatarGroup max={4}>{presentUsers}</AvatarGroup>
                <Divider orientation="vertical" />
                <UserAvatar user={host.user} sx={{width: 48, height: 48}} online={host.state.connected} />
            </Stack>
        );
    }

    return (
        <Stack alignItems="center" justifyContent="center" spacing={1} sx={{height: "100%"}}>
            {avatars}
            <Typography variant="caption" color="text.disabled">
                {text}
            </Typography>
        </Stack>
    );
};
