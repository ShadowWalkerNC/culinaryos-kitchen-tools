export interface Clock {
    now(): Date;
    tz: string;
}
export declare function systemClock(tz?: string): Clock;
export declare function fixedClock(iso: string, tz?: string): Clock & {
    advance(ms: number): void;
};
/** Daily occurrence key: YYYY-MM-DD in the clock's timezone. */
export declare function occurrenceDay(clock: Clock, d?: Date): string;
/** True when d is at/after the daily cutoff (HH:MM in tz). */
export declare function pastCutoff(clock: Clock, cutoffHHMM: string, d?: Date): boolean;
//# sourceMappingURL=clocks.d.ts.map