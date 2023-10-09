import {Button, FormControlLabel, Stack, styled} from "@mui/material";
import {FC} from "react";
import {useTranslation} from "react-i18next";

import {ReactComponent as KingOutlined} from "@/UI/Telegram/ColorPicker/assets/king-outlined.svg";
import {ReactComponent as QuestionMark} from "@/UI/Telegram/ColorPicker/assets/question-mark.svg";

export type ColorPickerValueType = "white" | "black" | "random";

export type ColorPickerProps = {
    value: ColorPickerValueType;
    onChange: (value: ColorPickerValueType) => void;
};

type ColorPickerRadioProps = {
    value: ColorPickerValueType;
    label: string;
    selected: boolean;
    onClick: (value: ColorPickerValueType) => void;
};

type ColorPickerBoxProps = {
    value: ColorPickerValueType;
};

const ColorPickerBox = styled(Button)<ColorPickerBoxProps>(({theme, value}) => {
    const before = {
        content: '""',
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
        background: "#eee",
        zIndex: 0,
    };

    return {
        padding: theme.spacing(3),
        borderRadius: theme.shape.borderRadius,
        background: value === "white" ? "#eee" : "#222",
        flexGrow: 1,
        cursor: "pointer",
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(1),
        flexDirection: "column",
        color: value === "white" ? "#111" : "#eee",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow .2s ease-in-out",

        "&:hover": {
            background: value === "white" ? "#eee" : "#222",
        },

        "& .MuiTouchRipple-root": {
            color: value === "random" ? "#888" : undefined,
        },

        "&:before": value === "random" ? before : undefined,
    };
});

const ColorPickerRadio: FC<ColorPickerRadioProps> = ({value, label, selected, onClick}) => {
    const icon =
        value === "random" ? <QuestionMark style={{flexGrow: 1, zIndex: 1}} /> : <KingOutlined style={{flexGrow: 1}} />;

    const selectedSx = (theme) => ({
        boxShadow: `0 0 0 4px ${theme.palette.primary.main}`,
    });

    return (
        <FormControlLabel
            labelPlacement="bottom"
            value={value}
            slotProps={{
                typography: {
                    sx: {mt: 1},
                    variant: "caption",
                },
            }}
            sx={{m: 0, flexBasis: 1, flexGrow: 1, color: "text.disabled"}}
            control={
                <ColorPickerBox value={value} sx={selected ? selectedSx : undefined} onClick={() => onClick(value)}>
                    {icon}
                </ColorPickerBox>
            }
            label={label}
        />
    );
};

export const ColorPicker: FC<ColorPickerProps> = ({value, onChange}) => {
    const {t} = useTranslation();

    return (
        <Stack direction="row" sx={{mt: 2, gap: 2}}>
            <ColorPickerRadio
                value="black"
                label={t("settings.colors.black")}
                onClick={onChange}
                selected={value === "black"}
            />
            <ColorPickerRadio
                value="random"
                label={t("settings.colors.random")}
                onClick={onChange}
                selected={value === "random"}
            />
            <ColorPickerRadio
                value="white"
                label={t("settings.colors.white")}
                onClick={onChange}
                selected={value === "white"}
            />
        </Stack>
    );
};
