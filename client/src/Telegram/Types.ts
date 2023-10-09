declare global {
    interface Window {
        Telegram: Telegram;
    }
}

export interface Telegram {
    WebApp: WebApp;
}

interface MiniAppsEvents {
    themeChanged: () => void;
}

interface WebApp {
    /**
     * A string with raw data transferred to the Mini App, convenient for validating data.
     * <br>
     * <b>WARNING:</b> Validate data from this field before using it on the bot's server.
     */
    initData: string;

    /**
     * An object with input data transferred to the Mini App.
     * <br>
     * <b>WARNING:</b> Data from this field should not be trusted. You should only use data from initData on the bot's
     * server and only after it has been validated.
     */
    initDataUnsafe: WebAppInitData;

    /**
     * The version of the Bot API available in the user's Telegram app.
     */
    version: string;

    /**
     * The name of the platform of the user's Telegram app.
     */
    platform: string;

    /**
     * The color scheme currently used in the Telegram app. Either “light” or “dark”.
     * <br>
     * Also available as the CSS variable var(--tg-color-scheme).
     */
    colorScheme: "light" | "dark";

    /**
     * An object containing the current theme settings used in the Telegram app.
     */
    themeParams: ThemeParams;

    /**
     * True, if the Mini App is expanded to the maximum available height. False, if the Mini App occupies part of the
     * screen and can be expanded to the full height using the {@link expand()} method.
     */
    isExpanded: boolean;

    /**
     * The current height of the visible area of the Mini App. Also available in CSS as the variable
     * var(--tg-viewport-height).
     * <br>
     * <br>
     * The application can display just the top part of the Mini App, with its lower part remaining outside the screen
     * area. From this position, the user can “pull” the Mini App to its maximum height, while the bot can do the same
     * by calling the {@link expand()} method. As the position of the Mini App changes, the current height value of the
     * visible area will be updated in real time.
     * <br>
     * <br>
     * Please note that the refresh rate of this value is not sufficient to smoothly follow the lower border of the
     * window. It should not be used to pin interface elements to the bottom of the visible area. It's more appropriate
     * to use the value of the viewportStableHeight field for this purpose.
     */
    viewportHeight: number;

    /**
     * The height of the visible area of the Mini App in its last stable state. Also available in CSS as a variable
     * var(--tg-viewport-stable-height).
     * <br>
     * <br>
     * The application can display just the top part of the Mini App, with its lower part remaining outside the screen
     * area. From this position, the user can “pull” the Mini App to its maximum height, while the bot can do the same
     * by calling the {@link expand()} method. Unlike the value of viewportHeight, the value of viewportStableHeight
     * does not change as the position of the Mini App changes with user gestures or during animations. The value of
     * viewportStableHeight will be updated after all gestures and animations are completed and the Mini App reaches its
     * final size.
     * <br>
     * <br>
     * <i>Note the event viewportChanged with the passed parameter isStateStable=true, which will allow you to track
     * when the stable state of the height of the visible area changes.</i>
     */
    viewportStableHeight: number;

    /**
     * Current header color in the #RRGGBB format.
     */
    headerColor: string;

    /**
     * Current background color in the #RRGGBB format.
     */
    backgroundColor: string;

    /**
     * True, if the confirmation dialog is enabled while the user is trying to close the Mini App. False,
     * if the confirmation dialog is disabled.
     */
    isClosingConfirmationEnabled: boolean;

    /**
     * An object for controlling the back button which can be displayed in the header of the Mini App in the Telegram
     * interface.
     */
    BackButton: BackButton;

    /**
     * An object for controlling the main button, which is displayed at the bottom of the Mini App in the Telegram
     * interface.
     */
    MainButton: MainButton;

    //...

    /**
     * A method that sets the app event handler. Check the list of available events.
     */
    onEvent<EventType extends keyof MiniAppsEvents>(
        eventType: EventType,
        eventHandler: MiniAppsEvents[EventType]
    ): void;

    /**
     * A method that deletes a previously set event handler.
     */
    offEvent<EventType extends keyof MiniAppsEvents>(
        eventType: EventType,
        eventHandler: MiniAppsEvents[EventType]
    ): void;

    //...

    /**
     * Bot API 6.7+ A method that inserts the bot's username and the specified inline query in the current chat's input
     * field. Query may be empty, in which case only the bot's username will be inserted. If an optional
     * choose_chat_types parameter was passed, the client prompts the user to choose a specific chat, then opens that
     * chat and inserts the bot's username and the specified inline query in the input field. You can specify which
     * types of chats the user will be able to choose from. It can be one or more of the following types: users, bots,
     * groups, channels.
     */
    switchInlineQuery(query: string, choose_chat_types?: string): void;

    //...

    /**
     * A method that expands the Mini App to the maximum available height. To find out if the Mini App is expanded to
     * the maximum height, refer to the value of the {@link Telegram.WebApp.isExpanded} parameter
     */
    expand: () => void;
}

