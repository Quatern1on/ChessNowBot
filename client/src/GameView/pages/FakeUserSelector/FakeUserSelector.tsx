import {Stack, Typography} from "@mui/material";
import React, {FC, ReactNode, useState} from "react";

import {User} from "@/GameClient/DataModel";
import {WebAppUser} from "@/Telegram/Types";
import {UserAvatar} from "@/UI";

export type FakeUserSelectorProps = {
    children?: ReactNode;
};

declare global {
    interface Window {
        fakeInitData?: string;
    }
}

const generateFakeInitData = (user: User, startParam: string) => {
    const fakeUser: WebAppUser = {
        id: user.id,
        first_name: user.fullName.split(" ", 2)[0],
        last_name: user.fullName.split(" ", 2)[1],
        username: user.username,
        language_code: "en",
        allows_write_to_pm: true,
    };

    return encodeURI(`user=${JSON.stringify(fakeUser)}&start_param=${startParam}`);
};

const fakeUsers: Array<User> = [
    {
        id: 1,
        fullName: "John Doe",
        username: "john_doe",
    },
    {
        id: 2,
        fullName: "Michael Brown",
        username: "michael_brown",
    },
    {
        id: 3,
        fullName: "Leonard Nimoy",
        username: "leonard_nimoy",
    },
];

export const FakeUserSelector: FC<FakeUserSelectorProps> = ({children}) => {
    const [selected, setSelected] = useState(false);
    const initDataAvailable = Boolean(window.Telegram.WebApp.initData);

    if (selected || initDataAvailable || import.meta.env.PROD) {
        return <>{children}</>;
    } else {
        return (
            <Stack
                sx={{width: "100%", height: "100%"}}
                direction="column"
                alignItems="center"
                justifyContent="center"
                spacing={2}>
                <Typography variant="h4" component="div">
                    Select fake user
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="center">
                    {fakeUsers.map((fakeUser) => (
                        <Stack
                            key={fakeUser.id}
                            sx={{cursor: "pointer", width: 130}}
                            alignItems="center"
                            spacing={2}
                            onClick={() => {
                                window.fakeInitData = generateFakeInitData(fakeUser, import.meta.env.VITE_ROOM_ID);
                                setSelected(true);
                            }}>
                            <UserAvatar user={fakeUser} sx={{width: 64, height: 64}} />
                            <Typography>{fakeUser.fullName}</Typography>
                        </Stack>
                    ))}
                </Stack>
            </Stack>
        );
    }
};
