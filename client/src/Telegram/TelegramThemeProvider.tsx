import {createTheme, CssBaseline, Theme, ThemeProvider} from "@mui/material";
import {ThemeOptions} from "@mui/material/styles/createTheme";
import React, {FC, ReactNode, useEffect, useState} from "react";

const generateTheme = (): Theme => {
    const telegramTheme = {
        colorScheme: window.Telegram.WebApp.colorScheme,
        bg_color: window.Telegram.WebApp.themeParams.bg_color,
        text_color: window.Telegram.WebApp.themeParams.text_color,
        hint_color: window.Telegram.WebApp.themeParams.hint_color,
        link_color: window.Telegram.WebApp.themeParams.link_color,
        button_color: window.Telegram.WebApp.themeParams.button_color,
        button_text_color: window.Telegram.WebApp.themeParams.button_text_color,
        secondary_bg_color: window.Telegram.WebApp.themeParams.secondary_bg_color,
    };

    const themeOptions: ThemeOptions = {
        palette: {
            mode: telegramTheme.colorScheme,
        },
        components: {
            MuiSwitch: {
                defaultProps: {
                    disableRipple: true,
                },
                styleOverrides: {
                    root: ({ownerState, theme}) => ({
                        width: 52,
                    }),
                    switchBase: ({ownerState, theme}) => ({
                        padding: "10px",
                        "&:hover": {
                            background: "none",
                        },
                        "&.Mui-checked": {
                            transform: "translateX(13px)",
                            color: theme.palette.primary.main,
                            "&:hover": {
                                background: "none",
                            },
                            "& + .MuiSwitch-track": {
                                opacity: 1,
                            },
                            "& .MuiSwitch-thumb": {
                                borderColor: theme.palette.primary.main,
                            },
                        },
                    }),
                    thumb: ({ownerState, theme}) => ({
                        background: theme.palette.background.default,
                        border: "solid 2px",
                        borderColor: theme.palette.text.disabled,
                        opacity: 1,
                        boxShadow: "none",
                        transition: "border-color .3s ease-in-out",
                        width: 18,
                        height: 18,

                        "&.Mui-checked": {
                            borderColor: theme.palette.primary.main,
                        },
                    }),
                    track: ({ownerState, theme}) => ({
                        background: theme.palette.text.disabled,
                        transition: "background-color .3s ease-in-out",
                        opacity: 1,
                    }),
                },
            },
            MuiSlider: {
                styleOverrides: {
                    rail: ({ownerState, theme}) => ({
                        height: 3,
                        background: theme.palette.text.disabled,
                        opacity: 1,
                    }),
                    track: ({ownerState, theme}) => ({
                        height: 3,
                        border: 0,
                        background: theme.palette.primary.main,
                    }),
                    thumb: {
                        width: 15,
                        height: 15,
                    },
                },
            },
        },
    };

    if (telegramTheme.button_color && telegramTheme.button_text_color) {
        themeOptions.palette!.primary = {
            main: telegramTheme.button_color,
            contrastText: telegramTheme.button_text_color,
        };
        themeOptions.palette!.secondary = {
            main: telegramTheme.button_color,
            contrastText: telegramTheme.button_text_color,
        };
    }

    if (telegramTheme.bg_color && telegramTheme.secondary_bg_color) {
        themeOptions.palette!.background = {
            default: telegramTheme.bg_color,
            paper: telegramTheme.secondary_bg_color,
        };
    }

    if (telegramTheme.text_color) {
        themeOptions.palette!.text = {
            primary: telegramTheme.text_color,
            secondary: telegramTheme.text_color,
        };

        if (telegramTheme.hint_color) {
            themeOptions.palette!.text.disabled = telegramTheme.hint_color;
        }
    }

    return createTheme(themeOptions);
};

type ThemeProviderProps = {
    children?: ReactNode;
};

export const TelegramThemeProvider: FC<ThemeProviderProps> = ({children}) => {
    const [theme, setTheme] = useState(() => generateTheme());

    useEffect(() => {
        const handleThemeChange = () => {
            setTheme(generateTheme());
        };

        window.Telegram.WebApp.onEvent("themeChanged", handleThemeChange);

        return () => {
            window.Telegram.WebApp.offEvent("themeChanged", handleThemeChange);
        };
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};
