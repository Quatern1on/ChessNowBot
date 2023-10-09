import {CircularProgress, Stack, Typography} from "@mui/material";
import type {FC} from "react";
import {useTranslation} from "react-i18next";

export const ConnectingPage: FC = () => {
    const {t} = useTranslation();
    return (
        <Stack alignItems="center" justifyContent="center" spacing={1} sx={{height: "100%"}}>
            <CircularProgress sx={{color: "text.disabled"}} />
            <Typography variant="caption" color="text.disabled">
                {t("game.connecting")}
            </Typography>
        </Stack>
    );
};
