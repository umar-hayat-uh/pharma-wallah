import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * Fluid Flow in Pharmaceutical Processing: Reynolds Number and Flow Regimes.
 *
 * DRAFT (2026-10-13): not listed, not in the sitemap. Every figure in the
 * examples, tables and practice answers was recomputed with python3 on
 * 2026-10-13. Fluid properties are illustrative round values. A chemical- or
 * pharmaceutical-engineering text for the Blasius range and the Moody chart is
 * not yet in the reference registry — see
 * content/briefs/reynolds-number-and-fluid-flow.md.
 *
 * `reynolds-number` is linked for Re and the regime only: it applies the
 * Blasius friction factor in the transitional band and above 10⁵ (recorded
 * fault), which this guide teaches against. `mixing-time-estimator`,
 * `heat-transfer-area` and `drying-rate` are not linked (recorded faults).
 */
export const guide: Guide = {
  slug: "reynolds-number-and-fluid-flow",
  title: "Fluid Flow in Pharmaceutical Processing: Reynolds Number and Flow Regimes",
  description:
    "Reynolds number for pipe flow explained: units, laminar, transitional and turbulent regimes, velocity from flow rate, and friction factors with their valid ranges.",
  category: "Pharmaceutical Engineering",

  objectives: [
    "Explain what the Reynolds number compares and why it decides how a fluid behaves in a pipe or vessel.",
    "Calculate Re = ρvD/μ in consistent SI units, including converting centipoise and flow rates.",
    "Classify pipe flow as laminar, transitional or turbulent, and explain why the boundaries are approximate.",
    "Use the laminar friction factor 64/Re and the Blasius correlation within its valid range, and recognise where neither applies.",
    "Relate flow regime to practical processing: pumping viscous liquids, mixing, heat transfer and cleaning.",
  ],

  intro: [
    "Liquids are moved through pipes, hoses and filling needles at every stage of manufacturing: purified water to a vessel, a syrup to a filling line, a cleaning solution through equipment. Whether that liquid flows in smooth layers or in a chaotic swirl of eddies changes how much pressure a pump must supply, how well the liquid mixes, how fast it heats or cools, and how well a cleaning solution scours a pipe wall.",
    "The Reynolds number is the single figure that predicts which of these behaviours you will get. It compares the inertia of the moving fluid, which tends to break the flow into eddies, with its viscosity, which damps them out. Water moving briskly through a pipe has a large Reynolds number and flows turbulently; glycerin or a thick syrup in the same pipe at the same speed has a tiny one and flows in orderly layers.",
    "This guide shows how to calculate the Reynolds number correctly, how to read the flow regime from it, and how friction factors follow from it — including the ranges in which the common formulas are valid. Fluid properties used in the examples are illustrative round values.",
  ],

  terms: [
    {
      term: "Reynolds number (Re)",
      definition:
        "A dimensionless number, ρvD ÷ μ, comparing inertial forces with viscous forces in a flowing fluid. Because it has no units, the same value means the same regime whatever the fluid or pipe size.",
    },
    {
      term: "Density (ρ)",
      definition: "Mass per unit volume, in kg/m³. Water at room temperature is close to 1000 kg/m³.",
    },
    {
      term: "Dynamic viscosity (μ)",
      definition:
        "A fluid's resistance to flow, in pascal-seconds (Pa·s). 1 centipoise (cP) = 1 mPa·s = 0.001 Pa·s. Water at 20 °C is about 1 cP.",
    },
    {
      term: "Kinematic viscosity (ν)",
      definition: "Dynamic viscosity divided by density, ν = μ ÷ ρ, in m²/s. Then Re = vD ÷ ν.",
    },
    {
      term: "Mean velocity (v)",
      definition:
        "The volumetric flow rate divided by the pipe's cross-sectional area, in m/s. The fluid at the wall moves more slowly and at the centre faster; v is the average.",
    },
    {
      term: "Laminar flow",
      definition:
        "Flow in smooth parallel layers with no mixing across them. In a pipe it occurs at low Re, conventionally below about 2000.",
    },
    {
      term: "Turbulent flow",
      definition:
        "Flow with irregular eddies that mix the fluid across the pipe. In a pipe it is conventionally taken as fully developed above about 4000.",
    },
    {
      term: "Transitional flow",
      definition:
        "The band between laminar and turbulent (roughly Re 2000 to 4000) in which the flow may switch between the two and is hard to predict.",
    },
    {
      term: "Darcy friction factor (f)",
      definition:
        "A dimensionless factor linking pressure loss in a pipe to the flow: Δp = f × (L ÷ D) × (ρv² ÷ 2). It depends on Re and, in turbulent flow, on the pipe's roughness.",
    },
  ],

  sections: [
    {
      id: "what-re-means",
      heading: "What the Reynolds number compares",
      blocks: [
        {
          kind: "p",
          text: "Picture dye injected into the centre of a glass tube carrying water. At low speed the dye draws a straight thread down the tube: the flow is laminar, each layer of liquid sliding past the next. Speed the water up and, at some point, the thread starts to wobble, then breaks up and spreads across the tube: the flow has become turbulent. Osborne Reynolds showed in the nineteenth century that the switch does not depend on speed alone, but on a combination of density, speed, tube diameter and viscosity — the number now named after him.",
        },
        {
          kind: "formula",
          expr: "Re = ρ × v × D ÷ μ = v × D ÷ ν",
          where: [
            { sym: "ρ", meaning: "density of the fluid (kg/m³)" },
            { sym: "v", meaning: "mean velocity in the pipe (m/s)" },
            { sym: "D", meaning: "internal diameter of the pipe (m)" },
            { sym: "μ", meaning: "dynamic viscosity (Pa·s = kg/(m·s))" },
            { sym: "ν", meaning: "kinematic viscosity, μ ÷ ρ (m²/s)" },
          ],
          note: "In SI units the units cancel completely: (kg/m³)(m/s)(m) ÷ (kg/(m·s)) has no units. If they do not cancel in your working, a unit has been mixed.",
        },
        {
          kind: "p",
          text: "Large Re means inertia dominates: small disturbances grow into eddies. Small Re means viscosity dominates: disturbances are damped and the flow stays layered. Thick, viscous liquids such as glycerin, syrups and oils have small Reynolds numbers even at moderate speeds, which is why they tend to flow in laminar fashion during processing.",
        },
        {
          kind: "example",
          title: "Example 1: Water in a process pipe",
          problem:
            "Water at 20 °C (ρ = 998 kg/m³, μ = 1.002 × 10⁻³ Pa·s) flows at 1.5 m/s through a pipe of 25 mm internal diameter. Find Re and the flow regime.",
          steps: [
            "Convert the diameter: 25 mm = 0.025 m.",
            "Re = 998 × 1.5 × 0.025 ÷ 1.002 × 10⁻³.",
            "Numerator = 37.425; Re = 37.425 ÷ 0.001002 = 37,350.",
          ],
          answer: "Re ≈ 37,400: turbulent flow.",
        },
        {
          kind: "example",
          title: "Example 2: Glycerin in the same pipe",
          problem:
            "Glycerin (ρ = 1260 kg/m³, μ = 1.49 Pa·s) flows at 0.5 m/s through the same 25 mm pipe. Find Re.",
          steps: [
            "Re = 1260 × 0.5 × 0.025 ÷ 1.49.",
            "Numerator = 15.75; Re = 15.75 ÷ 1.49 = 10.57.",
          ],
          answer: "Re ≈ 10.6: deeply laminar flow.",
          note: "Glycerin's viscosity is about 1500 times that of water, which is what pulls Re down by thousands even though its density is higher.",
        },
      ],
    },
    {
      id: "units-and-velocity",
      heading: "Getting the units right: viscosity and velocity from flow rate",
      blocks: [
        {
          kind: "p",
          text: "Almost every wrong Reynolds number comes from units. Viscosity is often given in centipoise, diameters in millimetres or inches, and flow rates in litres per minute. Convert everything to SI before substituting: kg/m³, m/s, m and Pa·s.",
        },
        {
          kind: "list",
          items: [
            "1 cP = 1 mPa·s = 0.001 Pa·s. So a 190 cP syrup has μ = 0.19 Pa·s.",
            "Diameter in mm ÷ 1000 = diameter in m. Use the internal diameter, not the nominal pipe size.",
            "Flow rate in L/min ÷ 1000 ÷ 60 = flow rate in m³/s.",
            "Kinematic viscosity in centistokes (cSt) × 10⁻⁶ = m²/s.",
          ],
        },
        {
          kind: "formula",
          expr: "v = Q ÷ A      A = π × D² ÷ 4",
          where: [
            { sym: "Q", meaning: "volumetric flow rate (m³/s)" },
            { sym: "A", meaning: "internal cross-sectional area of the pipe (m²)" },
            { sym: "D", meaning: "internal diameter (m)" },
          ],
        },
        {
          kind: "example",
          title: "Example 3: From a flow rate to Re",
          problem:
            "Water (ρ = 998 kg/m³, μ = 1.002 × 10⁻³ Pa·s) is pumped at 60 L/min through a pipe of 25 mm internal diameter. Find the mean velocity and Re.",
          steps: [
            "Q = 60 L/min = 60 ÷ 1000 ÷ 60 = 0.001 m³/s.",
            "A = π × 0.025² ÷ 4 = 4.909 × 10⁻⁴ m².",
            "v = 0.001 ÷ 4.909 × 10⁻⁴ = 2.037 m/s.",
            "Re = 998 × 2.037 × 0.025 ÷ 0.001002 = 50,730.",
          ],
          answer: "v ≈ 2.04 m/s; Re ≈ 50,700 (turbulent).",
        },
      ],
    },
    {
      id: "regimes",
      heading: "Flow regimes in a pipe",
      blocks: [
        {
          kind: "table",
          caption: "Conventional flow regimes for flow in a straight, circular pipe",
          head: ["Re", "Regime", "What the flow is like"],
          rows: [
            ["Below about 2000", "Laminar", "Smooth layers; velocity profile is parabolic; no mixing across the pipe"],
            ["About 2000 to 4000", "Transitional", "Unstable; may switch between laminar and turbulent; hard to predict"],
            ["Above about 4000", "Turbulent", "Eddies mix the fluid across the pipe; flatter velocity profile"],
          ],
        },
        {
          kind: "p",
          text: "The boundaries are conventions, not sharp physical limits. Some texts put the upper limit of laminar flow at 2100 or 2300. With a very smooth pipe and a calm inlet, laminar flow can persist above those values; with vibration, bends or a rough entry, turbulence can begin below them. Treat a calculated Re near a boundary as \"could be either\".",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Stirred vessels use a different Reynolds number",
          text: "In a mixing tank the length is the impeller diameter and the speed is the rotation rate: Re = ρ × N × D² ÷ μ, with N in revolutions per second and D the impeller diameter. The laminar and turbulent limits for stirred tanks are different from those for pipes and depend on the impeller and tank; take them from your engineering text, not from the pipe table above.",
        },
        {
          kind: "example",
          title: "Example 4: One impeller, two liquids",
          problem:
            "An impeller of 0.1 m diameter turns at 300 rpm (5 rev/s). Find the mixing Reynolds number in water (ρ = 998 kg/m³, μ = 1.002 × 10⁻³ Pa·s) and in glycerin (ρ = 1260 kg/m³, μ = 1.49 Pa·s).",
          steps: [
            "D² = 0.1² = 0.01 m².",
            "Water: Re = 998 × 5 × 0.01 ÷ 0.001002 = 49,800.",
            "Glycerin: Re = 1260 × 5 × 0.01 ÷ 1.49 = 42.3.",
          ],
          answer: "About 49,800 in water and 42 in glycerin: the same impeller mixes the two in completely different regimes.",
          note: "This is why a mixer that works well for an aqueous solution can leave a viscous gel poorly mixed: at low Re the impeller moves only the liquid near it.",
        },
      ],
    },
    {
      id: "friction",
      heading: "Friction factor and pressure drop",
      blocks: [
        {
          kind: "p",
          text: "Friction between the fluid and the pipe wall costs pressure, which the pump must supply. The Darcy–Weisbach equation expresses that loss through a friction factor, and the Reynolds number tells you which formula for the friction factor applies.",
        },
        {
          kind: "formula",
          expr: "Δp = f × (L ÷ D) × (ρ × v² ÷ 2)",
          where: [
            { sym: "Δp", meaning: "pressure loss along the pipe (Pa)" },
            { sym: "f", meaning: "Darcy friction factor (dimensionless)" },
            { sym: "L", meaning: "pipe length (m)" },
            { sym: "D", meaning: "internal diameter (m)" },
            { sym: "ρ, v", meaning: "density (kg/m³) and mean velocity (m/s)" },
          ],
        },
        {
          kind: "formula",
          expr: "Laminar (Re below about 2000): f = 64 ÷ Re      Blasius, smooth pipes, roughly 4000 < Re < 10⁵: f = 0.316 × Re^(−0.25)",
          note: "Blasius is an empirical fit for smooth pipes over a limited turbulent range. It does not apply in the transitional band, above about 10⁵, or to rough pipes; there, use the Moody chart or the Colebrook equation. In the transitional band no single friction factor can be relied on.",
        },
        {
          kind: "example",
          title: "Example 5: Laminar flow of a viscous syrup",
          problem:
            "A syrup (ρ = 1300 kg/m³, μ = 190 cP) flows at 0.3 m/s through 5 m of 20 mm internal-diameter tubing. Find Re, f and the pressure drop.",
          steps: [
            "μ = 190 cP = 0.19 Pa·s; D = 0.02 m.",
            "Re = 1300 × 0.3 × 0.02 ÷ 0.19 = 41.05 (laminar).",
            "f = 64 ÷ 41.05 = 1.559.",
            "Δp = 1.559 × (5 ÷ 0.02) × (1300 × 0.3² ÷ 2) = 1.559 × 250 × 58.5 = 22,800 Pa.",
            "Check with the Hagen–Poiseuille equation for laminar flow, Δp = 32μLv ÷ D² = 32 × 0.19 × 5 × 0.3 ÷ 0.02² = 22,800 Pa. The two agree, as they must.",
          ],
          answer: "Re ≈ 41, f ≈ 1.56, Δp ≈ 22,800 Pa (about 22.8 kPa).",
        },
        {
          kind: "example",
          title: "Example 6: Turbulent flow within the Blasius range",
          problem:
            "For the water flow in Example 3 (Re = 50,730, v = 2.037 m/s, D = 0.025 m), estimate f and the pressure drop over 10 m of smooth pipe.",
          steps: [
            "Re lies between about 4000 and 10⁵, and the pipe is smooth, so Blasius applies.",
            "f = 0.316 × 50,730^(−0.25) = 0.02106.",
            "Δp = 0.02106 × (10 ÷ 0.025) × (998 × 2.037² ÷ 2) = 17,440 Pa.",
          ],
          answer: "f ≈ 0.0211; Δp ≈ 17.4 kPa over 10 m.",
        },
      ],
    },
    {
      id: "in-practice",
      heading: "Why the regime matters in processing",
      blocks: [
        {
          kind: "list",
          items: [
            "Pumping: in laminar flow the pressure drop rises in proportion to velocity and viscosity, so a viscous product needs a much larger pump or a wider line.",
            "Mixing: turbulence mixes quickly; in laminar flow mixing relies on the impeller's direct sweep and on slow diffusion.",
            "Heat transfer: turbulent flow carries heat to and from the wall far better, so heating or cooling a viscous liquid is slower.",
            "Cleaning: turbulent flow scours pipe walls; cleaning-in-place is usually designed to run the cleaning solution turbulently.",
            "Scale-up: keeping the same Reynolds number when moving from a laboratory to a production vessel helps keep the flow pattern similar, though other factors also change with scale.",
          ],
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Temperature changes viscosity",
          text: "Viscosity falls sharply as most liquids warm, so the same syrup can be laminar at 20 °C and much closer to transitional when heated. Always use the viscosity at the actual process temperature.",
        },
      ],
    },
  ],

  mistakes: [
    "Using the diameter in millimetres, or the viscosity in centipoise, without converting to metres and Pa·s — the answer is out by a factor of 1000.",
    "Using a flow rate (L/min) in place of a velocity (m/s). Divide the volumetric flow rate by the cross-sectional area first.",
    "Using the radius instead of the diameter, or the nominal pipe size instead of the internal diameter.",
    "Mixing up dynamic viscosity (Pa·s) and kinematic viscosity (m²/s). Re = ρvD/μ uses dynamic; Re = vD/ν uses kinematic.",
    "Treating 2000 and 4000 as sharp physical limits rather than conventional guides.",
    "Applying the Blasius friction factor in the transitional band, above about 10⁵, or to rough pipes.",
    "Applying the pipe-flow regime limits to a stirred vessel, which uses the impeller form of Re and different limits.",
  ],

  practice: [
    {
      q: "Ethanol (ρ = 789 kg/m³, μ = 1.2 × 10⁻³ Pa·s) flows at 0.8 m/s through a pipe of 20 mm internal diameter. Find Re and the regime.",
      answer: "Re ≈ 10,520: turbulent.",
      working: [
        "D = 0.020 m.",
        "Re = 789 × 0.8 × 0.020 ÷ 0.0012 = 12.624 ÷ 0.0012 = 10,520.",
        "Above about 4000, so turbulent.",
      ],
    },
    {
      q: "An oil (ρ = 920 kg/m³, μ = 0.29 Pa·s) flows at 1.2 m/s in a 50 mm pipe. Find Re and the regime.",
      answer: "Re ≈ 190: laminar.",
      working: [
        "D = 0.050 m.",
        "Re = 920 × 1.2 × 0.05 ÷ 0.29 = 55.2 ÷ 0.29 = 190.3.",
        "Below about 2000, so laminar.",
      ],
    },
    {
      q: "A dilute aqueous solution (ρ = 1000 kg/m³, μ = 1.0 cP) flows at 0.05 m/s through 10 mm tubing. Find Re.",
      answer: "Re = 500: laminar.",
      working: [
        "μ = 1.0 cP = 0.001 Pa·s; D = 0.010 m.",
        "Re = 1000 × 0.05 × 0.010 ÷ 0.001 = 500.",
      ],
    },
    {
      q: "Water (ρ = 998 kg/m³, μ = 1.002 × 10⁻³ Pa·s) flows in a 15 mm pipe. Below what mean velocity is the flow laminar, taking Re = 2000 as the limit?",
      answer: "About 0.134 m/s.",
      working: [
        "Rearrange Re = ρvD/μ: v = Re × μ ÷ (ρ × D).",
        "v = 2000 × 0.001002 ÷ (998 × 0.015) = 2.004 ÷ 14.97 = 0.1339 m/s.",
      ],
    },
    {
      q: "Water (ρ = 998 kg/m³, μ = 1.002 × 10⁻³ Pa·s) flows at 10 L/min through a pipe of 20 mm internal diameter. Find v and Re.",
      answer: "v ≈ 0.531 m/s; Re ≈ 10,570 (turbulent).",
      working: [
        "Q = 10 ÷ 1000 ÷ 60 = 1.667 × 10⁻⁴ m³/s.",
        "A = π × 0.020² ÷ 4 = 3.142 × 10⁻⁴ m².",
        "v = 1.667 × 10⁻⁴ ÷ 3.142 × 10⁻⁴ = 0.5305 m/s.",
        "Re = 998 × 0.5305 × 0.020 ÷ 0.001002 = 10,570.",
      ],
    },
    {
      q: "Flow in a pipe has Re = 800. What is the Darcy friction factor?",
      answer: "f = 0.08.",
      working: [
        "Re is below about 2000, so the flow is laminar and f = 64 ÷ Re.",
        "f = 64 ÷ 800 = 0.08.",
      ],
    },
    {
      q: "Estimate the friction factor for smooth-pipe flow at Re = 20,000. What would you do instead at Re = 3000?",
      answer: "f ≈ 0.0266 at Re = 20,000; at Re = 3000 no single correlation is reliable.",
      working: [
        "Re = 20,000 lies within the Blasius range (about 4000 to 10⁵) for a smooth pipe.",
        "f = 0.316 × 20,000^(−0.25) = 0.316 ÷ 11.89 = 0.02657.",
        "Re = 3000 is in the transitional band. Blasius does not apply there, and the flow may be laminar or turbulent; state that the regime is uncertain rather than quoting one f.",
      ],
    },
    {
      q: "A liquid with kinematic viscosity 1.0 × 10⁻⁶ m²/s flows at 2 m/s in a 50 mm pipe. Find Re. Is the Blasius equation appropriate?",
      answer: "Re = 1.0 × 10⁵; this is at the upper edge of the Blasius range, so use the Moody chart or Colebrook equation for a reliable f.",
      working: [
        "Re = v × D ÷ ν = 2 × 0.05 ÷ 1.0 × 10⁻⁶ = 100,000.",
        "Blasius is fitted only up to about 10⁵ for smooth pipes, so this value is at its limit; for real roughness or higher Re it should not be used.",
      ],
    },
  ],

  limitations: [
    "The regime limits and friction-factor formulas here are for steady flow of Newtonian liquids in straight, circular, full pipes. Bends, valves, entrances and partly filled lines behave differently.",
    "Many pharmaceutical liquids — gels, creams, suspensions, some syrups — are non-Newtonian: their viscosity changes with shear rate, so a single μ, and the simple Re, does not describe them fully.",
    "The Blasius correlation is valid only for smooth pipes over roughly 4000 < Re < 10⁵. Rough pipes and higher Reynolds numbers need the Moody chart or the Colebrook equation, and transitional flow has no reliable single friction factor.",
    "Fluid properties in the examples are illustrative. Real design uses measured properties at the process temperature and the equipment supplier's data.",
  ],

  refs: ["aulton6", "bipmSI"],

  relatedTools: [
    {
      slug: "reynolds-number",
      name: "Reynolds Number Calculator",
      why: "Computes Re = ρvD/μ in SI units and names the regime with the same 2000/4000 conventions as this guide. Use it for Re and the regime only: it also applies the Blasius friction factor in the transitional band and above 10⁵, where the friction section explains Blasius does not hold.",
    },
  ],

  relatedGuides: ["calorimetry-and-heat-of-neutralization"],

  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
