import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the IV drip rate calculator. Every figure matches what
 * the page prints for 500 mL over 4 hours on a 20 gtt/mL set (drip rate as a
 * whole number and to 1 dp, pump rate to 1 dp, drop interval to 1 dp, total
 * drops as an integer) and was recomputed in Python. The infusion is an
 * illustrative teaching set-up, not a prescription.
 */
export const LEARN: CalcEducation = {
    workedExample: {
        title: "Gravity drip rate and pump rate for a 500 mL bag",
        scenario:
            "A teaching exercise: 500 mL of an IV fluid is to run over 4 hours through an administration set whose package states 20 gtt/mL. Work out the rate to program on a pump, the drip rate for a gravity line, and how to check it with a watch.",
        given: [
            { label: "Volume", value: "500 mL" },
            { label: "Duration", value: "4 hours" },
            { label: "Drop factor (on the set)", value: "20 gtt/mL" },
        ],
        steps: [
            { label: "Convert the time", working: "4 h × 60 = 240 min" },
            { label: "Drip rate", working: "(Volume × drop factor) ÷ time in minutes = (500 mL × 20 gtt/mL) ÷ 240 min = 41.7 gtt/min" },
            { label: "Round to whole drops", working: "41.7 → 42 gtt/min" },
            { label: "Pump rate", working: "Volume ÷ time in hours = 500 mL ÷ 4 h = 125 mL/hr" },
            { label: "Drop interval", working: "60 s ÷ 41.67 gtt/min = 1.4 s per drop" },
            { label: "Total drops in the bag", working: "500 mL × 20 gtt/mL = 10,000 gtt" },
        ],
        answer: "Pump: 125 mL/hr. Gravity line: 42 gtt/min (41.7 exact), about one drop every 1.4 seconds.",
        interpretation:
            "Both numbers describe the same flow: 125 mL every hour is 2.08 mL a minute, and at 20 drops per mL that is 41.7 drops a minute. The drip rate only holds for the drop factor printed on the set actually in use — the same bag on a 15 gtt/mL set is 31 gtt/min, and on a 60 gtt/mL microdrip set it is 125 gtt/min. This is an arithmetic exercise on illustrative values: the volume, duration and rate of a real infusion are set by the prescriber and the institution's protocol, and a pump is programmed according to its own drug library and local policy, not from this calculator.",
    },
    mistakes: [
        "Dividing by hours in the drip-rate formula. gtt/min needs the time in minutes; using 4 instead of 240 gives 2500 gtt/min, a number no gravity line can run at.",
        "Using the wrong drop factor. Macrodrip sets are 10, 15 or 20 gtt/mL and microdrip sets 60 gtt/mL; read it from the package of the set in use, because the same order gives 31, 42 or 125 gtt/min depending on the set.",
        "Programming a pump in gtt/min or counting drops at the mL/hr figure. A pump takes mL/hr; a gravity line is counted in gtt/min. They are only numerically equal on a 60 gtt/mL set.",
        "Converting a duration in minutes wrongly. 1 h 30 min is 1.5 h, not 1.3 h (500 mL over 1.3 h would run at 385 mL/hr instead of 333); switch the unit on the page rather than converting by hand.",
        "Rounding too early. Round the drip rate once, at the end (41.67 → 42); rounding the mL/min first (2.08 → 2) and then multiplying gives 40 gtt/min.",
    ],
    limitations: [
        "Assumes a constant rate for the whole infusion. Gravity flow changes with bag height, patient position, cannula patency and as the bag empties, so it must be recounted.",
        "Drop factors are nominal: drop size varies with the fluid's viscosity and surface tension, so viscous fluids and blood do not deliver exactly the stated drops per mL.",
        "Does not convert a dose (mg/kg/min, units/hr) into a rate; it starts from a volume and a time already decided.",
        "The 'rapid' (≥ 500 mL/hr) and 'low / KVO' (≤ 25 mL/hr) labels are fixed teaching cut-offs, not limits for any particular patient or fluid.",
    ],
    refs: ["ansel16"],
    related: [
        {
            slug: "reconstitution-calculator",
            name: "Reconstitution & IV Compounding Calculator",
            why: "Work out the concentration in a vial and carrier bag before setting the infusion rate.",
        },
        {
            slug: "tpn",
            name: "TPN Admixture Calculator",
            why: "Build a parenteral nutrition bag whose total volume then sets the rate over the infusion period.",
        },
    ],
    guide: {
        slug: "dose-calculations",
        title: "Pharmaceutical Dose Calculations: Units, Body Weight and Body Surface Area",
    },
};
