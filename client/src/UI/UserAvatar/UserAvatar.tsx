import {Avatar, Badge, styled, SxProps, Theme} from "@mui/material";
import React from "react";
import tinycolor from "tinycolor2";

import {User} from "@/GameClient/DataModel";

function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name: string, sx?: SxProps<Theme>) {
    const hue = tinycolor(stringToColor(name)).toHsl().h;

    const top: string = `hsl(${hue}, 90%, 70%)`;
    const bottom: string = `hsl(${hue}, 45%, 45%)`;
    const gradient: string = `linear-gradient(20deg, ${bottom} 0%, ${top} 100%);`;

    const letters = name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("");

    return {
        sx: [
            {background: gradient, color: "white", fontSize: 15, paddingTop: "2px"},
            ...(Array.isArray(sx) ? sx : [sx]),
        ],
        children: letters.toUpperCase(),
    };
}

type OnlineBadgeProps = {
    paperBackground?: boolean;
};

const OnlineBadge = styled(Badge, {
    shouldForwardProp: (prop) => prop !== "paperBackground",
})<OnlineBadgeProps>(({theme, paperBackground}) => ({
    "& .MuiBadge-badge": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${paperBackground ? theme.palette.background.paper : theme.palette.background.default}`,
        "&::after": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            animation: "ripple 1.2s infinite ease-in-out",
            border: "1px solid currentColor",
            content: '""',
        },
    },
    "@keyframes ripple": {
        "0%": {
            transform: "scale(.8)",
            opacity: 1,
        },
        "100%": {
            transform: "scale(2.4)",
            opacity: 0,
        },
    },
}));

export interface PlayerAvatarProps {
    user: User;
    sx?: SxProps<Theme>;
    online?: boolean;
    paperBackground?: boolean;
}

export const UserAvatar: React.FC<PlayerAvatarProps> = ({user, sx, online, paperBackground}) => {
    let avatar: JSX.Element;
    if (user.avatarURL) {
        avatar = <Avatar src={user.avatarURL} alt={user.fullName} sx={sx} />;
    } else {
        avatar = <Avatar {...stringAvatar(user.fullName, sx)} alt={user.fullName} />;
    }

    if (online) {
        return (
            <OnlineBadge
                overlap="circular"
                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                variant="dot"
                paperBackground={paperBackground}>
                {avatar}
            </OnlineBadge>
        );
    } else {
        return avatar;
    }
};
