import {DateTime} from "luxon";

export class PausableTimer {
    private readonly callback: () => void;

    private _timeLeft: number;

    private startTime: DateTime | null;

    private timeoutID: NodeJS.Timeout | null;

    constructor(callback: () => void, timeout?: number) {
        this.callback = callback;
        if (timeout) {
            this._timeLeft = timeout;
        } else {
            this._timeLeft = 0;
        }

        this.startTime = null;
        this.timeoutID = null;
    }

    public get isGoing(): boolean {
        return this.startTime !== null;
    }

    public get timeLeft(): number {
        if (this.startTime) {
            const timeSpent = DateTime.now().toMillis() - this.startTime.toMillis();
            return this._timeLeft - timeSpent;
        }

        return this._timeLeft;
    }

    public readonly start = (timeout?: number): void => {
        if (timeout !== undefined) {
            this._timeLeft = timeout;
        }

        this.timeoutID = setTimeout(this.handleTimeout, this._timeLeft);
        this.startTime = DateTime.now();
    };

    public readonly pause = (): void => {
        if (!this.timeoutID || !this.startTime) {
            return;
        }
        clearTimeout(this.timeoutID);

        const timeSpent = DateTime.now().toMillis() - this.startTime.toMillis();
        this._timeLeft -= timeSpent;
        if (this.timeLeft < 0) {
            this._timeLeft = 0;
        }

        this.timeoutID = null;
        this.startTime = null;
    };

    public readonly stop = (): void => {
        if (!this.timeoutID || !this.startTime) {
            return;
        }
        clearTimeout(this.timeoutID);

        this._timeLeft = 0;

        this.timeoutID = null;
        this.startTime = null;
    };

    public readonly addTime = (time: number): void => {
        if (this.isGoing) {
            this.pause();
            this._timeLeft += time;
            this.start();
        } else {
            this._timeLeft += time;
        }
    };

    private readonly handleTimeout = (): void => {
        this._timeLeft = 0;
        this.startTime = null;
        this.timeoutID = null;
        this.callback();
    };
}
