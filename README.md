# ChessNowBot

[ChessNowBot](https://t.me/ChessNowBot) - the Telegram Mini App that brings the classic game of chess to your favorite messaging platform! Engage in thrilling chess matches with friends, colleagues, or fellow group members without leaving Telegram. ChessNowBot seamlessly integrates into your chats, offering a user-friendly interface for an immersive chess experience.

# First Place Winner in the Telegram Mini App Contest

ChessNowBot has been [awarded the first place](https://contest.com/mini-apps/entry4440) in the Telegram Mini App Contest. 🎉🏆

ChessNowBot was developed as a [submission](https://contest.com/mini-apps/entry4440) for the [Telegram Mini App Contest](https://contest.com/mini-apps). The goal of this competition is to encourage the creation of diverse and useful Mini Apps for Telegram. The ChessNowBot project adheres to the contest guidelines, providing a complete and functional Mini App for playing chess within the Telegram environment.

## Demo

You can evaluate ChessNowBot functionality in Telegram. The bot is available under the name [@ChessNowBot](https://t.me/ChessNowBot). Just select any chat, type in [@ChessNowBot](https://t.me/ChessNowBot) and add a space.

## Features

#### Game Modes

ChessNowBot offers three predefined game modes, allowing users to choose their preferred chess-playing experience. Additionally, a custom mode lets users define specific timer settings and their starting side (black, white, or random).

#### Invitation System

Initiate chess games by sending invitations to individual chats, groups, or channels. When recipients accept the invitation, they are directed to a web view within the Telegram app to join the game.

#### Spectator Mode

Invite multiple participants, but only the first to press "join" engages in the game. Others become spectators, observing the chess match as it unfolds.

#### Real-time Updates

Stay informed about the game's progress with real-time updates in the Telegram chat. Messages sent by ChessNowBot dynamically reflect the current state of the game, including the players, game status, and outcomes.

#### Game Statistics

ChessNowBot maintains a database of completed games, allowing users to access personal and global statistics using the `/stats` command. Track your performance and explore overall trends in the ChessNowBot community.

## Overview

The application comprises two main components: the Server and the Client, each residing in their respective directories at the root of the repository.

### Server

The server is implemented as a [Node.js](https://nodejs.org/) application written in [TypeScript](https://www.typescriptlang.org/). It consists of two primary parts:

#### 1. ChessNowBot (Telegraf.js):

- The ChessNowBot class, developed using the [Telegraf.js](https://github.com/telegraf/telegraf) library, acts as a Telegram bot and facilitates communication with users through the Telegram inline mode.

- It is responsible for creating game rooms whenever a user initiates a new game invitation.

- It generates a game invitation, that includes a link to the Telegram Mini App with a startapp parameter that has the room ID to connect to.

#### 2. GameServer and ServerRoom (Socket.io):

- GameServer handles connections through [Socket.io](https://socket.io/), validates and manages new client connections.

- Upon connection, the appropriate ServerRoom class is assigned to handle communication and game logic for the connected clients based on the room ID.

- ServerRoom manages game-specific logic, including chessboard state, moves, timers, and other related aspects.

Additionally, the server utilizes [SQLite3](https://www.sqlite.org/index.html) as the database for data storage, with [Sequelize](https://sequelize.org/) serving as the Object-Relational Mapping (ORM) tool.

### Client

The client is a [React](https://react.dev/) application developed in [TypeScript](https://www.typescriptlang.org/), serving as the user interface for ChessNowBot. Key components include:

#### 1. React Chessboard and chess.js:

- The chessboard component is implemented using the [react-chessboard](https://github.com/Clariity/react-chessboard) package, providing an out-of-the-box, highly customizable solution with support for both Drag and Drop and click-based move mechanics.

- The [chess.js](https://github.com/jhlywa/chess.js) library, is used for game logic.

#### 2. GameClient and Socket.io Client:

- The GameClient class manages communication with the server and client-side game logic.

- Socket.io client is used to establish a real-time communication channel with the server.

#### 3. Material UI for UI Design:

- The client UI is designed using [Material UI](https://mui.com/), chosen for its high customizability, accessibility, and resemblance to the native Telegram client UI style.

### API Definition

Communication between the server and the client is based on thr API that is defined in TypeScript types in the DataModel.ts file. These types specify the entities transferred between the server and the client. The API is documented using JSDoc comments within the DataModel.ts file.

## Setup guide

### Prerequisites

Ensure that your server environment meets the following requirements before setting up ChessNowBot:

#### Operating System:

- The application was tested on Ubuntu 22.04.3 LTS, but it should be also compatible with other operating systems.

#### Network Configuration:

- The server should have ports 80 and 443 accessible from the internet.

#### Domain Name:

- You need a domain name.

#### Node.js and npm:

- The server should have Node.js installed. The application was tested on Node.js v18.18.0. On Ubuntu Node.js could be installed from [NodeSource Node.js Binary Distributions](https://github.com/nodesource/distributions)
- Ensure npm (Node Package Manager) is also installed.

### Step 1: Obtain and configure bot and web app from @BotFather

- Start a conversation with [@BotFather](https://t.me/BotFather) in Telegram.
- Send `/newbot` command to start creating your new bot.
- BotFather will prompt you to supply a name and a username for your bot. The name can be modified at a later time, but the username is permanent, so make your selection thoughtfully.
- BotFather will give you the token to access the HTTP API. Save it somewhere, you will need it at a later stage.
- Now, you need to configure the bot. Send `/mybots` command and select your newly created bot. Select `Bot Settings` -> `Inline Mode` -> `Turn on`. This is needed to allow your bot to work in [inline mode](https://core.telegram.org/bots/inline).
- Then select `<< Back to Settings` -> `Inline Feedback` -> `100%`. This is needed for the bot to receive inline `ChosenInlineResult` updates. [More about this.](https://core.telegram.org/bots/api#choseninlineresult)
- _Optionally you can set other settings, such as bot picture, description, about text etc._
- Send `/newapp` command to start creating new web app attached to the bot.
- From the list below select the bot that you have just created.
- BotFather will ask you to enter some information about your app, for Web App URL enter: `https://<YOUR-DOMAIN>/`. Replace `<YOUR-DOMAIN>` with your domain name. For short name enter `game`.

### Step 2: Setup ChessNowBot

- Download the source code:
```shell
git clone https://github.com/Quatern1on/ChessNowBot
cd ChessNowBot
```

- Install client and server dependencies:
```shell
cd server
npm install
```
```shell
cd ../client
npm install
```

- Create `.env` file in the client folder with the following content. Replace `yourdomain.name` with your domain name:
```dotenv
VITE_SERVER_URL=https://yourdomain.name
```

- Build client:
```shell
npm run build
```

- Build server:
```shell
cd ../server
npm run build
```

- Create a configuration file `server/config/local.json5` with the following content, replace `<URL>` with url to your web app, like https://yourdomain.name/ (leading slash is important), it will probably be the same as the one you entered for Web App URL at Step 1. Replace `<TOKEN>` with bot token received from BotFather at step 1:
```json5
{
    webApp: {
        customize: {
            url: "<URL>",
        },
        game: {
            name: "game",
        }
    },
    bot: {
        token: "<TOKEN>",
    },
    gameServer: {
        gameModes: {
            bullet: {
                title: "Bullet (1|0)",
                gameRules: {
                    timer: true,
                    initialTime: 60,
                    timerIncrement: 0,
                },
            },
            blitz: {
                title: "Blitz (3|2)",
                gameRules: {
                    timer: true,
                    initialTime: 180,
                    timerIncrement: 2,
                },
            },
            rapid: {
                title: "Rapid (10|5)",
                gameRules: {
                    timer: true,
                    initialTime: 600,
                    timerIncrement: 5,
                },
            },
        },
    },
}
```

### Step 3: Setup nginx

This guide assumes usage of nginx as a reverse proxy for the server, and hosting static files (client bundle). If you are setting up for the development environment, you might not need to install nginx.

- Install nginx:
```shell
sudo apt update
sudo apt install nginx
```

- Check that nginx is active and running:
```shell
sudo systemctl status nginx
```

- Allow inbound traffic on 443 port through your firewall configuration, this step is dependent on cloud provider, and may require adjustments within the virtual machine as well as through the cloud provider's dashboard.

- Create an Nginx server block for ChessNowBot:
```shell
sudo mkdir -p /var/www/ChessNowBot
sudo chown -R $USER:$USER /var/www/ChessNowBot
sudo chmod -R 755 /var/www/ChessNowBot
```

- Copy client build into newly created folder:
```shell
cd ..
cp -r ./client/build/* /var/www/ChessNowBot/
```

- Create a new configuration file `/etc/nginx/sites-available/ChessNowBot` with the following content, replace `yourdomain.name` with your domain name:
```
server {
    listen 80;
    listen [::]:80;
    
    server_name yourdomain.name;
    
    root /var/www/ChessNowBot;
    index index.html;

    location /socket.io/ {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;

        proxy_pass http://localhost:3000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

- Enable new configuration:
```shell
sudo ln -s /etc/nginx/sites-available/ChessNowBot /etc/nginx/sites-enabled/ChessNowBot
```

- Remove the default one
```shell
sudo rm /etc/nginx/sites-enabled/default
```

- Restart Nginx to apply the changes:
```shell
sudo systemctl restart nginx
```

- If you don't already have one, obtain an SSL certificate and install it into Nginx. It could be done, for example, by following [this guide](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal). Select nginx as your software, and your OS as your system.

### Step 4 (Optional): Create systemd service for the application

You can start the server now:
```shell
cd server
npm run start:prod
```
But as soon as you close terminal (or ssh connection) the server will be stopped. To make it always run, you can create a systemd service, and make systemd start the server on system boot, and restart it if it crushes.

- Create a file `/etc/systemd/system/chessnowbot.service` with the following content, replace `username` with your user's name, and replace `/path/to/ChessNowBot` with the path you downloaded ChessNowBot to at Step 1:
```
[Unit]
Description=ChessNowBot Service
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=username
ExecStart=/usr/bin/env npm run start:prod
WorkingDirectory=/path/to/ChessNowBot/server

[Install]
WantedBy=multi-user.target
```

- Start the service:
```shell
sudo systemctl start chessnowbot
```

- Make it start automatically on boot:
```shell
sudo systemctl enable chessnowbot
```

- You can view service logs with this command:
```shell
sudo journalctl -u chessnowbot
```

## Configuration

Client configuration is done through environment variables. You can pass it to the `npm run build` or `npm run dev` commands, or create a `.env` file in the client's root directory. The `.env` file is ignored by git. The client has only two options:

- `VITE_SERVER_URL`: _Required._ A URL of the GameServer, which socket.io will connect to.

- `VITE_ROOM_ID`: _Optional._ This option is useful for development. If you launch the webapp in the browser, and pass this parameter, it will prompt you for mock user information, and connect to the room with id specified by this parameter. For this option to work, you should also set `gameServer.validateInitData` in the server configuration to `false`.

Server configuration is done through [node-config](https://github.com/node-config/node-config) library. Config files reside in `config` directory. `default.json5` contains all properties with their respective default values. Not all properties have default value. To change configuration you could create `local.json5` file in the config directory, it will not be tracked by git. Here is the list of available options in the server config file:

- `webApp`: _Object._ Telegram Mini Apps configuration.
  - `customize`: _Object._ Configuration of the Mini App that is opened when you press "Custom game" button in inline results. It is used to select game rules for custom game.
    - `url`: _string._ URL of the Mini App.
  - `game`: _Object._ Configuration of the Game mini app.
    - `name`: _string._ Short name, of the mini app, that will be launched when joining the game. ChessNowBot will create an invitation link to the game in the following way:
      ```javascript
      'https://t.me/${botName}/${webApp.game.name}?startapp=${room.id}'
      ```
- `bot`: _Object._ Telegram bot configuration.
  - `token`: _string._ Bot API access token.
  - `testEnv`: _boolean, Default: `false`._ Whether to connect the bot to the [test environment](https://core.telegram.org/bots/webapps#using-bots-in-the-test-environment).
- `server`: _Object._ Server configuration.
  - `https`: _boolean, Default: `false`._ Whether to bootstrap an https server instead of http. Should be left `false` when used with nginx as reverse-proxy.
  - `key`: _string._ Path to the private key file for the SSL certificate. Must be set when `https` is `true`.
  - `cert`: _string._ Path to the SSL certificate file. Must be set when `https` is `true`.
  - `port`: _number, Default: `3000`._ Port to listen to
  - `static`: _boolean, Default: `false`._ Whether to serve static content, located in the `public` directory in the server root. Useful when used without nginx.
- `gameServer`: _Object._ Configuration of the game server.
  - `validateInitData`: _boolean, Default: `true`._ Whether to validate web app init data in the way [described in the telegram docs](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app). Useful for local development environment. __It is not secure to leave it at `false` in the production environment__
  - `inactivityTimeout`: _number, Default: `300`._ Number of seconds to wait before destroy the room, if no one connected to it.
  - `disconnectTimeout`: _number, Default: `180`._ Number of seconds to wait, if a user disconnects mid-game before recognizing him as a looser with a `GameResolution.PlayerQuit` reason.
  - `gameModes`: _Object._ Configuration for predefined game modes. Each key in this object is a `string` id of the game mode. Each entry will be shown to the user as an inline result by bot, when the user does not specify an inline query. When the user does specify an inline query, an option for custom game will be shown instead.
    - `[key: string]`: _Object._ Configuration for the game mode.
      - `title`:_string._ The name of the game mode. Will be shown as title in the inline result.
      - `thumbnailUrl`: _Optional string._ Inline result thumbnail URL.
      - `gameRules`: _Object._ Game rules of the game mode.
          - `timer`: _boolean._ Whether to use timer. If set to `true`, `initialTime` and `timerIncrement` should also be provided.
          - `initialTime`: _number._ Initial time in seconds on each player's timer.
          - `timerIncrement`: _number._ Amount by which the timer of the player should be incremented in seconds after he/she made a move.
          - `hostPreferredColor`: _string._ Which color the host should start as. `'w'` for white, `'b'` for black. Leave unspecified for random color.
    - `custom`: _Object._ Configuration for custom game inline result entry.
      - `thumbnailUrl`: _Optional string._ Inline result thumbnail URL.
  - `fakeRoom`: _Object._ Configuration of the fake room. Fake room is created as soon as you start the server. Useful in local development environment.
      - `create`: _boolean, Default `false`._ Whether to create fake room.
      - `id`: _string._ ID of the created room.
      - `host`: _Object._ A user who will be assigned as a host to this room. The game will not start in the room, until host joins, so you need to provide your real telegram user id here.
          - `id`: _number._ Telegram user ID.
          - `fullName`: _string._ First + last name.
          - `username`: _Optional string._ Telegram user's username.
          - `avatarURL`: _Optional string._ URL of the telegram user's profile picture. Could be data URL. Will be used in the client.
      - `gameRules`: _Object_ Game rules of the fake room.
          - `timer`: _boolean._ Whether to use timer. If set to `true`, `initialTime` and `timerIncrement` should also be provided.
          - `initialTime`: _number._ Initial time in seconds on each player's timer.
          - `timerIncrement`: _number._ Amount by which the timer of the player should be incremented in seconds after he/she made a move.
          - `hostPreferredColor`: _string._ Which color the host should start as. `'w'` for white, `'b'` for black. Leave unspecified for random color.

## LICENSE

MIT
