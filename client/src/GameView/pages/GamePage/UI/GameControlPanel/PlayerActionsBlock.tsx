import EmojiFlagsRoundedIcon from "@mui/icons-material/EmojiFlagsRounded";
import {Box, IconButton} from "@mui/material";
import type {FC, MouseEvent} from "react";

export type PlayerActionsBlockProps = {
    onGiveUp: (event: MouseEvent<HTMLElement>) => void;
};

export const PlayerActionsBlock: FC<PlayerActionsBlockProps> = ({onGiveUp}) => {
    return (
        <Box>
            <IconButton
                key="give-up"
                aria-label="Give Up"
                size="small"
                sx={{color: "text.disabled"}}
                onClick={onGiveUp}>
                <EmojiFlagsRoundedIcon />
            </IconButton>
        </Box>
    );
};
