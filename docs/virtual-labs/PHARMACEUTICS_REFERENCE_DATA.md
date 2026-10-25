# Pharmaceutics lab: reference data for the three shortlisted experiments

Compiled 2026-10-25 by the scientific/curriculum checker, for `solution-preparation`, `liquid-properties` and
`solubility-dissolution`. Every value has its source and conditions next to it. A value the checker could not confirm
from a primary or authoritative compilation is marked **UNVERIFIED**, or **CONFLICT** where sources disagree. The pure
code is `src/lib/virtual-labs/calculations/pharmaceutics.ts` (formulas, water tables).
`liquidProperties.ts` and `solubilityDissolution.ts` hold the per-experiment data. Tests:
`scripts/pharmaceutics-lab.test.mts`.

Downloads were read as data. They were not executed, and none is committed.

## 1. Water: the reference liquid for every relative method

| t (°C) | Density (g/mL) | Viscosity (mPa·s) | Surface tension (mN/m) |
| --- | --- | --- | --- |
| 15 | 0.999103 | 1.13757 | 73.49 |
| 20 | 0.998207 | 1.00160 | 72.74 |
| 25 | 0.997048 | 0.890022 | 71.97 |
| 30 | 0.995649 | 0.797222 | 71.19 |

- **Density and viscosity at 0.101325 MPa** come from the NIST Chemistry WebBook fluid properties (IAPWS-95 density,
  IAPWS 2008 viscosity): https://webbook.nist.gov/chemistry/fluid/ (water, isobaric, 15–30 °C, queried 2026-10-25).
  - Viscosity was also re-derived independently from the IAPWS 2008 equations (Huber et al., *J. Phys. Chem. Ref.
    Data* 38, 101 (2009)). The release's check value, 889.735100 µPa·s at 298.15 K and 998 kg/m³, was reproduced
    exactly.
- **Surface tension** comes from IAPWS R1-76(2014): σ = 235.8 τ^1.256 (1 − 0.625 τ) mN/m, with τ = 1 − T/647.096 K. The
  re-derived values are 73.486, 72.736, 71.972 and 71.194 mN/m. Source: http://www.iapws.org/relguide/Surf-H2O-2014.html.
- **Corrections made in code on 2026-10-25.** Both were last-digit roundings:
  - `WATER_VISCOSITY[15]` 1.1375 → **1.1376** (1.13757);
  - `WATER_SURFACE_TENSION[30]` 71.18 → **71.19** (71.194).
- Standard gravity g = 9.80665 m/s² (CGPM 1901).

## 2. Ethanol (absolute)

