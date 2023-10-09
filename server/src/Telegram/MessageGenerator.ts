import i18n from "i18n";

import {Color, GameRules, User} from "@/GameServer/DataModel";
import {ServerRoom} from "@/GameServer/ServerRoom";

export class MessageGenerator {
    public readonly locale: string;

    public constructor(locale: string) {
        this.locale = locale;
    }

    public readonly t = (phrase: string, replacements?: i18n.Replacements): string => {
        if (replacements) {
            return i18n.__mf({phrase, locale: this.locale}, replacements);
        }

        return i18n.__({phrase, locale: this.locale});
    };

    public readonly gameRulesToString = (gameRules: GameRules, firstPerson: boolean): string => {
        let description: string;

        if (gameRules.timer) {
            description = this.t("rules.timer.present", {
                start: (gameRules.initialTime! / 60).toString(),
                increment: gameRules.timerIncrement!.toString(),
            });
        } else {
            description = this.t("rules.timer.absent");
        }

        let colorPhrase = firstPerson ? "rules.color-1st-person" : "rules.color-3rd-person";

        if (gameRules.hostPreferredColor === Color.White) {
            colorPhrase += ".white";
        } else if (gameRules.hostPreferredColor === Color.Black) {
            colorPhrase += ".black";
        } else {
            colorPhrase += ".random";
        }
        description += " " + this.t(colorPhrase);

        return description;
    };

    public readonly creatingRoomMessage = (): string => {
        return this.t("message.creating-room");
    };

    public readonly roomDestroyedMessage = (botName: string): string => {
        return this.t("message.destroyed", {botName});
    };

    public readonly notStartedMessage = (room: ServerRoom): string => {
        const invitation = this.t("message.not-started.invitation", {
            user: this.inlineUserLink(room.host),
        });

        const rules = this.t("message.not-started.rules", {
            rules: this.gameRulesToString(room.gameRules, false),
        });

        const guide = this.t("message.not-started.guide");

        return `${invitation}\n\n${rules}\n\n${guide}`;
    };

    public readonly inGameMessage = (room: ServerRoom): string => {
        const introduction = this.t("message.in-game.introduction");

        const description = this.t("message.in-game.description", {
            whitePlayer: this.inlineUserLink(room.whitePlayer),
            blackPlayer: this.inlineUserLink(room.blackPlayer),
        });

        const rules = this.t("message.in-game.rules", {
            rules: this.gameRulesToString(room.gameRules, false),
        });

        const guide = this.t("message.in-game.guide");

        return `${introduction}\n${description}\n\n${rules}\n\n${guide}`;
    };

    public readonly gameFinishedMessage = (room: ServerRoom, botName: string): string => {
        const gameState = room.gameState();

        let resolution;
        let replacements: i18n.Replacements | undefined;
        if (gameState.winnerID) {
            if (gameState.winnerID === room.whitePlayer.id) {
                replacements = {
                    winner: this.inlineUserLink(room.whitePlayer),
                    loser: this.inlineUserLink(room.blackPlayer),
                };

                resolution = this.t("message.finished.resolution.victory.white");
            } else {
                replacements = {
                    winner: this.inlineUserLink(room.blackPlayer),
                    loser: this.inlineUserLink(room.whitePlayer),
                };
                resolution = this.t("message.finished.resolution.victory.black");
            }
        } else {
            resolution = this.t("message.finished.resolution.draw");
        }

        const explanation = this.t("message.finished.explanation." + gameState.resolution, replacements);

        const description = this.t("message.finished.description", {
            whitePlayer: this.inlineUserLink(room.whitePlayer),
            blackPlayer: this.inlineUserLink(room.blackPlayer),
        });

        const guide = this.t("message.finished.guide", {botName});

        return `${resolution}\n${explanation}\n\n${description}\n\n${guide}`;
    };

    private readonly inlineUserLink = (user: User): string => {
        return `[${user.fullName + (user.username ? ` (@${user.username})` : "")}](tg://user?id=${user.id})`;
    };
}
