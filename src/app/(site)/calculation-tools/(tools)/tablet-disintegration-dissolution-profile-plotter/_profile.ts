/**
 * Pure profile maths for the disintegration/dissolution plotter.
 *
 * One interpolation routine replaces the original's three copies (T₅₀ helper,
 * T₉₀ loop, disintegration-time loop). They were identical apart from the
 * threshold and the column, so the numbers are unchanged: the first point at or
 * above the threshold is found; if it is the first row its time is returned,
 * otherwise time is linearly interpolated from the row before it.
 */

export type TimePoint = {
    time: number;
    disintegration: number;
    dissolution: number;
};

export type ProfileKey = "disintegration" | "dissolution";

export type Crossing = {
    value: number;
    threshold: number;
    /** The bracketing rows used for interpolation; `prev` is null when the first row already qualifies. */
    prev: TimePoint | null;
    curr: TimePoint;
};

export function timeToReach(data: TimePoint[], key: ProfileKey, threshold: number): Crossing | null {
    for (let i = 0; i < data.length; i++) {
        if (data[i][key] >= threshold) {
            if (i === 0) return { value: data[i].time, threshold, prev: null, curr: data[i] };
            // Linear interpolation
            const prev = data[i - 1];
            const curr = data[i];
            const ratio = (threshold - prev[key]) / (curr[key] - prev[key]);
            return { value: prev.time + ratio * (curr.time - prev.time), threshold, prev, curr };
        }
    }
    return null;
}

/** USP Q check: needs a data point at exactly `time`. */
export function checkQValue(data: TimePoint[], time = 30, q = 80) {
    const point = data.find((p) => p.time === time);
    if (!point) return null;
    return { meets: point.dissolution >= q, value: point.dissolution, required: q };
}

export function profileParameters(data: TimePoint[]) {
    return {
        td: timeToReach(data, "disintegration", 100),
        t50Disintegration: timeToReach(data, "disintegration", 50),
        t50Dissolution: timeToReach(data, "dissolution", 50),
        t90: timeToReach(data, "dissolution", 90),
        q: checkQValue(data, 30, 80),
    };
}

export const DEFAULT_POINTS: TimePoint[] = [
    { time: 0, disintegration: 0, dissolution: 0 },
    { time: 5, disintegration: 15, dissolution: 5 },
    { time: 10, disintegration: 65, dissolution: 25 },
    { time: 15, disintegration: 100, dissolution: 60 },
    { time: 20, disintegration: 100, dissolution: 85 },
    { time: 30, disintegration: 100, dissolution: 98 },
];

export const SAMPLE_PROFILES: { name: string; short: string; data: { time: number; dis: number; diss: number }[] }[] = [
    {
        name: "Immediate Release",
        short: "IR",
        data: [
            { time: 0, dis: 0, diss: 0 }, { time: 2, dis: 95, diss: 40 }, { time: 5, dis: 100, diss: 85 }, { time: 10, dis: 100, diss: 98 },
        ],
    },
    {
        name: "Extended Release",
        short: "ER",
        data: [
            { time: 0, dis: 0, diss: 0 }, { time: 10, dis: 40, diss: 15 }, { time: 30, dis: 100, diss: 50 }, { time: 60, dis: 100, diss: 85 }, { time: 120, dis: 100, diss: 98 },
        ],
    },
    {
        name: "Fast Disintegrating",
        short: "ODT",
        data: [
            { time: 0, dis: 0, diss: 0 }, { time: 1, dis: 80, diss: 10 }, { time: 3, dis: 100, diss: 35 }, { time: 10, dis: 100, diss: 75 }, { time: 20, dis: 100, diss: 95 },
        ],
    },
];
