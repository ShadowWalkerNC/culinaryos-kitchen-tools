export function systemClock(tz = 'UTC') {
    return { now: () => new Date(), tz };
}
export function fixedClock(iso, tz = 'UTC') {
    let t = Date.parse(iso);
    return {
        tz,
        now: () => new Date(t),
        advance(ms) {
            t += ms;
        },
    };
}
/** Daily occurrence key: YYYY-MM-DD in the clock's timezone. */
export function occurrenceDay(clock, d = clock.now()) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: clock.tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    return parts; // YYYY-MM-DD
}
/** True when d is at/after the daily cutoff (HH:MM in tz). */
export function pastCutoff(clock, cutoffHHMM, d = clock.now()) {
    const [hh, mm] = cutoffHHMM.split(':').map(Number);
    const inTz = new Intl.DateTimeFormat('en-GB', { timeZone: clock.tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    const [ch, cm] = inTz.split(':').map(Number);
    return ch * 60 + cm >= hh * 60 + mm;
}
//# sourceMappingURL=clocks.js.map