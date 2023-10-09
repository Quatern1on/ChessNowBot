import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide} from "@mui/material";
import {TransitionProps} from "@mui/material/transitions";
import {FC, forwardRef, ReactElement, Ref} from "react";
import {useTranslation} from "react-i18next";

import {GameResolution, GameStatus, User} from "@/GameClient/DataModel";
import {ClientRoom} from "@/GameClient/GameClient";

export type GameResultPopupProps = {
    isOpen: boolean;
    room: ClientRoom;
    onClose: () => void;
};

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: ReactElement<any, any>;
    },
    ref: Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const GameResultPopup: FC<GameResultPopupProps> = ({isOpen, room, onClose}) => {
    const {t} = useTranslation();

    if (room.gameState.status !== GameStatus.Finished) {
        return null;
    }

    const rematch = () => {
        window.Telegram.WebApp.switchInlineQuery(" ");
    };

    const resolution = room.gameState.resolution;

    let title: string;
    let explanation: string;
    const showRematchButton: boolean = room.me.state.isPlayer;
    if (room.me.state.isPlayer) {
        if (
            resolution === GameResolution.Checkmate ||
            resolution === GameResolution.OutOfTime ||
            resolution === GameResolution.PlayerQuit ||
            resolution === GameResolution.GiveUp
        ) {
            const resultKey = room.me.user.id === room.gameState.winner!.id ? "victory" : "defeat";
            title = t(`gameResult.${resultKey}.title`);
            explanation = t(`gameResult.${resultKey}.explanation.${resolution}`);
        } else {
            title = t("gameResult.draw.title");
            explanation = t(`gameResult.draw.explanation.${resolution}`);
        }
    } else {
        const winner: User | undefined = room.gameState.winner;
        let loser: User | undefined;
        if (winner) {
            if (winner.id === room.whitePlayer!.user.id) {
                loser = room.blackPlayer!.user;
            } else {
                loser = room.whitePlayer!.user;
            }
        }

        title = t("gameResult.spectator.title");
        explanation = t(`gameResult.spectator.explanation.${resolution}`, {
            winner: winner?.fullName,
            loser: loser?.fullName,
        });
    }

    return (
        <Dialog fullWidth onClose={onClose} open={isOpen} TransitionComponent={Transition} PaperProps={{elevation: 0}}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{explanation}</DialogContentText>
            </DialogContent>
            <DialogActions sx={{justifyContent: "center"}}>
                {showRematchButton && (
                    <Button onClick={rematch} fullWidth>
                        {t("gameResult.rematch")}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