export interface ThemeParams {
    /**
     * Background color in the #RRGGBB format.
     * <br>
     * Also available as the CSS variable var(--tg-theme-bg-color).
     */
    bg_color?: string;

    /**
     * Main text color in the #RRGGBB format.
     * <br>
     * Also available as the CSS variable var(--tg-theme-text-color).
     */
    text_color?: string;

    /**
     * Hint text color in the #RRGGBB format.
     * <br>
     * Also available as the CSS variable var(--tg-theme-hint-color).
     */
    hint_color?: string;

    /**
     * Link color in the #RRGGBB format.
     * <br>
     * Also available as the CSS variable var(--tg-theme-link-color).
     */
    link_color?: string;

    /**
     * Button color in the #RRGGBB format.
     * <br>
     * Also available as the CSS variable var(--tg-theme-button-color).
     */
    button_color?: string;

    /**
     * Button text color in the #RRGGBB format.
     * <br>
     * Also available as the CSS variable var(--tg-theme-button-text-color).
     */
    button_text_color?: string;

    /**
     * Bot API 6.1+ Secondary background color in the #RRGGBB format.
     * <br>
     * Also available as the CSS variable var(--tg-theme-secondary-bg-color).
     */
    secondary_bg_color?: string;
}

/**
 * This object controls the back button, which can be displayed in the header of the Mini App in the Telegram interface.
 */
export interface BackButton {
    /**
     * Shows whether the button is visible. Set to false by default.
     */
    isVisible: boolean;

    /**
     * Bot API 6.1+ A method that sets the button press event handler. An alias for
     * <pre>Telegram.WebApp.onEvent('backButtonClicked', callback)</pre>
     */
    onClick(callback: () => void): void;

    /**
     * Bot API 6.1+ A method that removes the button press event handler. An alias for
     * <pre>Telegram.WebApp.offEvent('backButtonClicked', callback)</pre>
     */
    offClick(callback: () => void): void;

    /**
     * Bot API 6.1+ A method to make the button active and visible.
     */
    show(): void;

    /**
     * Bot API 6.1+ A method to hide the button.
     */
    hide(): void;
}

export interface MainButton {
    /**
     * Current button text. Set to CONTINUE by default.
     */
    text: string;

    /**
     * Current button color. Set to themeParams.button_color by default.
     */
    color: string;

    /**
     * Current button text color. Set to <i>themeParams.button_text_color</i> by default.
     */
    textColor: string;

    /**
     * Shows whether the button is visible. Set to false by default.
     */
    isVisible: boolean;

    /**
     * Shows whether the button is active. Set to true by default.
     */
    isActive: boolean;

    /**
     * Readonly. Shows whether the button is displaying a loading indicator.
     */
    isProgressVisible: boolean;

    /**
     * A method to set the button text.
     */
    setText(text: string): void;

    /**
     * A method that sets the button press event handler. An alias for
     * <pre>Telegram.WebApp.onEvent('mainButtonClicked', callback)</pre>
     */
    onClick(callback: () => void): void;

    /**
     * A method that removes the button press event handler. An alias for
     * <pre>Telegram.WebApp.offEvent('mainButtonClicked', callback)</pre>
     */
    offClick(callback: () => void): void;

    /**
     * A method to make the button visible.
     * Note that opening the Mini App from the attachment menu hides the main button until the user interacts with the
     * Mini App interface.
     */
    show(): void;

    /**
     * A method to hide the button.
     */
    hide(): void;

    /**
     * A method to enable the button.
     */
    enable(): void;

    /**
     * A method to disable the button.
     */
    disable(): void;

    /**
     * A method to show a loading indicator on the button.
     * It is recommended to display loading progress if the action tied to the button may take a long time. By default,
     * the button is disabled while the action is in progress. If the parameter leaveActive=true is passed, the button
     * remains enabled.
     */
    showProgress(leaveActive: boolean): void;

    /**
     * A method to hide the loading indicator.
     */
    hideProgress(): void;

    /**
     * A method to set the button parameters. The params parameter is an object containing one or several fields that
     * need to be changed:
     * text - button text;
     * color - button color;
     * text_color - button text color;
     * is_active - enable the button;
     * is_visible - show the button.
     */
    setParams(params: {
        text?: string;
        color?: string;
        text_color?: string;
        is_active?: boolean;
        is_visible?: boolean;
    }): void;
}

export interface WebAppUser {
    id: number;
    is_bot?: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: true;
    added_to_attachment_menu?: true;
    allows_write_to_pm?: true;
    photo_url?: string;
}

export interface WebAppChat {
    id: number;
    type: string;
    title: string;
    username?: string;
    photo_url?: string;
}

export interface WebAppInitData {
    query_id?: string;
    user?: WebAppUser;
    receiver?: WebAppUser;
    chat?: WebAppChat;
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
}
