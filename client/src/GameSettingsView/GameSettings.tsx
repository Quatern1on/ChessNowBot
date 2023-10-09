import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import {Collapse, Container} from "@mui/material";
import {FC, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

import {
    ColorPicker,
    ColorPickerValueType,
    Menu,
    MenuDivider,
    MenuItem,
    MenuItemSlider,
    MenuItemSwitch,
} from "@/UI/Telegram";

const initTimeSlider = [
    {text: "1/4", value: 15},
    {text: "1/2", value: 30},
    {text: "3/4", value: 45},
    {text: "1", value: 60},
    {text: "2", value: 60 * 2},
    {text: "3", value: 60 * 3},
    {text: "5", value: 60 * 5},
    {text: "10", value: 60 * 10},
    {text: "15", value: 60 * 15},
    {text: "20", value: 60 * 20},
    {text: "30", value: 60 * 30},
    {text: "45", value: 60 * 45},
    {text: "60", value: 60 * 60},
    {text: "90", value: 60 * 90},
    {text: "120", value: 60 * 120},
    {text: "180", value: 60 * 180},
];

const incrementTimeSlider = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 35, 40, 45, 50, 55, 60, 90, 120,
    150, 180,
];

export const GameSettingsView: FC = () => {
    const {t} = useTranslation();

    const [enableTimer, setEnableTimer] = useState(true);
    const [initTimeIndex, setInitTimeIndex] = useState(7);
    const [incrementTimeIndex, setIncrementTimeIndex] = useState(0);
    const [playerColor, setPlayerColor] = useState<ColorPickerValueType>("random");

    useEffect(() => {
        window.Telegram.WebApp.MainButton.setText(t("settings.done"));
        window.Telegram.WebApp.MainButton.show();
    }, [t]);

    useEffect(() => {
        const generateInlineQuery = (): string => {
            let timerToken = enableTimer ? "1:" : "0:";

            if (enableTimer) {
                timerToken += initTimeSlider[initTimeIndex].value.toString() + ":";
                timerToken += incrementTimeSlider[incrementTimeIndex].toString() + ":";
            }

            const colorToken = playerColor.slice(0, 1);
            return "$" + timerToken + colorToken;
        };

        const handleMainButtonClick = () => {
            window.Telegram.WebApp.switchInlineQuery(generateInlineQuery());
        };

        window.Telegram.WebApp.MainButton.onClick(handleMainButtonClick);
        return () => {
            window.Telegram.WebApp.MainButton.offClick(handleMainButtonClick);
        };
    }, [enableTimer, initTimeIndex, incrementTimeIndex, playerColor]);

    return (
        <Container maxWidth="sm" sx={{p: 0, bgcolor: "background.paper", minHeight: "100vh"}}>
            <Menu>
                <MenuItemSwitch
                    onChange={setEnableTimer}
                    value={enableTimer}
                    icon={<TimerOutlinedIcon sx={{color: "text.disabled"}} />}
                    primary={t("settings.timer")}
                />
                <Collapse in={enableTimer}>
                    <MenuItemSlider
                        primary={t("settings.initTime")}
                        tooltip={initTimeSlider[initTimeIndex].text}
                        sliderProps={{
                            min: 0,
                            max: initTimeSlider.length - 1,
                            value: initTimeIndex,
                            onChange: (e, newValue) => {
                                setInitTimeIndex(newValue as number);
                            },
                        }}
                    />
                    <MenuItemSlider
                        primary={t("settings.increment")}
                        tooltip={incrementTimeSlider[incrementTimeIndex].toString()}
                        sliderProps={{
                            min: 0,
                            max: incrementTimeSlider.length - 1,
                            value: incrementTimeIndex,
                            onChange: (e, newValue) => {
                                setIncrementTimeIndex(newValue as number);
                            },
                        }}
                    />
                </Collapse>
                <MenuDivider />
                <MenuItem
                    icon={<SwapVertOutlinedIcon sx={{color: "text.disabled"}} />}
                    primary={t("settings.color")}
                    direction="column">
                    <ColorPicker value={playerColor} onChange={setPlayerColor} />
                </MenuItem>
            </Menu>
        </Container>
    );
};
