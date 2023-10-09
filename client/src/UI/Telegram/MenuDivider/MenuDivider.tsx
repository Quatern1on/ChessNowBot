import {Divider, styled} from "@mui/material";

export const MenuDivider = styled(Divider)(({theme}) => ({
    background: theme.palette.background.paper,
    height: 5,
    border: 0,
}));
