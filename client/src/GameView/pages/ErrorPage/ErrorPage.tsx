import {Container, Typography} from "@mui/material";
import type {FC} from "react";
import {useTranslation} from "react-i18next";

export const ErrorPage: FC = () => {
    const {t} = useTranslation();

    return (
        <Container maxWidth="sm" style={{marginTop: "50px"}}>
            <Typography variant="h6" gutterBottom>
                {t("error.title")}
            </Typography>
            <Typography variant="body2" paragraph>
                {t("error.message")}
            </Typography>
            <Typography variant="body2" paragraph>
                {t("error.possibleSolutions")}
            </Typography>
            <ul>
                <li>
                    <Typography variant="body2">{t("error.checkInternet")}</Typography>
                </li>
                <li>
                    <Typography variant="body2">{t("error.refreshPage")}</Typography>
                </li>
                <li>
                    <Typography variant="body2">{t("error.contactSupport")}</Typography>
                </li>
            </ul>
        </Container>
    );
};
