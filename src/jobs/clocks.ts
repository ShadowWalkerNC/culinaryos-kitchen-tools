// F12 injectable clocks with timezone + DST-safe occurrence math.
export interface Clock {
  now(): Date;
  tz: string;
}

export function systemClock(tz = 'UTC'): Clock {
  return { now: () => new Date(), tz };
}

export function fixedClock(iso: string, tz = 'UTC'): Clock & { advance(ms: number): void } {
  let t = Date.parse(iso);
  return {
    tz,
    now: () => new Date(t),
    advance(ms: number): void {
      t += ms;
    },
  };
}

/** Daily occurrence key: YYYY-MM-DD in the clock's timezone. */
export function occurrenceDay(clock: Clock, d: Date = clock.now()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: clock.tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  return parts; // YYYY-MM-DD
}

/** True when d is at/after the daily cutoff (HH:MM in tz). */
export function pastCutoff(clock: Clock, cutoffHHMM: string, d: Date = clock.now()): boolean {
  const [hh, mm] = cutoffHHMM.split(':').map(Number);
  const inTz = new Intl.DateTimeFormat('en-GB', { timeZone: clock.tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  const [ch, cm] = inTz.split(':').map(Number);
  return (ch as number) * 60 + (cm as number) >= (hh as number) * 60 + (mm as number);
}
