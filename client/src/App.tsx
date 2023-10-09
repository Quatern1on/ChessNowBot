import {FakeUserSelector} from "GameView/pages/FakeUserSelector";
import type {FC} from "react";

import {GameSettingsView} from "@/GameSettingsView/GameSettings";
import {GameView} from "@/GameView/GameView";
import {TelegramThemeProvider} from "@/Telegram/TelegramThemeProvider.js";

export const App: FC = () => {
    if (
        window.Telegram.WebApp.initDataUnsafe.start_param ||
        (import.meta.env.VITE_ROOM_ID && window.Telegram.WebApp.platform === "unknown")
    ) {
        return (
            <TelegramThemeProvider>
                <FakeUserSelector>
                    <GameView />
                </FakeUserSelector>
            </TelegramThemeProvider>
        );
    }

    return (
        <TelegramThemeProvider>
            <GameSettingsView />
        </TelegramThemeProvider>
    );
};
