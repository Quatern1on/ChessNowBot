import {Box, Stack, Typography} from "@mui/material";
import {FC, ReactNode, useEffect, useRef, useState} from "react";

import {Member} from "@/GameClient/DataModel";
import {PlayerTimer} from "@/GameView/pages/GamePage/UI/PlayerBar/PlayerTimer";
import {UserAvatar} from "@/UI";
import {ThinkingIndicator} from "@/UI";

export type PlayerBarProps = {
    member: Member;
    turnIndicator: boolean;
    timeLeft?: number;
    timerGoing?: boolean;
};

export const PlayerBar: FC<PlayerBarProps> = ({member, turnIndicator, timeLeft, timerGoing}) => {
    const turnIndicatorBackground = turnIndicator ? {bgcolor: "background.paper"} : {bgcolor: "background.default"};
    let timerNode: ReactNode = null;
    if (timeLeft !== undefined && timerGoing !== undefined) {
        timerNode = <PlayerTimer timeLeft={timeLeft} going={timerGoing} turnIndicator={turnIndicator} />;
    } else {
        if (turnIndicator) {
            timerNode = <ThinkingIndicator />;
        }
    }

    const rootRef = useRef<HTMLObjectElement>(null);

    const [avatarSize, setAvatarSize] = useState<number>(1);

    useEffect(() => {
        if (rootRef.current?.offsetHeight) {
            const resizeObserver = new ResizeObserver((entries) => {
                setAvatarSize(entries[0].contentRect.height);
            });
            resizeObserver.observe(rootRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);

    return (
        <Stack
            ref={rootRef}
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            sx={{
                p: 1,
                flexGrow: 1,
                flexShrink: 0,
                flexBasis: 46,
                maxHeight: 70,
                position: "relative",
                transition: "background-color .2s ease-in-out",
                ...turnIndicatorBackground,
            }}>
            <Box
                sx={(theme) => ({
                    position: "absolute",
                    left: theme.spacing(1),
                    top: theme.spacing(1),
                })}>
                <UserAvatar
                    sx={{
                        width: avatarSize,
                        height: avatarSize,
                        fontSize: avatarSize / 3,
                    }}
                    user={member.user}
                    online={member.state.connected}
                    paperBackground={turnIndicator}
                />
            </Box>
            {timerNode}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                gap={1}
                sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                }}>
                <Typography variant="subtitle2">{member.user.fullName}</Typography>
            </Stack>
        </Stack>
    );
};
