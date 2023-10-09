/**
 * Color of the chest pieces
 */
export enum Color {
    White = "w",
    Black = "b",
}

/**
 * A 8x8 board square address in Algebraic notation
 * @see {@link https://en.wikipedia.org/wiki/Algebraic_notation_(chess)}
 */
export enum Square {
    A8 = "a8",
    B8 = "b8",
    C8 = "c8",
    D8 = "d8",
    E8 = "e8",
    F8 = "f8",
    G8 = "g8",
    H8 = "h8",
    A7 = "a7",
    B7 = "b7",
    C7 = "c7",
    D7 = "d7",
    E7 = "e7",
    F7 = "f7",
    G7 = "g7",
    H7 = "h7",
    A6 = "a6",
    B6 = "b6",
    C6 = "c6",
    D6 = "d6",
    E6 = "e6",
    F6 = "f6",
    G6 = "g6",
    H6 = "h6",
    A5 = "a5",
    B5 = "b5",
    C5 = "c5",
    D5 = "d5",
    E5 = "e5",
    F5 = "f5",
    G5 = "g5",
    H5 = "h5",
    A4 = "a4",
    B4 = "b4",
    C4 = "c4",
    D4 = "d4",
    E4 = "e4",
    F4 = "f4",
    G4 = "g4",
    H4 = "h4",
    A3 = "a3",
    B3 = "b3",
    C3 = "c3",
    D3 = "d3",
    E3 = "e3",
    F3 = "f3",
    G3 = "g3",
    H3 = "h3",
    A2 = "a2",
    B2 = "b2",
    C2 = "c2",
    D2 = "d2",
    E2 = "e2",
    F2 = "f2",
    G2 = "g2",
    H2 = "h2",
    A1 = "a1",
    B1 = "b1",
    C1 = "c1",
    D1 = "d1",
    E1 = "e1",
    F1 = "f1",
    G1 = "g1",
    H1 = "h1",
}

/**
 * Piece symbol (without color)
 */
export enum PieceSymbol {
    Pawn = "p",
    Knight = "n",
    Bishop = "b",
    Rook = "r",
    Queen = "q",
    King = "k",
}

/**
 * Represents a user authenticated through Telegram
 */
export interface User {
    /**
     * Telegram user's id
     * @see {@link https://core.telegram.org/bots/api#user}
     */
    id: number;

    /**
     * Telegram user's first_name and last_name joined
     * @see {@link https://core.telegram.org/bots/api#user}
     */
    fullName: string;

    /**
     * Telegram user's username
     * @see {@link https://core.telegram.org/bots/api#user}
     */
    username?: string;

    /**
     * Data-URL of Telegram user's first profile picture
     */
    avatarURL?: string;
}

/**
 * Represents dynamic state of room member
 */
export interface MemberState {
    /**
     * Whether the member has active connection to the room. A member could be present in the room but not connected,
     * for example if he/she leaves mid-game.
     * <br>
     * Also, the user who created the room (the host) will always be present in the room (even if not connected)
     */
    connected: boolean;

    /**
     * Whether the member has ability to participate in the game (e.g. make moves). All members have ability to watch
     * the game by default.
     */
    isPlayer: boolean;

    /**
     * The color of the chest pieces the player controls. Guaranteed to be unique in the room.
     * <br>
     * Present if {@link isPlayer} equals true
     */
    color?: Color;
}

/**
 * Represents a member of the room and its state
 * @see Room
 */
export interface Member {
    /**
     * User profile of this member
     */
    user: User;

    /**
     * Member's state
     */
    state: MemberState;
}

/**
 * Represents the parameters of the game in current room, that could be set up before room creation
 * @see Room.gameRules
 */
export interface GameRules {
    /**
     * If host selected to play as a specific color, this field is equal to that color. Undefined is it should be picked
     * randomly.
     */
    hostPreferredColor?: Color;

    /**
     * Whether players are limited in time to make a move. The timer does not reset when player makes a move. If the
     * player runs out of time he/she looses.
     */
    timer: boolean;

    /**
     * Initial time on the timer for <b>each</b> player. Expressed in seconds.
     * <br>
     * Present if {@link timer} equals true.
     */
    initialTime?: number;

    /**
     * Amount by which the timer of the player should be incremented after he/she made a move
     * <br>
     * Present if {@link plays} equals true.
     */
    timerIncrement?: number;
}

/**
 * Status of the game in the current room
 * @see GameState.status
 */
export enum GameStatus {
    NotStarted = "not-started",
    InProgress = "in-progress",
    Finished = "finished",
}

/**
 * The result which the game was finished with
 */
export enum GameResolution {
    /**
     * Means in any game position a player's king is in check
     * <br>
     * This resolution means there is a winner, so {@link GameState.winnerID} field will be set
     * @see {@link https://en.wikipedia.org/wiki/Checkmate}
     */
    Checkmate = "checkmate",

    /**
     * One of the players run out of timer time
     * <br>
     * This resolution means there is a winner, so {@link GameState.winnerID} field will be set
     */
    OutOfTime = "out-of-time",

    /**
     * One of the players disconnected from the game and did not reconnect back in time
     * <br>
     * This resolution means there is a winner, so {@link GameState.winnerID} field will be set
     */
    PlayerQuit = "player-quit",

    /**
     * One of the players gave up
     * <br>
     * This resolution means there is a winner, so {@link GameState.winnerID} field will be set
     */
    GiveUp = "give-up",

