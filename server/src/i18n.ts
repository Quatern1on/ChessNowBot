import i18n from "i18n";
import path from "path";

i18n.configure({
    directory: path.join("locales"),
    defaultLocale: "en",
    objectNotation: true,
    retryInDefaultLocale: true,
    updateFiles: false,
});
