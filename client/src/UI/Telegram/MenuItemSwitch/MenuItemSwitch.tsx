import {Switch} from "@mui/material";
import {FC} from "react";

import {MenuItem, MenuItemProps} from "@/UI/Telegram";

export type MenuItemSwitchProps = {
    onChange: (value: boolean) => void;
    value: boolean;
} & Omit<MenuItemProps, "children" | "onClick">;

export const MenuItemSwitch: FC<MenuItemSwitchProps> = ({onChange, value, ...props}) => {
    return (
        <MenuItem onClick={() => onChange(!value)} {...props}>
            <Switch checked={value} sx={{mr: -1.5}} />
        </MenuItem>
    );
};
