import {Typography} from "@mui/material";
import {FC, useEffect, useRef, useState} from "react";
import Countdown, {zeroPad} from "react-countdown";

export type PlayerTimerProps = {
    timeLeft: number;
    going: boolean;
    turnIndicator: boolean;
};

export const PlayerTimer: FC<PlayerTimerProps> = ({timeLeft, going, turnIndicator}) => {
    const countdownRef = useRef<Countdown>(null);
    const [date, setDate] = useState(Date.now() + timeLeft);

    useEffect(() => {
        if (going) {
            countdownRef.current!.start();
        } else {
            countdownRef.current!.stop();
        }
    }, [going]);

    useEffect(() => {
        setDate(Date.now() + timeLeft);
    }, [timeLeft]);

    return (
        <Typography
            variant="button"
            color={turnIndicator ? "primary" : undefined}
            sx={{
                transition: "color .2s ease-in-out",
            }}>
            <Countdown
                date={date}
                ref={countdownRef}
                autoStart={false}
                intervalDelay={100}
                precision={1}
                renderer={({minutes, seconds, milliseconds}) => (
                    <span>
                        {zeroPad(minutes)}:{zeroPad(seconds)}.{milliseconds / 100}
                    </span>
                )}
            />
        </Typography>
    );
};
