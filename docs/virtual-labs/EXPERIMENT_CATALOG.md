# Virtual Labs: experiment catalogue

There are four experiments, one per lab. Everything below is read from `src/lib/virtual-labs/experiments/*.ts` and
`src/lib/virtual-labs/calculations/*.ts` as of 2026-10-20. Curriculum evidence is in
[CURRICULUM_MAPPING](CURRICULUM_MAPPING.md). Engine behaviour (undo, hints, scoring) is in
[ARCHITECTURE §5](ARCHITECTURE.md#5-the-run-machine-and-scoring).

## How to read the mistake tables

**Penalty** is the number of points taken off the 100-point technique score. A mistake id is scored once per run,
however often it is repeated, and undo does not remove it. The **Effect** column uses three labels:
- **Refused**: the action does not change the bench, but the mistake is still recorded. The student must correct the
  action.
- **Accepted**: the bench changes and the run continues with the error.
- **Recorded only**: the mistake is logged but has no numerical effect in the model.

Technique and assessment are weighted equally in the overall score.

---

## 1. Assay of citric acid by acid–base titration

**Lab**: Pharmaceutical Chemistry Laboratory
**Route**: `/virtual-labs/pharmaceutical-chemistry/acid-base-titration`
**Difficulty**: Intermediate, about 30 minutes

**Objectives**
- Choose apparatus and an indicator suited to a weak acid–strong base titration.
- Weigh, dilute and pipette quantitatively.
- Read a burette to 0.01 mL and judge a faint permanent end-point.
- Calculate an assay with the correct stoichiometry and units.

**Equipment**:
- burette, 50 mL Class A (0–50 mL, 0.1 mL divisions, ±0.05 mL);
- retort stand and burette clamp;
- bulb pipette, 20 mL Class A (±0.03 mL, to deliver), with filler;
- volumetric flask, 100 mL Class A (±0.08 mL, to contain);
- conical flask, 250 mL;
- analytical balance (readability 0.0001 g) with weighing boat;
- indicator bottles;
- sample bottle CA-01;
- NaOH 0.1 M standardised;
- white tile;
- wash bottle.

**Materials**:
- citric acid monohydrate, simulated sample CA-01 (C₆H₈O₇·H₂O, Mr 210.14);
- NaOH 0.1012 M;
- phenolphthalein solution (pH 8.2 colourless → 10.0 pink);
- purified water (CO₂-free preferred).

**Procedure (10 steps)**

1. **Inspect the bench**: inspect the burette, stand, pipette, volumetric flask, conical flask, indicator, sample and
   titrant.
2. **Set out the apparatus**: choose only the apparatus the assay needs.
3. **Choose sample and reagents**: select the sample, the titrant and an indicator suited to a weak acid–strong base
   titration.
4. **Weigh the sample**:
   - tare the empty boat;
   - weigh 0.95–1.05 g with the doors closed;
   - record the mass.
5. **Prepare the sample solution**:
   - transfer quantitatively;
   - dissolve;
   - make up to the 100 mL mark;
   - mix.
6. **Take the aliquot**:
   - rinse the pipette;
   - deliver 20.00 mL into the conical flask;
   - add about 25 mL water and two drops of indicator.
7. **Prepare the burette**:
   - rinse with titrant;
   - fill;
   - remove the funnel;
   - expel the air bubble;
   - record the initial reading.
8. **Titrate**: run in titrant with swirling until the first permanent faint pink, then record the final reading. Up
   to three titrations are allowed.
9. **Calculate**: enter the mean titre and the assay calculated from your own readings.
10. **Compare with the limit**: decide whether the result complies with the illustrative limit.

### Scientific model (`calculations/titration.ts`)

**Assumptions** (stated in the definition):
- concentrations stand in for activities;
- 25 °C, K_w = 1.0 × 10⁻¹⁴;
- citric acid pKa 3.13, 4.76, 6.40 (thermodynamic, I = 0);
- additive volumes.

**Reaction**: C₆H₈O₇ + 3 NaOH → Na₃C₆H₅O₇ + 3 H₂O. Three moles of NaOH react per mole of acid.

**pH (charge balance)**, solved by bisection on log[H⁺] between −14.5 and 0.5, 80 iterations:

  [H⁺] + [Na⁺] = [OH⁻] + [H₂A⁻] + 2[HA²⁻] + 3[A³⁻]

The species fractions use K₁ = 10^−3.13, K₂ = 10^−4.76, K₃ = 10^−6.40. Concentrations are in mol/L, from mmol ÷ total
mL.

**Indicator**: the base-form fraction is f = 1 / (1 + 10^(pK_in − pH)).

| Indicator | pK_in | Transition range | Role |
| --- | --- | --- | --- |
| Phenolphthalein | 9.4 | 8.2–10.0 | Correct |
| Methyl orange | 3.46 | 3.1–4.4 | Wrong (end-point far too early) |
| Bromothymol blue | 7.1 | 6.0–7.6 | Wrong (before the third equivalence) |

The code cites these as "commonly tabulated values (e.g. Vogel)". Vogel was **not** re-checked in the research pass.
The phenolphthalein range 8.2 → 10.0 **was** verified against the BP reagent monograph.

**End-point model**:

| End-point state | Phenolphthalein | Other indicators (judged against equivalence) |
| --- | --- | --- |
| Faint pink (correct) | f ≥ **0.20** (`FAINT_PINK_FRACTION`), i.e. pH ≈ 8.8 | Delivered volume within −0.1 / +0.25 mL of V_eq |
| Under-titrated | f < 0.20 | Delivered < V_eq − 0.1 mL |
| Overshot (deep pink) | f > **0.93** (`DEEP_PINK_FRACTION`) | Delivered > V_eq + 0.25 mL |

**Formulas** (volumes in mL, amounts in mmol, molarity in mmol/mL):

| Quantity | Formula |
| --- | --- |
| Titre | V = final − initial reading. Readings must be ordered and within 0–50 mL |
| Equivalence volume | V_eq = 3 × n_acid / c_NaOH |
| n(NaOH) | V_titre × c |
| n(acid) | n(NaOH) / 3 |
| Mass in aliquot (mg) | n(acid) × 210.14 |
| Mass in sample (mg) | mass in aliquot × V_flask / V_aliquot (= × 100/20) |
| **Assay, % w/w as C₆H₈O₇·H₂O** | **(V × c ÷ 3 × 210.14 × 100/20) ÷ (sample mass g × 1000) × 100** |
| Equivalence factor | 1 mL of c M NaOH ≡ c × 210.14 / 3 mg. That is 7.005 mg per mL of 0.1000 M, and 7.089 mg per mL of 0.1012 M |
| Concordance | Replicate titres must agree within 0.10 mL |

**Simulated sample**: the true purity is 98.9–100.8 % (seeded). The expected titre is about 28 mL.

**Technique effects** (teaching magnitudes in `EFFECT`):

| Error | Effect |
| --- | --- |
| Unrinsed burette | Titrant × 0.985 |
| Air bubble | The reading moves 0.18 mL more than is delivered (not reachable today; see the mistake table) |
| Unrinsed pipette | Aliquot × 0.992 |
| Blow-out | +0.03 mL delivered |
| Unrinsed boat | 0.6 % of the sample lost |
| Unmixed flask | Aliquot concentration × 0.97–1.03 |
| Doors open | The display drifts by up to ±0.4 mg |

**Accepted tolerances**:

| Entry | Tolerance |
| --- | --- |
| Mass transcription | Exact to 0.0001 g |
| Burette readings | ±0.02 mL of the true meniscus |
| Entered mean titre | ±0.011 mL |
| Entered assay | ±0.1 % of the value the student's own data give |

### Illustrative vs official values

| | This lab (illustrative) | Ph. Eur. 0456 Citric Acid Monohydrate / USP (harmonised) |
| --- | --- | --- |
| Sample | ~1 g (0.95–1.05 g), made up to 100.00 mL; 20.00 mL aliquot | **0.550 g** dissolved in 50 mL water, titrated directly |
| Titrant | NaOH **0.1012 M** (label value, teaching) | **1 M** NaOH |
| Indicator | Phenolphthalein, 2 drops | 0.5 mL phenolphthalein solution R |
| Factor | 7.089 mg C₆H₈O₇·H₂O per mL of 0.1012 M | **1 mL of 1 M NaOH ≡ 64.03 mg C₆H₈O₇** (anhydrous) |
| Result expressed as | % w/w C₆H₈O₇·H₂O | % C₆H₈O₇ on the **anhydrous** substance |
| Limit | **99.0–101.0 %, a teaching limit** | **99.5–100.5 %** (anhydrous substance) |

Notes:
- The Ph. Eur. text was read from an unofficial mirror of Ph. Eur. 7.0. The USP text came from a USP 38–NF 33
  mirror. Current editions were not checked.
- 64.03 × 3 = 192.09 ≈ Mr 192.1, which confirms the 1:3 stoichiometry. The monohydrate equivalent of the official
  factor, 70.05 mg per mL of 1 M, is computed, not printed.
- The pKa values 3.128 / 4.761 / 6.396 (Martell & Smith, via Harvey, *Analytical Chemistry 2.1*) round to
  3.13 / 4.76 / 6.40. PubChem gives only pKa 2.79, and the IUPAC dataset holds ionic-strength-dependent values, so
  the sources disagree; the lab uses the I = 0 set.
- The Class A tolerances (±0.08 mL flask, ±0.03 mL pipette, ±0.05 mL burette) are stated in the code with reference
  to ISO 1042. They were not independently re-verified in the research notes.

### Mistakes detected (`TITRATION.apply`)

| Id | Penalty | Trigger | Effect |
| --- | ---: | --- | --- |
| `apparatus-burette-25` | 3 | 25 mL burette chosen | Refused. The ~28.5 mL titre exceeds it, so a refill would add a second reading's error |
| `apparatus-cylinder-100` | 3 | Measuring cylinder for the aliquot | Refused. A cylinder is ±1 %; the aliquot needs a Class A pipette |
| `apparatus-beaker-250` | 3 | Beaker as the titration vessel | Refused. It cannot be swirled without splashing |
| `wrong-sample` | 4 | Sodium bicarbonate or boric acid chosen | Refused. Bicarbonate is a base; boric acid is too weak without mannitol or glycerol |
| `wrong-titrant` | 4 | HCl or AgNO₃ chosen | Refused. An acid needs a base; AgNO₃ is argentometric |
| `indicator-methyl-orange` | 10 | Methyl orange chosen | **Accepted.** The end-point comes after about a third of the titrant, so the assay is far too low |
| `indicator-bromothymol-blue` | 10 | Bromothymol blue chosen | **Accepted.** It changes before the third proton's equivalence, so the assay is low |
| `doors-open` | 4 | Mass recorded with the draught shield open | Accepted. The last digits drift by tenths of a milligram |
| `mass-transcription` | 3 | Recorded mass ≠ display | Refused. Transcription errors carry into the assay |
| `transfer-not-quantitative` | 6 | Dissolved without rinsing the boat and funnel | Accepted. About 0.6 % of the sample is lost, so the assay is low |
| `flask-overshoot` | 8 | Meniscus above 100.08 mL | Accepted. The sample is diluted; the honest fix is to discard and re-prepare |
| `flask-not-mixed` | 6 | Aliquot taken before stoppering and inverting | Accepted. The aliquot concentration varies ±3 %, so replicates disagree |
| `flask-under` | 6 | Aliquot taken with the flask below 99.92 mL | Accepted. The solution is concentrated, so the assay is high |
| `pipette-not-rinsed` | 4 | Pipette not rinsed with the sample solution | Accepted. The first aliquot is diluted about 1 % (×0.992), so the assay is low |
| `blow-out` | 3 | Last drop blown out | Accepted. About 0.03 mL extra is delivered |
| `burette-not-rinsed` | 8 | Burette filled without rinsing with titrant | Accepted. The NaOH is diluted about 1.5 %, so the assay is about 1.5 % high (a test asserts a +0.9 to +2.2 % difference) |
| `funnel-left` | 4 | Initial reading taken with the funnel in place | Recorded only (the model does not change the level) |
| `bubble` | 6 | Initial reading taken with an air bubble in the tip | Intended effect: the reading moves 0.18 mL more than is delivered, so the titre is high. **Not reachable in the current code** (see the note below this table) |
| `misread-initial` | 4 | Initial reading off by more than 0.02 mL | Refused |
| `no-tile` | 2 | Titrant added without the white tile | Recorded only. The faint pink is easier to miss |
| `overshoot` | 8 | Titration passes into deep pink (f > 0.93) | Accepted. Excess titrant makes the assay high |
| `not-swirled` | 3 | Final reading without swirling after the last addition | Recorded only. The room shows a local patch of colour until the flask is swirled |
| `stopped-early` | 8 | Final reading before the end-point (under) | Accepted. Unreacted acid makes the assay low |
| `misread-final` | 4 | Final reading off by more than 0.02 mL | Refused |
| `calc-titre` | 3 | Entered titre ≠ mean (final − initial) | Refused |
| `calc-assay` | 5 | Entered assay more than 0.1 % from the student's own data | Refused. The working is shown |
| `verdict` | 4 | Complies / fails does not match the result vs 99.0–101.0 % | Refused. "A failing result honestly reported is a correct result" |

**Why `bubble` cannot happen today.** This is what the code does as of 2026-10-20:
1. `fillBurette` puts the meniscus at −1.2 mL, above the zero mark, with the bubble present.
2. `recordInitial` refuses any reading while the level is below zero, and it does so *before* it checks for a bubble.
3. The only action that brings the meniscus onto the scale is `expelBubble`, and that action also clears the
   bubble.

So neither the mistake nor the 0.18 mL titre error can occur. The unit tests do not exercise this path. Making it
reachable is a design decision for the owner or a reviewer: for example, a separate "run a little out" action that
leaves the bubble in place.

**Assessment**: 8 questions (design, calculation, interpretation, viva).

---

## 2. Preparation and evaluation of Simple Syrup

**Lab**: Pharmaceutics Laboratory
**Route**: `/virtual-labs/pharmaceutics/simple-syrup`
**Difficulty**: Introductory, about 25 minutes

**Objectives**
- Scale a formula to a batch size.
- Weigh on a tared top-pan balance within tolerance.
- Dissolve sucrose without inverting or caramelising it, and make up to volume at room temperature.
- Evaluate appearance, volume and density, and complete a batch record.

**Equipment**:
- top-pan balance (0.01 g readability, 600 g capacity);
- weighing boat;
- sucrose jar;
- beaker, 150 mL borosilicate;
- measuring cylinder (1 mL divisions);
- glass stirring rod;
- purified water;
- hot plate with thermometer;
- dispensing bottle and label.

**Materials**: sucrose (C₁₂H₂₂O₁₁); purified water.

**Formula (`FORMULA`, illustrative, configurable)**:
- "Syrup (Simple Syrup)", using the USP proportions: sucrose 850 g, purified water to 1000 mL, i.e. **85 g / 100 mL**;
- batch of 50 or 100 mL;
- starting water about 45 % of the batch volume (accepted range 40–46 %);
- room temperature 25 °C.

**Procedure (10 steps)**

1. **Inspect the bench**: inspect the balance, boat, sucrose, beaker, cylinder, rod, water, hot plate and bottle.
2. **Calculate the formula**: choose a batch size and calculate the sucrose and starting water.
3. **Weigh the sucrose**: tare the boat, weigh within tolerance and record.
4. **Measure the water**: measure it in the cylinder, read it, and pour it into the beaker.
5. **Dissolve**:
   - put the beaker on the hot plate and warm gently;
   - add the sucrose while stirring;
   - stir until no crystals remain.
6. **Cool and transfer**:
   - switch off the heat;
   - cool to ≤ 30 °C;
   - transfer to the measuring cylinder and rinse the beaker in.
7. **Make up to volume**: add purified water to the batch volume, mix, and record the final volume.
8. **Pack and label**: choose the container and the storage statement.
9. **Evaluate**: record the appearance, weigh 50.0 mL and calculate the density.
10. **Batch record**: review and sign.

### Scientific model (`calculations/syrup.ts`, `experiments/syrup.ts`)

**Density of aqueous sucrose at 20 °C (g/mL)** comes from the decade values of **NBS Circular C457** (Snyder &
Hammond, 1946, public domain). Between the decade values it is interpolated with a Lagrange quadratic through the
three nearest points, clamped to 0–70 % w/w.

| % w/w | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ρ₂₀ (g/mL) | 0.99823 | 1.03814 | 1.08096 | 1.12698 | 1.17645 | 1.22957 | 1.28646 | 1.34717 |

The research pass visually confirmed the C457 rows at 64.7–66.7 °Brix (for example 64.7 % → 1.31452 g/mL). The
decade rows above came from the scan's OCR text and should be re-checked visually before being quoted elsewhere.

| Quantity | Formula / value |
| --- | --- |
| Sucrose for batch (g) | 85 × V_batch / 100 |
| Solution volume (mL) at T | (m_sucrose + m_water) / ρ₂₀(w) × (1 + 0.0005 × (T − 20)) |
| Thermal expansion | **0.05 % per °C** (`SYRUP_EXPANSION_PER_C`, a teaching value) |
| % w/w from % w/v | Solve w · ρ₂₀(w) = w/v (bisection, 60 iterations). 85 % w/v ≈ **64.7 % w/w**, ρ ≈ **1.31 g/mL** |
| Water in a finished batch (g) | V_batch × ρ₂₀(w) − sucrose (about 46 g per 100 mL) |
| Density from weighing | ρ = mass of 50.0 mL ÷ 50.0 mL |
| Deviation | (actual − target) / target × 100 % |

**Solubility of sucrose (g per g water)** is interpolated linearly. The code cites "standard values, e.g. CRC
Handbook"; the CRC Handbook was **not** accessed in the research pass.

| °C | 0 | 20 | 40 | 60 | 80 | 100 |
| --- | --- | --- | --- | --- | --- | --- |
| g/g water | 1.79 | 2.04 | 2.38 | 2.87 | 3.62 | 4.87 |

**Heating and dissolution** are simulated in 5 s steps when the student presses Wait (15, 30, 60, 120 or 300 s):
- **Temperature** approaches the set-point (0, 40, 60, 80, 100 or 120 °C) exponentially. τ = 90 s when heating and
  240 s when cooling in air.
- **Boiling point** is 100 + 4 × (dissolved sucrose ÷ water) °C, a rough elevation. At the boil, water evaporates at
  0.03 g/s.
- **Dissolution rate** is k = 0.004 × (1 + max(0, T − 25)/25) × (1 if stirring, else 0.15) × (0.6 if caked) s⁻¹.
  Sucrose dissolves toward the cap min(sucrose, solubility(T) × water).
- **Overheating** threshold is **90 °C** (`overheatC`). Time spent at or above it accumulates. The mistake triggers
  after 60 s, the appearance turns "pale yellow to brown" after 120 s, and the visual yellowing reaches full strength
  at 240 s.

**Make-up and evaluation**:
- Make up to volume at **≤ 30 °C** (`makeUpMaxC`).
- Volume tolerance ±0.5 mL (half a cylinder division).
- Weighing tolerance ±0.5 g per 100 mL of batch.
- Cylinder reading ±0.25 mL; final reading ±0.3 mL; density entry ±0.0011 g/mL.

**Report verdicts**:

| Check | Pass condition |
| --- | --- |
| Concentration | 83.3–86.7 % w/v (±2 % of 85) |
| Density | 1.30–1.333 g/mL |
| Final volume | Within 1 mL of the batch at 20 °C |
| Appearance | "Clear, colourless" |

The appearance is decided in this order:
1. **Yellow** if overheated for more than 120 s.
2. **Crystals** if more than 0.3 g is undissolved.
3. **Thin** if below 78 % w/v.
4. Otherwise **clear**.

### Illustrative vs official values

| | This lab | USP "Syrup" (NF) | BP "Syrup" |
| --- | --- | --- | --- |
| Composition | 85 g sucrose / 100 mL (USP proportions) | Sucrose **850 g**, Purified Water to **1000 mL** | Sucrose **667 g**, Purified Water to **1000 g** (66.7 % w/w) |
| Method | Gentle heat (about 60 °C) and stirring, cool, make up to volume | "may be prepared by the use of boiling water or, **preferably, without heat**" (percolation) | "Heat together until dissolved and add sufficient boiling Purified Water…" |
| Density limit | Teaching range **1.30–1.333 g/mL** | Specific gravity **not less than 1.30** | Weight per mL **1.315–1.333 g** |
| Storage | "Well-closed container in a cool place" | "Preserve in tight containers, preferably in a cool place" | "should not be exposed to undue fluctuations in temperature" |

Notes:
- The lab's density range takes its lower bound from USP and its upper bound from BP.
- "About 1.313" is a textbook figure, not the USP limit. It comes from Ansel, read via secondary lecture notes.
- The USP texts were read from unofficial mirrors of USP32–NF27 and USP35–NF30, and the BP text from BP 2013. Current
  editions were not checked.

### Mistakes detected (`SYRUP.apply`)

| Id | Penalty | Trigger | Effect |
| --- | ---: | --- | --- |
| `calc-sucrose` | 4 | Sucrose ≠ 85 × batch / 100 (±0.005 g) | Refused. A starting water outside 40–46 % is also refused, but without a mistake |
| `not-tared` | 8 | Sucrose added before taring | Accepted. The display includes the 3.12 g boat, so the batch gets 3.12 g too little sucrose, is weak, and is no longer self-preserving |
| `mass-transcription` | 3 | Recorded weight ≠ display | Refused |
| `weight-out-of-tolerance` | 8 | Weighed sucrose more than ±0.5 g per 100 mL from target | Accepted. Too little: not self-preserving. Too much: crystallises |
| `misread-cylinder` | 3 | Cylinder reading off by more than 0.25 mL | Refused |
| `water-onto-sugar` | 4 | Water poured onto sucrose already in the beaker | Accepted. The sugar cakes, so dissolution is slower (×0.6) |
| `sugar-first` | 3 | Sucrose put into an empty beaker | Accepted. The sugar cakes (×0.6) |
| `no-stir-on-add` | 3 | Sucrose tipped into water without stirring | Accepted. The sugar cakes (×0.6) |
| `overheated` | 10 | More than 60 s at ≥ 90 °C | Accepted. Inversion and caramelisation: the syrup yellows, its taste changes, and it ferments more readily |
| `incomplete-dissolution` | 10 | Finished with more than 0.3 g undissolved | Accepted. Crystals seed crystallisation; the liquid is below the formula strength |
| `beaker-marks` | 6 | Made up to volume on beaker graduations | Recorded only. Beaker marks are ±5 % or worse |
| `start-water-too-much` | 8 | Syrup volume already exceeds the batch before any water is added | Accepted. It can no longer reach the formula strength and is too dilute to self-preserve |
| `made-up-hot` | 8 | Water added for make-up, or final volume read, above 30 °C | Accepted. The syrup contracts about 0.05 %/°C on cooling, so the batch is short at room temperature |
| `qs-overshoot` | 6 | Made up past the mark | Accepted. Diluted below 85 % w/v |
| `not-mixed-after-qs` | 6 | Final volume recorded without mixing after make-up | Recorded only. Water floats on the dense syrup |
| `misread-final` | 3 | Final volume off by more than 0.3 mL | Refused |
| `container-beaker` | 5 | Packed in the beaker covered with paper | Refused. Not a closed container: moisture, dust, mould |
| `container-rinsed` | 5 | Packed in a wet, tap-rinsed bottle | Refused. Dilutes the surface; tap water is not purified water |
| `storage-fridge` | 3 | "Store at 2–8 °C" | Refused. Cold encourages crystallisation |
| `storage-none` | 3 | No storage statement | Refused |
| `appearance` | 3 | Recorded appearance ≠ what the batch shows | Refused. "Record what you see" |
| `calc-density` | 3 | Density ≠ mass ÷ 50.0 (±0.0011) | Refused |

**Assessment**: 7 questions.

---

## 3. Graded dose–response curve (simulated isolated tissue)

**Lab**: Pharmacology Laboratory
**Route**: `/virtual-labs/pharmacology/dose-response`
**Difficulty**: Intermediate, about 25 minutes

**Objectives**
- Identify the independent and dependent variables.
- Run trials with correct contact time, washout and recovery.
- Plot response against concentration and against log concentration.
- Estimate Emax and EC50, and explain potency and efficacy.

**Equipment**:
- organ bath (20 mL, water-jacketed);
- thermostatic circulator;
- aeration line;
- tissue strip (**simulated**);
- isotonic transducer on a stand;
- recorder (chart display);
- agonist stock solutions (10⁻⁶, 10⁻⁵, 10⁻⁴ and 10⁻³ M);
- micropipette (10–200 µL);
- physiological salt solution reservoir (Tyrode-type).

**Materials**:
- "Acetylcholine (simulated response)", a simulated cholinergic agonist;
- physiological salt solution (Tyrode-type).

**Procedure (8 steps)**

1. **Inspect the apparatus**: inspect all nine items.
2. **Define the experiment**: name the independent variable (agonist concentration) and the dependent variable
   (contraction height).
3. **Set up the bath**:
   - fill it;
   - switch on the circulator and aeration;
   - mount the tissue;
   - set 1 g tension;
   - zero the recorder.
4. **Equilibrate**: at least 20 min at 37 °C.
5. **Run the trials**:
   - test at least **6** distinct concentrations, from the foot of the curve (≤ 25 % of your largest response) up to
     the plateau (the top two within about 12 %);
   - for each: add, read the peak, record, wash.
6. **Plot the curve**: on a linear axis, then on a log axis.
7. **Estimate Emax and EC50** from the graph.
8. **Find the unknown concentration**:
   - wash, add test sample U, and record its response;
   - read its concentration off your own curve.

### Scientific model (`calculations/doseResponse.ts`, `MODEL`)

**Hill (sigmoid Emax) equation**: E = Emax · Cⁿ / (EC50ⁿ + Cⁿ), where C is the molar bath concentration. E = 0 at
C = 0.

**Inverse**: C = EC50 · (f / (1 − f))^(1/n), for a fraction f of Emax.

**Teaching parameters** (not measured data from any animal or tissue):

| Parameter | Value |
| --- | --- |
| Emax | **46 mm** full-scale contraction on the recorder |
| EC50 | **1 × 10⁻⁷ M** (pEC50 7.0) |
| Hill coefficient n | **1** |
| Trial-to-trial variation | **±3 %**: deterministic per seed and trial, factor 1 + (rand − 0.5) × 0.06 |
| Bath and conditions | 20 mL, 37 °C, contact time 30 s, equilibration 20 min |
| Bath concentrations offered | 10⁻⁹, 3×10⁻⁹, 10⁻⁸, 3×10⁻⁸, 10⁻⁷, 3×10⁻⁷, 10⁻⁶, 3×10⁻⁶, 10⁻⁵ M (half-log steps) |
| Stock volume | V(µL) = C_bath × 20 mL / C_stock × 1000, using the smallest stock that gives ≤ 200 µL |
| Unknown U | Hidden; 10^(−7.4 … −6.6) M, inside the steep, readable part of the curve. It is never shown before the report |

**Bath temperature** after a wait of t min: T = T_target + (T − T_target) · e^(−t/3). The target is 37 °C with the
circulator on, otherwise 25 °C.

**Response modifiers** (they multiply the Hill response):

| Condition | Factor |
| --- | --- |
| Equilibrated less than 20 min | × 0.75 |
| Bath below 36 °C | × max(0.3, 0.4 + 0.6 (T − 25)/12) |
| No aeration | × 0.9^(trial number) |
| Not washed | Effective C = new C + residual C, then × 0.85 |

**Analysis**:
- **Fit.** A least-squares Hill fit of the student's own mean responses:
  - a grid search over log EC50 (step 0.01, spanning the data ±1 log unit) and n (0.5–2.5, step 0.05);
  - Emax solved exactly for each pair;
  - R² reported.
- **Reading tolerances**:

  | Entry | Tolerance |
  | --- | --- |
  | Response reading | ±1 mm of the true peak |
  | Emax | ±max(2 mm, 8 % of the largest response) |
  | log EC50 | ±0.3 of the student's own fit |
  | Unknown log C | ±0.2 of what the student's curve gives |

- **Readable range for the unknown.** Its response must fall at 10–90 % of the fitted Emax.
- **Percent of maximum** = response ÷ the largest recorded response × 100.

### Illustrative vs literature values
- No citable EC50 for acetylcholine on guinea-pig ileum was found (55 Europe PMC abstracts searched). One candidate
  paper could not be downloaded intact. **The EC50, Emax and Hill coefficient are teaching parameters**, and the page
  says so.
- UoK names no tissue; the definition models a generic "ileum-type" smooth-muscle strip.
- The concentrations are organ-bath concentrations, not doses for any person or animal.

### Mistakes detected (`DOSE_RESPONSE.apply`)

| Id | Penalty | Trigger | Effect |
| --- | ---: | --- | --- |
| `variables` | 4 | Wrong independent or dependent variable | Refused. Concentration is changed; contraction height is measured; temperature, tension, volume and contact time are controlled |
| `not-equilibrated` | 8 | First dose before 20 min of equilibration | Accepted. Every dose given before 20 min of equilibration is scaled × 0.75, so the foot of the curve is distorted |
| `cold-bath` | 8 | Dose given below 36 °C | Accepted. Weak, slow contractions (factor down to 0.3) |
| `no-aeration` | 8 | Dose given without aeration | Accepted. Hypoxia: responses fall 10 % per trial, flattening the curve |
| `no-wash` | 8 | Dose added without washing out the previous one | Accepted. Residual agonist adds to the dose, plus desensitisation (× 0.85) |
| `misread-response` | 3 | Recorded peak off by more than 1 mm | Refused |
| `emax` | 4 | Emax entry off the plateau | Refused |
| `ec50` | 5 | log EC50 more than 0.3 from where the student's curve crosses 50 % | Refused |
| `unknown` | 5 | Unknown's log C more than 0.2 from the student's curve reading | Refused |

Out-of-order actions are refused without a mistake:
- dosing before set-up;
- adding a dose before recording the last one;
- washing before reading the peak;
- plotting with fewer than 3 concentrations;
- adding the unknown before analysing the standard curve.

**Assessment**: 7 questions.

---

## 4. Microscopical identification of powdered clove

**Lab**: Pharmacognosy Laboratory
**Route**: `/virtual-labs/pharmacognosy/powdered-clove`
**Difficulty**: Introductory, about 25 minutes
**Drug**: *Syzygium aromaticum* (L.) Merr. & L.M.Perry, the dried flower buds

**Objectives**
- Prepare a cleared powder mount without air bubbles.
- Use coarse and fine focus correctly at low and high power.
- Recognise the diagnostic elements of clove powder.
- Distinguish genuine clove from clove-stalk and mother-clove adulteration.

**Equipment**:
- compound microscope (10× eyepiece, FN 18 mm; objectives 4×, 10×, 40×);
- slides (76 × 26 mm);
- coverslips (22 × 22 mm);
- reagent bottles (chloral hydrate, water, N/50 iodine);
- crude-drug sample jars;
- spirit lamp;
- mounted needle and spatula;
- blotting paper.

**Materials**:
- clove, powdered (jar PG-07);
- chloral hydrate solution;
- iodine solution N/50.

**Procedure (8 steps)**

1. **Inspect the bench**.
2. **Select the sample**: jar PG-07. The distractors are clove stalks PG-08, cinnamon PG-03 and fennel PG-11.
3. **Prepare the slide**:
   - clean the slide;
   - add a needle-tip of powder;
   - add chloral hydrate;
   - warm gently;
   - lower the coverslip at 45°;
   - blot.
4. **Set up the microscope**: place the slide, switch on the light, focus at low power.
5. **Observe**:
   - scan fields at 10× and 40×, using only the fine focus at 40×;
   - recognise at least **4 of the 5** main elements;
   - an iodine starch test is available as a separate mount.
6. **Record the features**: mark each of the 10 reference features present or absent.
7. **Compare with the reference**.
8. **Identify**: name the drug with at least 3 supporting observations, at least 2 of them diagnostic.

### Optics model (`calculations/microscopy.ts`)

- Field of view (mm) = eyepiece field number (**18 mm**) ÷ objective magnification.
- Total magnification = objective × 10.

| Objective | NA | Total | Field of view | Depth of field (teaching) | Smallest recognisable element (teaching) |
| --- | --- | --- | --- | --- | --- |
| 4× | 0.10 | 40× | 4.50 mm | 45 µm | 60 µm |
| 10× | 0.25 | 100× | 1.80 mm | 12 µm | 20 µm |
| 40× | 0.65 | 400× | 0.45 mm | 3 µm | 5 µm |

**When an element counts as recognised.** It must be:
- inside the circular field;
- within the depth of field of the current focus;
- at least the minimum size for the objective;
- for cluster crystals and epidermis only, in a **cleared** mount (chloral hydrate plus warming).

**Focus and stage**:
- Focus starts 600 µm off. Coarse focus moves 50 µm per step; fine focus moves 1 µm.
- Blur on screen = min(14 px, |focus error| / DOF × 1.6).
- A stage move is 0.6 × the field width, within ±2600 µm (x) and ±2000 µm (y).

**The slide** is a deterministic scatter generated from the run seed. It covers 4800 × 3600 µm. Counts are relative
abundance for drawing, not measurements:

| Element | Count | Size (µm) |
| --- | ---: | --- |
| Oil glands | 34 | 80–180 |
| Pollen | 160 | 15–20 |
| Cluster crystals (need clearing) | 130 | 8–15 |
| Spiral vessels | 14 | 24–40 |
| Epidermis (needs clearing) | 12 | 25–35 |
| Fibres | 5 | 150–380 |
| Sclereids | 2 | 40–70 |

**Mount quality**:
- A heaped mount triples the counts, but only one element in three stays recognisable.
- A dropped coverslip hides one element in four under bubbles.

**Reference features** (`REFERENCE_FEATURES`; the student marks each present or absent):

| Feature | Genuine clove | Diagnostic |
| --- | --- | --- |
| Parenchyma with large oval schizogenous oil glands | present | yes |
| Pollen, triangular (tetrahedral), about 15–20 µm | present | yes |
| Cluster crystals of calcium oxalate, about 10–15 µm | present | yes |
| Small spirally thickened vessels | present | no |
| Epidermis with thick cuticle and anomocytic stomata | present | no |
| A few thick-walled lignified fibres | present | no |
| Numerous sclereids (stone cells) | absent (they indicate clove **stalks**) | yes |
| Prism crystals of calcium oxalate | absent (they indicate **stalks**) | yes |
| Starch grains | absent (they indicate **mother cloves**) | yes |
| Covering trichomes | absent | no |

**Sources shown on screen**:
- Jackson & Snowdon, *Atlas of Microscopy of Medicinal Plants, Culinary Herbs and Spices*;
- the Ayurvedic Pharmacopoeia of India, Vol. I, "Lavanga" (pollen 15–20 µm, rosette crystals 10–15 µm, stone cells
  and prisms in stalks);
- the British Pharmaceutical Codex 1911 (stalks: sclerenchymatous cells; mother cloves: starch).

**Caveats from the research pass** for a faculty reviewer:
1. **"Starch absent" is not stated explicitly** by any source read. It is implied by BPC 1911, which names starch as
   the marker of mother cloves.
2. "Prism crystals = stalk" is supported by the API. Jackson & Snowdon support stalk sclereids only.
3. The API says "schizolysigenous" oil cavities. The lab's label says "schizogenous".
4. **No source gave µm sizes for oil glands, sclereids, fibres, vessels or epidermal cells.** The drawing ranges for
   those are illustrative. The pollen (15–20 µm) and cluster-crystal sizes follow the API. The API gives 10–15 µm in
   powder and 6–20 µm in section; the slide draws 8–15 µm.
5. The Ph. Eur. clove monograph's own microscopy (Identification B) was **not** obtained.
6. Copies of Jackson & Snowdon and the API were read from third-party hosted PDFs.

### Mistakes detected (`CLOVE.apply`)

| Id | Penalty | Trigger | Effect |
| --- | ---: | --- | --- |
| `sample-stalk` / `sample-cinnamon` / `sample-fennel` | 4 | Wrong jar | Refused |
| `dirty-slide` | 2 | Powder put on an unwiped slide | Recorded only. Grease and dust show up as artefacts |
| `too-much-powder` | 6 | A heaped spatula | Accepted. A crowded mount: only one element in three is recognisable |
| `mountant-water` / `mountant-iodine` | 6 | Water or iodine used as the mountant | Accepted. The mount is not cleared, so crystals and epidermis are never recognisable. The Observe step (4 of 5 main elements) cannot then be completed, so the student must undo (the mistake stays) or reset |
| `boiled` | 4 | Mount boiled over the flame | Accepted (the mount still counts as cleared). Risks bubbles and a cracked slide |
| `bubbles` | 4 | Coverslip dropped flat | Accepted. Air bubbles hide one element in four |
| `not-blotted` | 2 | Slide placed without blotting | Recorded only. Mountant on the stage and objective |
| `high-first` | 4 | Turned to 40× before focusing at low power | Accepted. Risk of driving the lens into the slide |
| `coarse-high` | 6 | Coarse focus used at 40× | Accepted. Risk of crushing the coverslip |
| `unseen-<feature>` | 3 | Feature marked present but never observed | Accepted. "Record only what you have seen" |
| `checklist-<feature>` | 4 | Feature marked opposite to the reference | Accepted. The reference description is shown |
| `identity` | 10 | Identified as clove stalks, cinnamon or fennel | Refused |
| `weak-evidence` | 3 | Fewer than 2 diagnostic features among the evidence | Accepted. Vessels, fibres and epidermis are not specific |

Out-of-order actions are refused without a mistake:
- the checklist before 4 of 5 main elements have been seen and 40× has been used with the fine focus;
- comparing before the checklist;
- identifying before comparing, or with fewer than 3 observations.

**Assessment**: 7 questions.

---

## 5. Summary

| Lab | Steps | Questions | Distinct mistake ids | Seeded randomness |
| --- | ---: | ---: | ---: | --- |
| Acid–base titration | 10 | 8 | 27 | Purity, balance draught drift, scoop sizes, bubble-free start level, unmixed-flask factor |
| Simple Syrup | 10 | 7 | 22 | Scoop sizes, density-weighing noise (±0.02 g) |
| Dose–response | 8 | 7 | 9 | ±3 % response variation, the unknown's concentration |
| Powdered clove | 8 | 7 | 9 fixed ids, plus the `sample-*`, `mountant-*`, `unseen-*` and `checklist-*` families | Slide layout |

## 6. Labelling and known presentation gaps

**What the screen says**

| Where | Label |
| --- | --- |
| Every briefing | "Simulated practice: results come from teaching models and illustrative data described on this page." |
| Every results page | "simulated practice, not an assessed university practical" |
| Titration bench | "Illustrative limit for this exercise: 99.0–101.0 % (a teaching value, not the monograph limit)" |
| Syrup bench | "Illustrative formula — configurable teaching values"; the label text "For practice — not for use" |
| Dose–response bench | "Simulated observations from a documented teaching model — not animal or patient data. Concentrations are organ-bath concentrations, not doses." In the room, the agonist stock is labelled "SIMULATED", the tissue is "Tissue strip (simulated)", and a 3Rs poster says real tissue work needs ethical approval |
| Clove eyepiece | "Schematic illustration drawn to scale from the reference description — not a photomicrograph." |
| Clove reference photo | "Not yet confirmed by our reviewer", with CC BY-SA credit |
| Landing page and briefings | Curriculum status badge plus the one-sentence summary ("Not faculty-reviewed") |

**Gaps found while documenting** (not fixed here; this pass changed no code):
1. `Briefing.tsx` prints only `principle.slice(0, 3)`. The later paragraphs are in the definitions but are **not
   shown anywhere**:
   - the titration's Ph. Eur. / USP comparison and model assumptions;
   - the syrup's USP-vs-BP note and illustrative-formula paragraph;
   - the dose–response paragraph stating the teaching parameters (Emax 46 mm, EC50 10⁻⁷ M, n 1);
   - the clove "SCHEMATIC ILLUSTRATION" paragraph.

   The bench labels above cover the "simulated" wording. The official-method comparison and the exact teaching
   parameters are not on screen. Code comments mention a "Theory panel", but no such component exists.
2. The landing page's credits omit the CC BY-SA clove photo, because its manifest status is `needs_review`. Its
   caption carries the attribution ([ASSET_LICENSES §3](ASSET_LICENSES.md#3-where-attribution-is-displayed)).
