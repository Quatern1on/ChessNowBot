import {UserProfilePhotos} from "@telegraf/types/manage";
import {InlineKeyboardButton} from "@telegraf/types/markup";
import {PhotoSize} from "@telegraf/types/message";
import axios from "axios";
import config from "config";
import debug from "debug";
import i18n from "i18n";
import {isAbsolute} from "path";
import {Op} from "sequelize";
import {Context, NarrowedContext, Telegraf} from "telegraf";
import * as tg from "telegraf/src/core/types/typegram";
import {URL} from "url";

import {PlayedGame, UserProfile} from "@/GameServer/Database";
import {Color, GameRules, GameStatus, User} from "@/GameServer/DataModel";
import {GameServer} from "@/GameServer/GameServer";
import {catchErrors} from "@/GameServer/SocketErrorHandler";
import {joinFullName} from "@/Telegram/joinFullname";
import {MessageGenerator} from "@/Telegram/MessageGenerator";
import {parseGameRulesQuery} from "@/Telegram/parseGameRulesQuery";

interface InlineGameDescription {
    id: string;
    title: string;
    gameRules: GameRules;
    thumbnailUrl?: string;
}

type PredefinedGamesConfig = {[key: string]: InlineGameDescription};

const log = debug("ChessNowBot");

export class ChessNowBot {
    private readonly bot: Telegraf;

    private readonly gameServer: GameServer;

    private readonly token: string;

    private readonly predefinedGames: PredefinedGamesConfig;

    private readonly customThumbnailURL: string | undefined;

    private readonly webAppCustomizeURL: string;

    private readonly webAppGameName: string;

    private readonly messageGenerators: {[key: string]: MessageGenerator};

    constructor(gameServer: GameServer) {
        this.gameServer = gameServer;

        this.token = config.get<string>("bot.token");

        this.predefinedGames = {};

        if (config.has("gameServer.gameModes")) {
            const predefinedGamesConfig = config.get<PredefinedGamesConfig>("gameServer.gameModes");

            for (const id of Object.keys(predefinedGamesConfig)) {
                if (id !== "custom") {
                    this.predefinedGames[id] = Object.assign({id: "#" + id}, predefinedGamesConfig[id]);
                }
            }
        }

        if (config.has("gameServer.gameModes.custom.thumbnailUrl")) {
            this.customThumbnailURL = config.get<string>("gameServer.gameModes.custom.thumbnailUrl");
        }

        this.webAppCustomizeURL = config.get<string>("webApp.customize.url");

        this.webAppGameName = config.get<string>("webApp.game.name");

        this.messageGenerators = {};

        for (const locale of i18n.getLocales()) {
            this.messageGenerators[locale] = new MessageGenerator(locale);
        }

        this.bot = new Telegraf(this.token, {
            telegram: {
                testEnv: config.get<boolean>("bot.testEnv"),
            },
        });

        this.bot.on("inline_query", this.handleInlineQuery);
        this.bot.on("chosen_inline_result", this.handleInlineResult);
        this.bot.command("start", this.handleStartCommand);
        this.bot.command("stats", this.handleStatsCommand);

        this.bot.catch((err, ctx) => {
            console.error(err);
        });

        log("ChessNowBot instance was created");
    }

    public readonly launch = async (): Promise<void> => {
        log("ChessNowBot has been launched");
        await this.bot.launch();
    };

    public readonly getAvatar = async (userID: number): Promise<string | undefined> => {
        let userProfilePhotos: UserProfilePhotos;
        try {
            userProfilePhotos = await this.bot.telegram.getUserProfilePhotos(userID, 0, 1);
        } catch (e) {
            return undefined;
        }

        if (userProfilePhotos.total_count === 0) {
            return undefined;
        }

        const avatarSizes = userProfilePhotos.photos[0];

        //Select the smallest PhotoSize that is still larger than targetResolution
        const targetResolution = 128;
        avatarSizes.sort((a, b) => b.width - a.width);
        let selectedSize: PhotoSize = avatarSizes[0];
        for (const size of avatarSizes) {
            if (size.width > targetResolution && size.height > targetResolution) {
                selectedSize = size;
            }
        }

        const fileURL = await this.getFileLink(selectedSize.file_id);

        const response = await axios.get(fileURL.href, {
            responseType: "arraybuffer",
        });
        const returnedB64 = Buffer.from(response.data).toString("base64");

        return "data:image/jpeg;base64," + returnedB64;
    };

    private readonly getMessageGenerator = (locale?: string): MessageGenerator => {
        if (locale) {
            return (
                this.messageGenerators[locale] ||
                this.messageGenerators[i18n.getLocale()] ||
                this.messageGenerators["en"]
            );
        }

        return this.messageGenerators[i18n.getLocale()] || this.messageGenerators["en"];
    };

