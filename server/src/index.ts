import "dotenv/config";
import "@/i18n";

import config from "config";
import * as fs from "fs";
import http from "http";
import https from "https";
import serveStatic from "serve-static";

import {GameServer} from "@/GameServer/GameServer";
import {ChessNowBot} from "@/Telegram/ChessNowBot";

const serve = serveStatic("public", {
    index: ["index.html"],
});

let requestHandler;
if (config.get<boolean>("server.static")) {
    requestHandler = (
        req: http.IncomingMessage,
        res: http.ServerResponse<http.IncomingMessage> & {req: http.IncomingMessage}
    ) => {
        serve(req, res, (err) => {
            res.writeHead(err?.statusCode || 404);
            res.end();
        });
    };
}

let server: http.Server | https.Server;

if (config.get<boolean>("server.https")) {
    const options = {
        key: fs.readFileSync(config.get<string>("server.key")),
        cert: fs.readFileSync(config.get<string>("server.cert")),
    };

    server = https.createServer(options, requestHandler);
} else {
    server = http.createServer(requestHandler);
}

const gameServer = new GameServer(server);

export const bot = new ChessNowBot(gameServer);

server.listen(config.get<number>("server.port"));
bot.launch();