| Property | 20 °C | 25 °C | Source | Status |
| --- | --- | --- | --- | --- |
| Density (g/mL) | 0.7893 (CRC); 0.78945 (Lange) | 0.78522 (Lange) | CRC Handbook 95th ed. p. 3-2, via PubChem CID 702 (https://pubchem.ncbi.nlm.nih.gov/compound/702#section=Density); Lange's Handbook 10th ed., via https://www.chemeurope.com/en/encyclopedia/Ethanol_(data_page).html | Verified (two compilations agree at 20 °C to 0.0002) |
| Viscosity (mPa·s) | ≈ 1.18 (Andrade interpolation of CRC 25/50 °C); 1.144 (CHERIC) | **1.074** (CRC); 1.040 (CHERIC) | CRC 95th ed. p. 6-2 via PubChem CID 702 (https://pubchem.ncbi.nlm.nih.gov/compound/702#section=Viscosity); CHERIC via the chemeurope page | **CONFLICT, ~3 %**. Use CRC 1.074 at 25 °C. PubChem also carries an unreferenced "1.074 mPa·s at 20 °C", which is inconsistent with every other source. Do not use it |
| Surface tension (mN/m) | 22.39 | 21.97 | 20 °C: Lange via chemeurope. 25 °C: CRC 95th ed. p. 6-1 via PubChem CID 702. Both agree with Jasper, *J. Phys. Chem. Ref. Data* 1, 841 (1972): γ = 24.05 − 0.0832 t | Verified at 25 °C (CRC). 20 °C from one compilation |

Expected teaching readings (computed here with the module's own formulas, not measured):
- **Ostwald flow-time ratio** t_ethanol / t_water: **1.50 at 20 °C** and 1.53 at 25 °C, using CRC/Andrade values.
- **Capillary rise** for r = 0.25 mm, θ = 0: water **59.4 mm** at 20 °C; ethanol **23.1 mm** at 20 °C.

**Ethanol 95–96 % (v/v): UNVERIFIED.** No density, viscosity or surface-tension value for 95–96 % ethanol was confirmed
from an authoritative source in this pass. Pharmacopoeial relative-density limits for "Ethanol (96 per cent)" exist, but
the monograph text was not retrieved. Use absolute ethanol data, or obtain the BP/Ph. Eur. monograph before quoting a
96 % value.

## 3. Glycerol–water, 50 % w/w

| Property | 20 °C | 25 °C | Source | Status |
| --- | --- | --- | --- | --- |
| Density (g/mL) | 1.1261 | 1.1236 | Volk & Kähler, *Exp. Fluids* 59, 75 (2018), https://doi.org/10.1007/s00348-018-2527-y | Verified by computation. Coefficients from the implementation at http://www.met.reading.ac.uk/~sws04cdw/viscosity_calc.html (credited there to A. Volk). Pure glycerol from the same fit: 1.2608 g/mL at 20 °C |
| Viscosity (mPa·s) | **6.00** | **5.00** | Cheng, *Ind. Eng. Chem. Res.* 47, 3285 (2008), https://doi.org/10.1021/ie071349z, fitted to Segur & Oberstar (1951) | Verified by computation, same implementation. Flow-time ratio to water ≈ 5.3 at 20 °C |
| Surface tension (mN/m) | ≈ 70 (teaching estimate) | — | International Critical Tables via Lange's, as used in `liquidProperties.ts` (70.0 mN/m at 18 °C) | **CONFLICT / UNVERIFIED.** A Springer table (https://aia.springeropen.com/articles/10.1186/s42774-021-00091-w/tables/3, not opened) is reported to give ~61 mN/m for "50 %" at 20 °C. A mole-fraction fit (arXiv 2307.14189, not readable here) implies ~71 mN/m. Keep the value labelled a teaching estimate |

## 4. Paracetamol (acetaminophen)

### 4.1 Aqueous solubility

| t (°C) | Value | Source | Status |
| --- | --- | --- | --- |
| 20 | 12.78 g / kg water (s.d. 0.05, n = 5) | Granberg & Rasmuson, *J. Chem. Eng. Data* 44, 1391 (1999), Table 2, https://doi.org/10.1021/je990124v (read from a copy at fenix.ciencias.ulisboa.pt) | Verified. Their method was gravimetric: excess solid, ≥ 72 h agitation, solvent evaporated, residue weighed |
| 20 | 1.4 g/100 mL | International Chemical Safety Card, via PubChem CID 1983 (https://pubchem.ncbi.nlm.nih.gov/compound/1983#section=Solubility) | Consistent |
| 25 | 14.90 g / kg water (s.d. 0.03, n = 4) | Granberg & Rasmuson, Table 2 | Verified |
| 25 | 14 mg/mL (14,000 mg/L) | Yalkowsky, *Handbook of Aqueous Solubility Data*, 2nd ed. (2010), via PubChem CID 1983 | Verified (compilation) |
| 30 | 17.39 g / kg water (s.d. 0.02, n = 7) | Granberg & Rasmuson, Table 1 | Verified |
| 37 | — | — | **UNVERIFIED.** No primary value found. Grant et al., *Int. J. Pharm.* 18, 25 (1984), measured 5–70 °C and is the source to obtain. Do not extrapolate the 0–30 °C data on screen without saying so |

As USP parts of water per g: 78 at 20 °C, 67 at 25 °C, 58 at 30 °C. All three fall in the **"Sparingly soluble"** band
(30–100 parts).
- The pharmacopoeial description of paracetamol was **not re-read** in this pass.
- The Merck Index (via PubChem) says "very slightly soluble in cold water", which does **not** match the quantitative
  data. If the lab prints a descriptive term, derive it from the data, as `solubilityTerm()` does.

**USP General Notices 5.30 terms.** Read from USP 35 at
https://www.drugfuture.com/Pharmacopoeia/USP35/data/v35300/usp35nf30s0_desc-sol-2-5.html (a mirror; check against the
current USP–NF). The column heading is "Parts of Solvent Required for 1 Part of Solute":

| Term | Parts of solvent |
| --- | --- |
| Very soluble | Less than 1 |
| Freely soluble | From 1 to 10 |
| Soluble | From 10 to 30 |
| Sparingly soluble | From 30 to 100 |
| Slightly soluble | From 100 to 1000 |
| Very slightly soluble | From 1000 to 10,000 |
| Practically insoluble, or Insoluble | 10,000 and over |

`solubilityTerm()` gives a shared end point to the less-soluble term. That is the only reading consistent with
"Less than 1" and "10,000 and over". The page states no temperature. Note that `partsSolvent()` treats "mL of
solution" as "mL of solvent", a teaching approximation of under 2 % for paracetamol.

### 4.2 USP Acetaminophen Tablets: dissolution conditions

Source: USP 35 monograph, read at https://www.drugfuture.com/Pharmacopoeia/USP35/data/v35300/usp35nf30s0_m200.html
(a mirror; confirm against the current USP–NF before quoting as current).

| Item | Verbatim / value |
| --- | --- |
| Apparatus | "Apparatus 2: 50 rpm" (paddle) |
| Medium | "pH 5.8 phosphate buffer … 900 mL" |
| Time | "30 minutes" |
| Detection | "UV absorption at the wavelength of maximum absorbance at about 243 nm", read against USP Acetaminophen RS in the same medium |
| Tolerance | "Not less than 80% (Q) of the labeled amount … is dissolved in 30 minutes" |
| Chewable tablets | 75 rpm, 45 minutes, Q = 75 % |
| Temperature | 37 ± 0.5 °C is the USP ⟨711⟩ general condition. The ⟨711⟩ text was **not re-read** in this pass |

Stage S1 acceptance in ⟨711⟩ (each of 6 units ≥ Q + 5 %) is used by `meetsS1Unit()` in `solubilityDissolution.ts`.
⟨711⟩ was **not re-read** in this pass; the rule is as commonly published.

### 4.3 UV absorbance

- **BP 2012, *Paracetamol Tablets*:**
  - Assay: "taking 715 as the value of A(1%, 1 cm) at the maximum at 257 nm". The final solution is in dilute sodium
    hydroxide: 10 mL of 0.1 M NaOH per 100 mL.
  - Dissolution: Apparatus 2, 900 mL phosphate buffer pH 5.8, 50 rpm. Samples are diluted with 0.1 M NaOH to about
    0.00075 % w/v and read at 257 nm.
  - Source: https://www.drugfuture.com/Pharmacopoeia/BP2012/data/5548.html.
  - Worked: A(1 %, 1 cm) 715 × 0.00075 % → **A ≈ 0.54**.
- **USP at 243 nm in pH 5.8 buffer** uses an external standard, so no specific absorbance is printed.
- **Do not mix the two wavelengths.** 257 nm is for alkaline solution (the phenolate). About 243 nm is for neutral or
  acidic medium.
- **UNVERIFIED:** a specific absorbance at 243 nm in pH 5.8 buffer. If the lab shows A for a given concentration in
  buffer, it must come from the experiment's own calibration line, labelled as simulated.

### 4.4 Sampling correction (formulas checked)

With V0 the medium volume, v the withdrawn volume and C_i the concentration at sample i:
- Withdrawn and replaced with fresh medium: Q_n = C_n·V0 + v·Σ_{i<n} C_i.
- Not replaced: Q_n = C_n·(V0 − (n−1)v) + v·Σ_{i<n} C_i.

Both are implemented correctly in `cumulativeDissolved()`. The worked hand checks are in the test file.

## 5. Apparatus figures

| Item | Value | Source | Status |
| --- | --- | --- | --- |
| BS/U-tube (modified Ostwald) viscometer, size A | Constant ≈ 0.003 mm²/s²; range 0.9–3 mm²/s; "flow times of 300–1000 seconds"; minimum sample 7 mL | Cannon Instrument, size A listing, https://cannoninstrument.com/bs-u-tube-sz-a-viscometer-cal9724-e50.html | Verified. Water at 20 °C (ν = 1.0034 mm²/s) gives ≈ 334 s in a size A |
| Minimum flow time | 200 s for most sizes (300 s for size A) | ISO 3105 (annex scan, https://webpages.ciencias.ulisboa.pt/~fjsantos/visc/calibracao/AnexoA_ISO3105-1976.pdf); Cannon listing | Verified (OCR of the scan is poor; values agree with Cannon) |
| Typical teaching Ostwald water flow time | "60–100 s" was reported for a plain Ostwald tube in a vendor listing (Thomas Scientific) | Page refused access (403) | **UNVERIFIED.** If the lab uses ~100 s, say that the kinetic-energy correction is neglected (it is, in `ostwaldViscosity()`'s comment) |
| Capillary radius for capillary rise | 0.1–0.3 mm bore radius is usual. A 0.2 mm tube gives a 7.35 cm water rise in one handout (uomus.edu.iq), consistent with r = 0.2 mm. The lab uses r = 0.25 mm → 59.4 mm for water at 20 °C | schoolphysics capillary-rise handout; University of Mosul handout (both found by search, the second contains a radius/diameter slip) | **Partly verified.** These are teaching handouts, not standards. 0.25 mm is a reasonable teaching value |
| Capillary length, water 20 °C | √(γ/ρg) = 2.73 mm | Computed | — |

## 6. Waste and ventilation guidance, mapped to `common.ts` streams

Sources:
- **NIH Drain Discharge Guide**, Version 1, September 2020, links updated December 2025:
  https://nems.nih.gov/Documents/NIH_Drain_Discharge_Guide.pdf. Quoted:
  - "Only chemical approved for drain disposal by the NIH Division of Environmental Protection (NIH/DEP) may be disposed
    of down the drain."
  - "Chemicals that are not listed below must be managed as chemical waste".
  - "Dilution to achieve compliance is prohibited per EPA CFR Dilution Prohibition."
  - "Any pharmaceutical waste must be handled as chemical waste."
  - The procedure runs cold water about 1 minute before the pour and about 2 minutes after it.
  - The Appendix B approved list includes "Sodium Chloride (NaCl)", "Sucrose (and Isomers)", "Sodium Phosphate
    Buffer", "Potassium Phosphate (mono)" and "(dibasic)", and "*Ethanol (10% with a Flash Point >140F)".
  - Glycerol and paracetamol are **not** on the list.
- **40 CFR 261.21(a)(1)**, ignitability, via https://www.law.cornell.edu/cfr/text/40/261.21. A liquid with a flash point
  below 60 °C (140 °F) is ignitable, "other than a solution containing less than 24 percent alcohol by volume and at
  least 50 percent water by weight".
- **West Chester University (PA) EHS, *Ethanol Purchase and Use Procedures*** (Aug 2022):
  https://wcupa.edu/_information/AFA/Facilities/environmental-health-safety/documents/lab_research_safety/updated-programs-aug-2022/Ethanol%20Purchase%20and%20Use%20Procedures-2.pdf.
  Quoted:
  - "ETHANOL CANNOT BE DISPOSED OF DOWN THE DRAIN AT ANY CONCENTRATION. It must be collected and disposed of as
    hazardous waste."
  - "Intentional dilution or evaporation of ethanol or any other waste as a substitute for proper disposal is illegal."
  - "Work with ethanol in a chemical fume hood, especially volumes greater than 500 milliliters. Good ventilation
    removes ethanol vapors, making it less likely that a flammable concentration may build up."
- **NIOSH Pocket Guide, ethyl alcohol**: https://www.cdc.gov/niosh/npg/npgd0262.html. REL and OSHA PEL are TWA 1000 ppm
  (1900 mg/m³). IDLH 3300 ppm [10 % LEL]. Flash point 55 °F. LEL 3.3 %.

| Waste in these experiments | Stream per guidance | Basis |
| --- | --- | --- |
| NaCl solutions (no drug) | `sink`, with running water before and after | NIH Appendix B lists NaCl |
| Phosphate buffer pH 5.8, **drug-free** | `sink` | NIH lists sodium/potassium phosphates and sodium phosphate buffer |
| Sucrose/syrup (Simple Syrup lab) | `sink` | NIH lists sucrose |
| Purified-water rinses | `sink` | — |
| Ethanol and ethanol–water (any strength used here) | `organic`, hazardous, never sink | WCU: no drain disposal at any concentration. Federal law (261.21) and NIH (≤ 10 %) are less strict; the strictest rule is the right teaching default |
| 50 % w/w glycerol–water | Collected chemical waste (`aqueous` preferred; `organic` acceptable). Not sink | Not on NIH's approved list, so "managed as chemical waste". **Not** ignitable or toxic |
| Paracetamol solutions, saturated filtrates, dissolution media containing drug, dissolution samples | `aqueous`, never sink | NIH: "Any pharmaceutical waste must be handled as chemical waste." |
| Paracetamol solid: excess undissolved drug, gravimetric residue, drug-bearing filter papers and weighing boats | **Collected chemical (pharmaceutical) solid waste.** There is no such stream in `common.ts` today | NIH: "Surplus solid chemicals must be disposed of through the NIH chemical waste services"; pharmaceutical waste is chemical waste |
| Clean weighing boats, tissues, gloves (no drug) | `solid` (non-hazardous) | — |
| Capillary tubes, Pasteur pipettes, broken glass | `glass` (sharps) | — |

**Fume hood for small-volume ethanol.** No source found requires a fume hood for small-volume ethanol work. Here,
small volume means tens of mL in a pycnometer, a viscometer or a capillary dish.
- WCU recommends a hood "especially" above 500 mL, and good ventilation otherwise.
- The OSHA/NIOSH limit is 1000 ppm, and the flash point is 13 °C.
- **Recommendation:**
  - small volumes may be handled on the open bench in a well-ventilated lab, away from flames and hot plates, with
    bottles capped;
  - heating or evaporating ethanol, or dispensing large volumes, belongs in a hood;
  - evaporation is never a disposal route.
- This is a recommendation drawn from the cited guidance, not a quoted rule. **Local (Pakistani) institutional rules were
  not checked.** The Pakistan Environmental Protection Act 1997 and provincial rules govern real disposal.

## 7. Review of `experiments/pharmaceutics/common.ts` waste rules (recommendations; the file was not edited)

The five streams (sink · aqueous chemical · non-halogenated organic · non-hazardous solid · broken glass and sharps)
match the segregation in the sources above. The rule that hazardous waste is never accepted at the sink is consistent
with all of them. Points to address:

1. **The sink does not check the tap.** `apply("dispose")` accepts a sink-safe waste with the tap off. The stream's own
   name is "Sink (with running water)", and the NIH procedure runs water before and after. Recommendation: refuse
   `dispose` to `sink` while `b.tap` is false.
2. **No stream exists for drug-contaminated solids.** The `solid` stream's detail lists "filter papers" and "weighing
   boats" as non-hazardous. In `solubility-dissolution`, filter papers, weighing boats and the gravimetric residue carry
   paracetamol, which is pharmaceutical chemical waste (NIH). Recommendation:
   - add a "Chemical / pharmaceutical solid waste" stream; or
   - rename `solid` to cover only uncontaminated items and route drug-bearing solids elsewhere.
   Either way, `why` should say why.
3. **Glycerol is listed under "organic".** That is defensible, because it is collected and not sunk, but 50 % w/w
   glycerol–water is an aqueous, non-ignitable, non-toxic mixture. Recommendations:
   - move glycerol mixtures to `aqueous`, or keep `organic` and drop "glycerol" from the organic stream's example text;
   - set `hazardous: false` for glycerol, so that a sink attempt costs the ordinary wrong-stream mistake, not the
     "must never reach a drain" one. It must still not be sunk.
4. **Drug-containing liquids should be `hazardous: true` for the sink rule**, so that a sink attempt draws the heavier
   mistake. NIH requires all pharmaceutical waste to be collected. Paracetamol is not RCRA-listed, so the reason is the
   pharmaceutical-waste policy, not toxicity. `why` should say that.
5. **Dilution is never a route to the sink.** Add this to the waste station's brief or `why` text. NIH ("Dilution to
   achieve compliance is prohibited") and WCU both say it, and it heads off the student who dilutes ethanol and tries
   the sink.
6. **Ethanol stays "never the sink" at every strength.** This is correct as a teaching default (WCU), and stricter than
   the federal < 24 % exclusion and NIH's 10 % allowance. Say "local rules may differ; we teach the strictest" rather
   than implying a universal law.
7. **The sink is for drug-free solutions only.** The `sink` stream detail ("dilute, non-hazardous aqueous solutions named
   as sink-safe in the procedure only") is right. Each experiment's sink-safe list should come from the table in §6:
   NaCl, sucrose, drug-free phosphate buffer and water. **Spent dissolution medium is never on that list**, because it
   contains drug.
