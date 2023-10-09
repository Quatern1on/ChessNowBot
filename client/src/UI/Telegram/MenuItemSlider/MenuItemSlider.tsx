import {Slider, SliderProps, Stack, Typography} from "@mui/material";
import {FC} from "react";

import {MenuItem, MenuItemProps} from "@/UI/Telegram";

export type MenuItemSliderProps = {
    tooltip?: string;
    sliderProps?: SliderProps;
} & Omit<MenuItemProps, "children" | "onClick" | "direction">;

export const MenuItemSlider: FC<MenuItemSliderProps> = ({icon, tooltip, sliderProps, ...props}) => {
    return (
        <MenuItem icon={icon} direction="column" {...props}>
            <Stack direction="row" sx={{mt: 1}}>
                <Slider {...sliderProps} />
                <Typography sx={{width: 60, textAlign: "right"}}>{tooltip}</Typography>
            </Stack>
        </MenuItem>
    );
};
