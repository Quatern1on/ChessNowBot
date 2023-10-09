import {ListItem, ListItemButton, ListItemIcon, ListItemText, Stack} from "@mui/material";
import {FC, ReactNode} from "react";

export type MenuItemProps = {
    icon?: ReactNode;
    primary?: ReactNode;
    secondary?: ReactNode;
    onClick?: () => void;
    children?: ReactNode;
    direction?: "row" | "column";
};

export const MenuItem: FC<MenuItemProps> = ({icon, primary, secondary, onClick, children, direction = "row"}) => {
    const RootComponent = onClick ? ListItemButton : ListItem;

    return (
        <RootComponent onClick={onClick} alignItems="flex-start" sx={{pr: 3}}>
            <ListItemIcon children={icon} />
            <Stack direction={direction} sx={{flexGrow: 1}}>
                <ListItemText primary={primary} secondary={secondary} />
                {children}
            </Stack>
        </RootComponent>
    );
};
