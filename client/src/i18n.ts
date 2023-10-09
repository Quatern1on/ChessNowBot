import i18n from "i18next";
import {initReactI18next} from "react-i18next";

const urlLang = new URLSearchParams(window.location.search).get("lang");
const webAppLang = window.Telegram.WebApp.initDataUnsafe.user?.language_code;

i18n.use(initReactI18next).init({
    resources: {
        en: {
            translation: {
                settings: {
                    timer: "Enable timer",
                    initTime: "Minutes per player",
                    increment: "Increment in seconds",
                    color: "Your color",
                    colors: {
                        black: "Black",
                        random: "Random",
                        white: "White",
                    },
                    done: "Create",
                },
                game: {
                    connecting: "Connecting",
                    waitingForUser: "Waiting for {{user}} to connect",
                    waitingForAnyone: "Waiting for anyone to join",
                    you: "You",
                    giveUpPopup: {
                        title: "Give up",
                        content: "Are you sure you want to give up?",
                        cancel: "Cancel",
                        confirm: "Give up",
                    },
                },
                error: {
                    title: "Oops! Something went wrong.",
                    message: "We apologize for the inconvenience. There was an error processing your request.",
                    possibleSolutions: "Possible solutions:",
                    checkInternet: "Check your internet connection.",
                    refreshPage: "Try refreshing the page.",
                    contactSupport: "Contact our support team for further assistance.",
                },
                gameResult: {
                    rematch: "Rematch",
                    victory: {
                        title: "Victory",
                        explanation: {
                            checkmate: "You checkmated your opponent",
                            "out-of-time": "Your opponent ran out of time",
                            "player-quit": "Your opponent quit the game",
                            "give-up": "Your opponent gave up",
                        },
                    },
                    defeat: {
                        title: "Defeat",
                        explanation: {
                            checkmate: "Your opponent checkmated you",
                            "out-of-time": "You ran out of time",
                            "player-quit": "You quit the game",
                            "give-up": "You gave up",
                        },
                    },
                    draw: {
                        title: "Draw",
                        explanation: {
                            stalemate: "Stalemate",
                            draw: "Technical draw",
                        },
                    },
                    spectator: {
                        title: "Game Over",
                        explanation: {
                            checkmate: "{{winner}} checkmated {{loser}}",
                            "out-of-time": "{{loser}}'s timer ran out",
                            "player-quit": "{{loser}} left the game",
                            "give-up": "{{loser}} gave up",
                            stalemate: "Stalemate",
                            draw: "Technical Draw",
                        },
                    },
                },
            },
        },
        ru: {
            translation: {
                settings: {
                    timer: "Использовать таймер",
                    initTime: "Минут на игрока",
                    increment: "Бонусное время в секундах",
                    color: "Ваш цвет",
                    colors: {
                        black: "Чёрный",
                        random: "Случайно",
                        white: "Белый",
                    },
                    done: "Создать",
                },
                game: {
                    connecting: "Подключение",
                    waitingForUser: "Ожидание подключения пользователя {{user}}",
                    waitingForAnyone: "Ожидание пока кто-нибудь присоеденится",
                    you: "Вы",
                    giveUpPopup: {
                        title: "Сдаться",
                        content: "Вы уверены, что хотите сдаться?",
                        cancel: "Отмена",
                        confirm: "Сдаться",
                    },
                },
                error: {
                    title: "Упс! Что-то пошло не так.",
                    message: "Приносим извинения за неудобства. Произошла ошибка при обработке вашего запроса.",
                    possibleSolutions: "Возможные решения:",
                    checkInternet: "Проверьте подключение к интернету.",
                    refreshPage: "Попробуйте обновить страницу.",
                    contactSupport: "Свяжитесь с нашей службой поддержки для получения дополнительной помощи.",
                },
                gameResult: {
                    rematch: "Реванш",
                    victory: {
                        title: "Победа",
                        explanation: {
                            checkmate: "Вы поставили мат вашему противнику",
                            "out-of-time": "У вашего противника закончилось время",
                            "player-quit": "Ваш противник покинул игру",
                            "give-up": "Ваш противник сдался",
                        },
                    },
                    defeat: {
                        title: "Поражение",
                        explanation: {
                            checkmate: "Противник поставил вам мат",
                            "out-of-time": "У вас закончилось время",
                            "player-quit": "Вы покинули игру",
                            "give-up": "Вы сдались",
                        },
                    },
                    draw: {
                        title: "Ничья",
                        explanation: {
                            stalemate: "Пат",
                            draw: "Техническая ничья",
                        },
                    },
                    spectator: {
                        title: "Игра завершена",
                        explanation: {
                            checkmate: "{{winner}} поставили мат {{loser}}",
                            "out-of-time": "Таймер {{loser}} опустился до нуля",
                            "player-quit": "{{loser}} покинул игру",
                            "give-up": "{{loser}} сдался",
                            stalemate: "Пат",
                            draw: "Техническая ничья",
                        },
                    },
                },
            },
        },
        uk: {
            translation: {
                settings: {
                    timer: "Використовувати таймер",
                    initTime: "Хвилин на гравця",
                    increment: "Бонусний час у секундах",
                    color: "Ваш колір",
                    colors: {
                        black: "Чорний",
                        random: "Випадковий",
                        white: "Білий",
                    },
                    done: "Створити",
                },
                game: {
                    connecting: "Підключення",
                    waitingForUser: "Очікування підключення користувача {{user}}",
                    waitingForAnyone: "Очікування, доки хтось приєднається",
                    you: "Ви",
                    giveUpPopup: {
                        title: "Здатися",
                        content: "Ви впевнені, що хочете здатися?",
                        cancel: "Скасувати",
                        confirm: "Здатися",
                    },
                },
                error: {
                    title: "Ой! Щось пішло не так.",
                    message: "Вибачте за незручності. Виникла помилка при обробці вашого запиту.",
                    possibleSolutions: "Можливі рішення:",
                    checkInternet: "Перевірте підключення до Інтернету.",
                    refreshPage: "Спробуйте оновити сторінку.",
                    contactSupport: "Зверніться до нашої служби підтримки для отримання додаткової допомоги.",
                },
                gameResult: {
                    rematch: "Реванш",
                    victory: {
                        title: "Перемога",
                        explanation: {
                            checkmate: "Ви поставили мат вашому супротивнику",
                            "out-of-time": "У вашого супротивника закінчився час",
                            "player-quit": "Ваш супротивник покинув гру",
                            "give-up": "Ваш супротивник здався",
                        },
                    },
                    defeat: {
                        title: "Поразка",
                        explanation: {
                            checkmate: "Супротивник поставив вам мат",
                            "out-of-time": "У вас закінчився час",
                            "player-quit": "Ви покинули гру",
                            "give-up": "Ви здались",
                        },
                    },
                    draw: {
                        title: "Нічия",
                        explanation: {
                            stalemate: "Пат",
                            draw: "Технічна нічия",
                        },
                    },
                    spectator: {
                        title: "Гра завершена",
                        explanation: {
                            checkmate: "{{winner}} поставили мат {{loser}}",
                            "out-of-time": "Таймер {{loser}} опустився до нуля",
                            "player-quit": "{{loser}} покинув гру",
                            "give-up": "{{loser}} здався",
                            stalemate: "Пат",
                            draw: "Технічна нічия",
                        },
                    },
                },
            },
        },
    },
    lng: urlLang || webAppLang || "en",
    fallbackLng: "en",

    interpolation: {
        escapeValue: false,
    },
});