    /**
     * A situation where the player whose turn it is to move is not in check and has no legal move
     * <br>
     * This resolution means there is a draw, so {@link GameState.winnerID} field will <b>NOT</b> be set
     * @see https://en.wikipedia.org/wiki/Stalemate
     */
    Stalemate = "stalemate",

    /**
     * Draw
     * <br>
     * This resolution means there is a draw, so {@link GameState.winnerID} field will <b>NOT</b> be set
     * @see https://en.wikipedia.org/wiki/Draw_(chess)
     */
    Draw = "draw",
}

/**
 * State of the game in current room
 */
export interface GameState {
    /**
     * Whether the game not-started, started or finished
     * @see GameStatus
     */
    status: GameStatus;

    /**
     * History of all moves in PGN notation
     * @see {@link https://en.wikipedia.org/wiki/Portable_Game_Notation}
     */
    pgn: string;

    /**
     * Whose side the current turn is
     */
    turn: Color;

    /**
     * State of player's timers. Defined if {@link GameRules.timer} equals true.
     */
    timer?: TimerState;

    /**
     * How the game finished
     * <br>
     * Present if {@link status} equals {@link GameStatus.Finished}
     */
    resolution?: GameResolution;

    /**
     * If the game finished in a win of one player, the ID of the user, who won the game
     */
    winnerID?: number;
}

/**
 * Represents a game session, which players or spectators could connect
 */
export interface Room {
    /**
     * Unique string identifier 24 characters long
     */
    id: string;

    /**
     * List of members currently present in the room. Not all present members are guaranteed to be connected.
     * @see MemberState.connected
     */
    members: Member[];

    /**
     * ID of the user who created the room. Guaranteed to be present in the {@link members}.
     * @see User.id
     */
    hostID: number;

    /**
     * UNIX time (number of seconds since 00:00:00 UTC January 1, 1970) of the moment, when this room was created
     * @see {@link https://en.wikipedia.org/wiki/Unix_time}
     */
    createdTimestamp: number;

    /**
     * Parameters of the game
     * @see GameRules
     */
    gameRules: GameRules;

    /**
     * State of the game
     * @see GameState
     */
    gameState: GameState;
}

/**
 * Represents a chess move
 */
export interface Move {
    /**
     * Which square the piece was moved from
     */
    from: Square;

    /**
     * Which square the piece was moved to
     */
    to: Square;

    /**
     * Present if the pawn was promoted to another piece. Contains which piece it was promoted to.
     */
    promotion?: PieceSymbol;
}

/**
 * Represents a state of two player timers
 */
export interface TimerState {
    /**
     * Amount of time in milliseconds left on white player's timer
     */
    whiteTimeLeft: number;

    /**
     * Amount of time in milliseconds left on black player's timer
     */
    blackTimeLeft: number;
}

/**
 * Payload sent by client with new connection
 */
export interface AuthPayload {
    /**
     * initData field from window.Telegram.WebApp in the client. Needed fot authentication. Its genuinity will be
     * verified by the server.
     * @see {@link https://core.telegram.org/bots/webapps#initializing-mini-apps}
     * @see {@link https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app}
     */
    initData: string;
}

/**
 * List of events that server could send to connected client
 */
export interface ServerToClientEvents {
    /**
     * Sent when error happens while processing client event. After an error happens, server closes the connection with
     * the client.
     * @param name Name of the Error class
     * @param message Message explaining the details of the error in english
     */
    error: (name: string, message: string) => void;

    /**
     * Sent to client, when it initially connects to the room
     * @param room Room details the client connected to
     * @param userID ID of the user this connection is assigned to
     */
    init: (room: Room, userID: number) => void;

    /**
     * Sent when another user joins the room
     * @param user The user who joined the room
     */
    memberJoin: (member: Member) => void;

    /**
     * Sent when the members, present in the room leaves it. When the game begins, users who became players
     * ({@link MemberState.isPlayer} equals true) can not leave, they only can disconnect, and
     * {@link ServerToClientEvents.memberUpdate} will be called in this case.
     * @param userID ID of the user who left the room
     */
    memberLeave: (userID: number) => void;

    /**
     * Sent when the member's state, that is currently present in the room updated
     * @param userID ID of the user, whose state is updated
     * @param state New state of the member
     */
    memberUpdate: (userID: number, state: MemberState) => void;

    /**
     * Sent when current gameState of the room transitions from {@link GameStatus.NotStarted} to
     * {@link GameStatus.InProgress}
     */
    gameStart: () => void;

    /**
     * Sent when current gameState of the room transitions from {@link GameStatus.InProgress} to
     * {@link GameStatus.Finished}
     * @param resolution How the game ended
     * @param winnerID ID of the user who won
     * @param timer Last timer recordings. Defined if {@link GameRules.timer} equals true.
     * @see GameState.winnerID
     */
    gameEnd: (resolution: GameResolution, winnerID?: number, timer?: TimerState) => void;

    /**
     * Sent when a move was registered by server
     * @param move Move that was registered
     * @param timer State of player's timers. Defined if {@link GameRules.timer} equals true.
     */
    move: (move: Move, timer?: TimerState) => void;
}

/**
 * List of events that client could send to server
 */
export interface ClientToServerEvents {
    /**
     * Make a move. The move should be validated on both server and client sides. If the move is illegal, or it is not
     * the players turn, server will return an error and close the connection.
     * @param move A move requested by client
     */
    makeMove: (move: Move) => void;

    /**
     * User agreed to take a loss and voluntarily give up
     */
    giveUp: () => void;
}
