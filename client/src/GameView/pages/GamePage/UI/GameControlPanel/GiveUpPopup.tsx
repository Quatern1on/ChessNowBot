import {Button, DialogActions, DialogContent, DialogTitle, Popover} from "@mui/material";
import type {FC} from "react";
import {useTranslation} from "react-i18next";

export type GiveUpPopupProps = {
    open: boolean;
    anchorEl: HTMLElement | null;
    onCancel: () => void;
    onGiveUp: () => void;
};

export const GiveUpPopup: FC<GiveUpPopupProps> = ({open, anchorEl, onCancel, onGiveUp}) => {
    const {t} = useTranslation();

    return (
        <Popover
            slotProps={{
                paper: {
                    variant: "outlined",
                },
            }}
            open={open}
            anchorEl={anchorEl}
            onClose={onCancel}
            sx={{
                zIndex: 2,
            }}
            anchorOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
            TransitionProps={{
                timeout: {enter: 300, exit: 0},
            }}
            transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}>
            <DialogTitle>{t("game.giveUpPopup.title")}</DialogTitle>
            <DialogContent>{t("game.giveUpPopup.content")}</DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>{t("game.giveUpPopup.cancel")}</Button>
                <Button color="error" onClick={onGiveUp}>
                    {t("game.giveUpPopup.confirm")}
                </Button>
            </DialogActions>
        </Popover>
    );
};