    private readonly handleStartCommand = async (
        ctx: Context<{message: tg.Update.New & tg.Update.NonChannel & tg.Message.TextMessage; update_id: number}>
    ): Promise<void> => {
        const tgUser = ctx.update.message.from;
        const msg = this.getMessageGenerator(tgUser.language_code);

        const [userProfile] = await UserProfile.upsert({
            id: tgUser.id,
            fullName: joinFullName(tgUser.first_name, tgUser.last_name),
            username: tgUser.username,
            languageCode: tgUser.language_code,
        });

        await ctx.reply(msg.t("commands.start", {botName: ctx.botInfo.username}), {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: msg.t("button.play"),
                            switch_inline_query_chosen_chat: {
                                query: "",
                                allow_bot_chats: false,
                                allow_channel_chats: true,
                                allow_group_chats: true,
                                allow_user_chats: true,
                            },
                        },
                    ],
                ],
            },
        });
    };

    private readonly handleStatsCommand = async (
        ctx: Context<{message: tg.Update.New & tg.Update.NonChannel & tg.Message.TextMessage; update_id: number}>
    ): Promise<void> => {
        const tgUser = ctx.update.message.from;
        const msg = this.getMessageGenerator(tgUser.language_code);

        const [userProfile] = await UserProfile.upsert({
            id: tgUser.id,
            fullName: joinFullName(tgUser.first_name, tgUser.last_name),
            username: tgUser.username,
            languageCode: tgUser.language_code,
        });

        const userGamesPlayed = await PlayedGame.count({
            where: {
                [Op.or]: [{whitePlayerID: userProfile.id}, {blackPlayerID: userProfile.id}],
            },
        });

        const userGamesWon = await PlayedGame.count({
            where: {
                [Op.or]: [
                    {
                        [Op.and]: [{whitePlayerID: userProfile.id}, {winner: Color.White}],
                    },
                    {
                        [Op.and]: [{blackPlayerID: userProfile.id}, {winner: Color.Black}],
                    },
                ],
            },
        });

        const totalUniqueUsers = await UserProfile.count({});

        const todayUniqueUsers = await UserProfile.count({
            where: {
                updatedAt: {
                    [Op.gte]: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                },
            },
        });

        const totalGamesPlayed = await PlayedGame.count({});

        const todayGamesPlayed = await PlayedGame.count({
            where: {
                createdAt: {
                    [Op.gte]: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                },
            },
        });

        await ctx.reply(
            msg.t("commands.stats", {
                userGamesPlayed: userGamesPlayed.toString(),
                userGamesWon: userGamesWon.toString(),
                totalUniqueUsers: totalUniqueUsers.toString(),
                todayUniqueUsers: todayUniqueUsers.toString(),
                totalGamesPlayed: totalGamesPlayed.toString(),
                todayGamesPlayed: todayGamesPlayed.toString(),
            }),
            {
                parse_mode: "Markdown",
            }
        );
    };

    private readonly handleInlineQuery = async (ctx: NarrowedContext<Context, tg.Update.InlineQueryUpdate>) => {
        log(
            'Received new inline query("%s") from user(%d) with language code "%s"',
            ctx.inlineQuery.query,
            ctx.inlineQuery.from.id,
            ctx.inlineQuery.from.language_code
        );
        const msg = this.getMessageGenerator(ctx.inlineQuery.from.language_code);
        let games: InlineGameDescription[];

        const query = ctx.update.inline_query.query;
        if (query) {
            try {
                games = [
                    {
                        id: query,
                        title: msg.t("rules.custom"),
                        gameRules: parseGameRulesQuery(query),
                        thumbnailUrl: this.customThumbnailURL,
                    },
                ];
            } catch (e) {
                return;
            }
        } else {
            games = Object.values(this.predefinedGames);
        }

        const waitButton: tg.InlineKeyboardButton = {
            text: msg.t("button.wait"),
            callback_data: "creating-room",
        };

        const results: tg.InlineQueryResult[] = games.map((game) => ({
            type: "article",
            id: game.id,
            title: game.title,
            description: msg.gameRulesToString(game.gameRules, true),
            thumbnail_url: game.thumbnailUrl,
            input_message_content: {
                message_text: msg.creatingRoomMessage(),
                parse_mode: "Markdown",
            },
            reply_markup: {
                inline_keyboard: [[waitButton]],
            },
        }));

        await ctx.answerInlineQuery(results, {
            button: {
                web_app: {
                    url: this.webAppCustomizeURL + "?lang=" + ctx.inlineQuery.from.language_code,
                },
                text: msg.t("rules.custom"),
            },
            cache_time: 0,
        });
    };

    private readonly handleInlineResult = async (
        ctx: NarrowedContext<Context, tg.Update.ChosenInlineResultUpdate>
    ): Promise<void> => {
        const tgUser = ctx.update.chosen_inline_result.from;
        const msg = this.getMessageGenerator(tgUser.language_code);

        const host: User = {
            id: tgUser.id,
            fullName: joinFullName(tgUser.first_name, tgUser.last_name),
            username: tgUser.username,
            avatarURL: await this.getAvatar(tgUser.id),
        };

        log('User(%d: %s) selected inline result("%s")', host.id, host.fullName, ctx.chosenInlineResult.result_id);

        const resultID = ctx.chosenInlineResult.result_id;
        let gameRules: GameRules;
        if (resultID.startsWith("#")) {
            gameRules = this.predefinedGames[resultID.slice(1)].gameRules;
        } else {
            gameRules = parseGameRulesQuery(resultID);
        }

        const messageID = ctx.chosenInlineResult.inline_message_id!;

        await UserProfile.upsert({
            id: host.id,
            fullName: host.fullName,
            username: host.username,
            languageCode: tgUser.language_code,
        });

        const room = this.gameServer.createRoom(host, gameRules);

        const gameUrl = `https://t.me/${this.bot.botInfo!.username}/${this.webAppGameName}?startapp=${room.id}`;

        const updateMessage = async () => {
            let messageText: string;
            let keyboard: InlineKeyboardButton[][];
            if (room.gameStatus === GameStatus.NotStarted) {
                messageText = msg.notStartedMessage(room);
                const joinButton: tg.InlineKeyboardButton = {
                    text: msg.t("button.join"),
                    url: gameUrl,
                };
                keyboard = [[joinButton]];
            } else if (room.gameStatus === GameStatus.InProgress) {
                messageText = msg.inGameMessage(room);
                const joinButton: tg.InlineKeyboardButton = {
                    text: msg.t("button.join"),
                    url: gameUrl,
                };
                keyboard = [[joinButton]];
            } else if (room.gameStatus === GameStatus.Finished) {
                messageText = msg.gameFinishedMessage(room, ctx.botInfo.username);
                const playAgainButton: tg.InlineKeyboardButton = {
                    text: msg.t("button.play-again"),
                    switch_inline_query_current_chat: "",
                };
                const playAnotherButton: tg.InlineKeyboardButton = {
                    text: msg.t("button.play-another"),
                    switch_inline_query_chosen_chat: {
                        query: "",
                        allow_bot_chats: false,
                        allow_channel_chats: true,
                        allow_user_chats: true,
                        allow_group_chats: true,
                    },
                };
                keyboard = [[playAgainButton], [playAnotherButton]];
            } else {
                throw new Error("Invalid game status");
            }

            await this.bot.telegram.editMessageText(undefined, undefined, messageID, messageText, {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: keyboard,
                },
            });
        };

        room.on("gameStatusChange", catchErrors()(updateMessage));

        room.on(
            "destroy",
            catchErrors()(async () => {
                if (room.gameStatus !== GameStatus.NotStarted) {
                    return;
                }

                const playAgainButton: tg.InlineKeyboardButton = {
                    text: msg.t("button.play-again"),
                    switch_inline_query_current_chat: "",
                };
                const playAnotherButton: tg.InlineKeyboardButton = {
                    text: msg.t("button.play-another"),
                    switch_inline_query_chosen_chat: {
                        query: "",
                        allow_bot_chats: false,
                        allow_channel_chats: true,
                        allow_user_chats: true,
                        allow_group_chats: true,
                    },
                };

                const messageText = msg.roomDestroyedMessage(ctx.botInfo.username);

                await this.bot.telegram.editMessageText(undefined, undefined, messageID, messageText, {
                    parse_mode: "Markdown",
                    reply_markup: {
                        inline_keyboard: [[playAgainButton], [playAnotherButton]],
                    },
                });
            })
        );

        await updateMessage();
    };

    private readonly getFileLink = async (fileId: string | tg.File): Promise<URL> => {
        if (typeof fileId === "string") {
            fileId = await this.bot.telegram.getFile(fileId);
        } else if (fileId.file_path === undefined) {
            fileId = await this.bot.telegram.getFile(fileId.file_id);
        }

        // Local bot API instances return the absolute path to the file
        if (fileId.file_path !== undefined && isAbsolute(fileId.file_path)) {
            const url = new URL(this.bot.telegram.options.apiRoot);
            url.port = "";
            url.pathname = fileId.file_path;
            url.protocol = "file:";
            return url;
        }

        let path: string;
        if (this.bot.telegram.options.testEnv) {
            path = `./file/${this.bot.telegram.options.apiMode}${this.token}/test/${fileId.file_path!}`;
        } else {
            path = `./file/${this.bot.telegram.options.apiMode}${this.token}/${fileId.file_path!}`;
        }

        return new URL(path, this.bot.telegram.options.apiRoot);
    };
}
