import VisibilityIcon from "@mui/icons-material/Visibility";
import {AvatarGroup, Stack} from "@mui/material";
import type {FC} from "react";

import {Member} from "@/GameClient/DataModel";
import {UserAvatar} from "@/UI";

export type SpectatorsBlockProps = {
    spectators: Member[];
};

export const SpectatorsBlock: FC<SpectatorsBlockProps> = ({spectators}) => {
    return (
        <Stack direction="row" alignItems="center" gap={1}>
            <AvatarGroup
                max={3}
                sx={{
                    "& .MuiAvatar-root": {width: 26, height: 26, pt: 0, fontSize: 8, color: "white"},
                }}>
                {spectators.map((member) => (
                    <UserAvatar user={member.user} key={member.user.id} />
                ))}
            </AvatarGroup>
            <VisibilityIcon sx={{color: "text.disabled"}} fontSize="small" />
        </Stack>
    );
};
