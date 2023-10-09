import {Box} from "@mui/material";
import {FC} from "react";

export const ThinkingIndicator: FC = () => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                gap: "6px",
                color: "primary.main",
                alignItems: "center",

                "& div": {
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    bgcolor: "currentColor",

                    animation: "bounce .8s infinite ease-in-out",

                    "&:nth-of-type(2)": {
                        animationDelay: "0.1s",
                    },
                    "&:nth-of-type(3)": {
                        animationDelay: "0.2s",
                    },
                },

                "@keyframes bounce": {
                    "25%": {
                        transform: "scale(1)",
                    },
                    "50%": {
                        transform: "scale(1.5)",
                    },
                    "75%": {
                        transform: "scale(1)",
                    },
                },
            }}>
            <div />
            <div />
            <div />
        </Box>
    );
};
