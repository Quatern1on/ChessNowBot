import {Color, GameRules} from "@/GameServer/DataModel";

export const parseGameRulesQuery = (query: string): GameRules => {
    const regex = /^\$(0|1)(?::(\d+):(\d+))?:(w|b|r)$/;

    const match = query.trim().match(regex);

    if (!match) {
        throw new Error("Invalid query");
    }

    const [, timerEnabledStr, initialTimeStr, timerIncrementStr, hostPreferredColorStr] = match;

    const timerEnabled: boolean = timerEnabledStr === "1";
    const hostPreferredColor: Color | undefined =
        hostPreferredColorStr === "r" ? undefined : (hostPreferredColorStr as Color);

    let initialTime: number | undefined;
    let timerIncrement: number | undefined;

    if (timerEnabled) {
        if (!initialTimeStr || !timerIncrementStr) {
            throw new Error("Invalid query");
        }

        initialTime = parseInt(initialTimeStr, 10);
        timerIncrement = parseInt(timerIncrementStr, 10);
    }

    return {
        hostPreferredColor,
        timer: timerEnabled,
        initialTime,
        timerIncrement,
    };
};
