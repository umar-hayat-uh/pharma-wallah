import { TEAM_AUTHOR } from "@/lib/content/governance";
import type { Guide } from "@/lib/guides/types";

/*
 * DRAFT. Every number below was recomputed in Python (math.log10 and plain
 * arithmetic) on 2026-10-13. The drugs, absorptivities and readings are
 * invented for teaching; no value is taken from a monograph.
 */

export const guide: Guide = {
  slug: "beer-lambert-and-uv-spectrophotometry",
  title: "The Beer–Lambert Law and UV–Visible Spectrophotometry",
  description:
    "Absorbance, transmittance, A = εbc, specific absorbance A(1%, 1 cm), λmax and UV assays through dilutions, with worked examples and practice questions.",
  category: "Pharmaceutical Analysis",
  objectives: [
    "Convert between absorbance and percentage transmittance in both directions.",
    "Use A = εbc to find absorbance, concentration or molar absorptivity, with consistent units.",
    "Convert a specific absorbance A(1%, 1 cm) into a molar absorptivity and use either one in an assay.",
    "Explain why measurements are made at λmax and against a blank.",
    "Work an assay result back through every dilution to an amount per tablet and a percentage of the label claim.",
    "Recognise the conditions under which the Beer–Lambert law stops being linear.",
  ],
  intro: [
    "A UV–visible spectrophotometer does one simple thing: it shines light of a chosen wavelength through a solution and measures how much of it comes out the other side. From that single comparison you can identify a drug by the shape of its spectrum and, far more often in a pharmacy practical, find out how much of it is present.",
    "The link between what the instrument reads and the concentration in the cell is the Beer–Lambert law. It is short enough to memorise in a minute, but most mistakes in UV practicals are not about the law itself. They are about units (mol/L versus g/100 mL), path length, which wavelength to use, and above all forgetting to multiply back through the dilutions that got the sample into the cuvette.",
    "This guide works through those steps in order. All drugs and figures are invented for teaching and have been recalculated independently, so you can follow every line. Where a real assay is concerned, the wavelength, the absorptivity or reference standard and the acceptance limits always come from the monograph or your practical manual, not from this page.",
  ],
  terms: [
    { term: "Incident intensity (I₀)", definition: "The intensity of light reaching the sample. In practice it is the reading taken through a blank." },
    { term: "Transmitted intensity (I)", definition: "The intensity of light that passes through the sample and reaches the detector." },
    { term: "Transmittance (T)", definition: "The fraction of light transmitted, I ÷ I₀. Multiplied by 100 it is the percentage transmittance, %T." },
    { term: "Absorbance (A)", definition: "A = −log₁₀ T = log₁₀ (I₀ ÷ I). It has no unit, and it is the quantity proportional to concentration." },
    { term: "Molar absorptivity (ε)", definition: "The absorbance of a 1 mol/L solution in a 1 cm cell, in L mol⁻¹ cm⁻¹. It is constant for a given substance, wavelength and solvent." },
    { term: "Specific absorbance A(1%, 1 cm)", definition: "The absorbance of a 1% w/v solution (1 g in 100 mL) in a 1 cm cell. Pharmacopoeial UV assays often quote this instead of ε." },
    { term: "λmax", definition: "The wavelength at which a substance's absorbance spectrum reaches a maximum." },
    { term: "Blank", definition: "The solvent or reagent mixture without the analyte, used to set the instrument to zero absorbance so that only the analyte is measured." },
    { term: "Path length (b)", definition: "The distance the light travels through the solution, set by the cuvette. The standard cell is 1 cm." },
  ],
  sections: [
    {
      id: "absorbance-and-transmittance",
      heading: "Absorbance and transmittance",
      blocks: [
        {
          kind: "p",
          text: "The instrument first reads the light coming through a blank, I₀, then the light coming through the sample, I. Their ratio is the transmittance. Transmittance falls in a curve as concentration rises, which makes it awkward to work with, so the instrument also reports absorbance, the negative logarithm of transmittance. Absorbance rises in a straight line with concentration, which is why it is the number you use in calculations.",
        },
        {
          kind: "formula",
          expr: "T = I ÷ I₀     %T = T × 100     A = −log₁₀ T = log₁₀ (I₀ ÷ I)     T = 10⁻ᴬ",
          where: [
            { sym: "I₀", meaning: "light intensity through the blank" },
            { sym: "I", meaning: "light intensity through the sample" },
            { sym: "T", meaning: "transmittance, a fraction between 0 and 1" },
            { sym: "A", meaning: "absorbance, no unit" },
          ],
        },
        {
          kind: "table",
          caption: "Absorbance and the percentage of light transmitted",
          head: ["Absorbance (A)", "%T", "Comment"],
          rows: [
            ["0.1", "79.4", "Most light passes; small reading errors matter more"],
            ["0.3", "50.1", "About half the light is absorbed"],
            ["0.5", "31.6", "Comfortably inside the usual working range"],
            ["0.7", "20.0", "Still inside the usual working range"],
            ["1.0", "10.0", "Only a tenth of the light reaches the detector"],
            ["1.5", "3.2", "Stray light starts to distort the reading"],
            ["2.0", "1.0", "Too little light for a reliable reading on most instruments"],
          ],
        },
        {
          kind: "example",
          title: "Converting between %T and A",
          problem: "A solution transmits 25.0% of the incident light. What is its absorbance? What %T corresponds to A = 0.30?",
          steps: [
            "T = 25.0 ÷ 100 = 0.250.",
            "A = −log₁₀ 0.250 = 0.602.",
            "For A = 0.30: T = 10⁻⁰·³⁰ = 0.501, so %T = 50.1%.",
          ],
          answer: "A = 0.602; A = 0.30 corresponds to 50.1% T.",
          note: "Each increase of 1.0 in absorbance means ten times less light gets through. That is why a reading of 2.0 is so much less reliable than a reading of 0.5.",
        },
      ],
    },
    {
      id: "beer-lambert-law",
      heading: "The Beer–Lambert law and its two forms",
      blocks: [
        {
          kind: "p",
          text: "The law says that absorbance is proportional both to the concentration of the absorbing substance and to the distance the light travels through it. Double the concentration and the absorbance doubles; use a cell half as long and it halves.",
        },
        {
          kind: "formula",
          expr: "A = ε × b × c",
          where: [
            { sym: "A", meaning: "absorbance, no unit" },
            { sym: "ε", meaning: "molar absorptivity, L mol⁻¹ cm⁻¹" },
            { sym: "b", meaning: "path length, cm" },
            { sym: "c", meaning: "concentration, mol/L" },
          ],
          note: "The units of ε are chosen so that they cancel: (L mol⁻¹ cm⁻¹) × cm × (mol/L) leaves no unit, as an absorbance must.",
        },
        {
          kind: "p",
          text: "Pharmacopoeial assays usually work in mass rather than moles, so they quote a specific absorbance, written A(1%, 1 cm). It is the absorbance a 1 g per 100 mL solution would have in a 1 cm cell. With it, the law becomes A = A(1%, 1 cm) × b × c, where c must be in g per 100 mL. The two constants are linked through the molecular weight.",
        },
        {
          kind: "formula",
          expr: "A = A(1%, 1 cm) × b × c(g/100 mL)     ε = A(1%, 1 cm) × MW ÷ 10",
          where: [
            { sym: "A(1%, 1 cm)", meaning: "specific absorbance, for c in g per 100 mL and b in cm" },
            { sym: "c(g/100 mL)", meaning: "concentration in grams per 100 mL (percent w/v)" },
            { sym: "MW", meaning: "molecular weight, g/mol" },
          ],
          note: "The factor 10 converts g per 100 mL into g per litre.",
        },
        {
          kind: "example",
          title: "From specific absorbance to ε and a working concentration",
          problem:
            "An invented drug has MW 250.0 g/mol and A(1%, 1 cm) = 500 at its λmax. Find ε, and the concentration in µg/mL that gives A = 0.500 in a 1 cm cell.",
          steps: [
            "ε = 500 × 250.0 ÷ 10 = 12 500 L mol⁻¹ cm⁻¹.",
            "c = A ÷ (ε × b) = 0.500 ÷ (12 500 × 1) = 4.0 × 10⁻⁵ mol/L.",
            "In mass units: 4.0 × 10⁻⁵ mol/L × 250.0 g/mol = 0.010 g/L = 10 µg/mL.",
            "Check with the specific absorbance: 10 µg/mL = 0.001 g/100 mL, and 500 × 1 × 0.001 = 0.500.",
          ],
          answer: "ε = 12 500 L mol⁻¹ cm⁻¹; a 10 µg/mL solution reads A = 0.500.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Match the concentration unit to the constant",
          text: "ε needs mol/L. A(1%, 1 cm) needs g per 100 mL. Putting µg/mL into either one without converting gives an answer that is wrong by a factor of thousands, and the instrument cannot warn you.",
        },
      ],
    },
    {
      id: "wavelength-and-blank",
      heading: "Choosing the wavelength and zeroing on a blank",
      blocks: [
        {
          kind: "p",
          text: "A UV spectrum is a plot of absorbance against wavelength. Assays are normally read at λmax for two reasons. First, the absorbance is largest there, so the method is most sensitive. Second, the spectrum is flat at the top of a peak, so a small error in the instrument's wavelength setting barely changes the reading. On the steep side of a peak the same small wavelength error can change the absorbance a great deal.",
        },
        {
          kind: "table",
          caption: "A scan of an invented drug solution, read every 5–10 nm",
          head: ["Wavelength (nm)", "Absorbance", "Change from the previous reading"],
          rows: [
            ["230", "0.212", "—"],
            ["240", "0.388", "+0.176"],
            ["250", "0.561", "+0.173"],
            ["255", "0.598", "+0.037"],
            ["260", "0.574", "−0.024"],
            ["270", "0.402", "−0.172"],
            ["280", "0.185", "−0.217"],
          ],
        },
        {
          kind: "p",
          text: "The highest reading in this scan is 0.598 at 255 nm, so λmax is about 255 nm (a finer scan around it would pin it down). Near the top, moving 5 nm changes the reading by only a few hundredths; between 270 and 280 nm, a 10 nm move changes it by more than 0.2. That is the practical case for λmax.",
        },
        {
          kind: "p",
          text: "Before reading any sample, the instrument is zeroed on a blank: the same solvent, buffer or reagent mixture, in a matched cuvette, without the drug. Anything that absorbs in the blank is then subtracted automatically. Glass and most plastic cuvettes absorb strongly in the ultraviolet, so quartz (fused silica) cells are used for UV work; check your manual for the cells it specifies.",
        },
      ],
    },
    {
      id: "uv-assay",
      heading: "A UV assay: from absorbance to % label claim",
      blocks: [
        {
          kind: "p",
          text: "A tablet assay rarely puts a tablet straight into a cuvette. Powder is weighed, dissolved, made up to volume, filtered, and then diluted again so that the final absorbance falls in the reliable range. The concentration you calculate from A is the concentration in the cuvette. To report the drug per tablet you must multiply back through every dilution, then scale from the powder weighed to one average tablet.",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Calculate the concentration in the cuvette from the absorbance (using ε, A(1%, 1 cm), a calibration line, or a reference standard).",
            "Multiply by each dilution factor (final volume ÷ aliquot volume) to reach the first solution.",
            "Multiply by the volume of the first solution to get the amount of drug in the powder you weighed.",
            "Scale by (average tablet weight ÷ powder weighed) to get the amount per tablet.",
            "Divide by the label claim and multiply by 100.",
          ],
        },
        {
          kind: "example",
          title: "Tablet assay using a specific absorbance",
          problem:
            "Tablets are labelled 100 mg; 20 tablets weigh on average 250.0 mg each. Powder weighing 125.0 mg is shaken with solvent, made up to 100 mL and filtered. 2.0 mL of the filtrate is diluted to 100 mL and reads A = 0.472 in a 1 cm cell. A(1%, 1 cm) of the drug is taken as 480 at this wavelength (invented value). Find the drug per tablet and the % label claim.",
          steps: [
            "Concentration in the cuvette: c = 0.472 ÷ (480 × 1) = 9.833 × 10⁻⁴ g/100 mL = 9.833 µg/mL.",
            "Undo the 2.0 → 100 mL dilution (factor 50): 9.833 × 50 = 491.7 µg/mL in the first solution.",
            "Amount in the 100 mL first solution: 491.7 µg/mL × 100 mL = 49 167 µg = 49.17 mg.",
            "That came from 125.0 mg of powder, so per average tablet: 49.17 × 250.0 ÷ 125.0 = 98.33 mg.",
            "% label claim = 98.33 ÷ 100 × 100 = 98.3%.",
          ],
          answer: "About 98.3 mg per tablet, 98.3% of the label claim.",
          note: "A quick check: 125.0 mg of powder should contain 50.0 mg of drug if the tablets were exactly on label, and 49.17 ÷ 50.0 × 100 also gives 98.3%.",
        },
        {
          kind: "p",
          text: "Many monographs avoid relying on a printed absorptivity at all. Instead, a reference standard is weighed and diluted in exactly the same way, and the sample is compared directly with it: c(sample) = c(standard) × A(sample) ÷ A(standard). Because both solutions pass through the same instrument at the same moment, any small difference between your instrument and the one that produced a published constant cancels out.",
        },
        {
          kind: "formula",
          expr: "c(sample) = c(standard) × A(sample) ÷ A(standard)",
          where: [
            { sym: "c(standard)", meaning: "known concentration of the reference standard solution" },
            { sym: "A(sample), A(standard)", meaning: "absorbances of the two solutions, read under the same conditions" },
          ],
          note: "This single-point comparison assumes the response passes through zero and is linear between the two concentrations, so the sample and standard should be close in concentration.",
        },
      ],
    },
    {
      id: "deviations",
      heading: "When the law stops working",
      blocks: [
        {
          kind: "p",
          text: "The Beer–Lambert law is an idealisation. It assumes monochromatic light, a clear and dilute solution, and an absorbing species that does not change as concentration changes. When any of those fails, a plot of absorbance against concentration curves, and a calculation based on a straight line gives the wrong answer.",
        },
        {
          kind: "list",
          items: [
            "Instrumental: stray light and a wide spectral bandwidth both make high absorbances read too low, so the line bends towards the concentration axis at the top.",
            "Chemical: if the drug ionises, associates or reacts as the concentration or pH changes, the absorbing species changes and so does ε. Buffered solvents are used for this reason.",
            "Physical: turbidity scatters light, which the instrument counts as absorbance. Filter or centrifuge cloudy solutions.",
            "Concentration: at high concentrations molecules interact and the proportionality fails. Dilute into the working range instead.",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Stay in the working range",
          text: "Many practical manuals ask for readings roughly between 0.2 and 0.8 absorbance, where both reading error and stray light are small; the exact range depends on the instrument and the method. If a sample reads above the top of your range, dilute it by a known factor and multiply back, rather than trusting the reading.",
        },
      ],
    },
  ],
  mistakes: [
    "Using A(1%, 1 cm) with a concentration in µg/mL or mol/L instead of g per 100 mL, or using ε with a mass concentration.",
    "Forgetting one dilution step, or dividing by a dilution factor instead of multiplying, when working back from the cuvette to the sample.",
    "Reading %T and treating it as if it were proportional to concentration. Only absorbance is linear with concentration.",
    "Zeroing the instrument on air or water when the sample is in a buffer or reagent that also absorbs.",
    "Measuring on the steep side of a peak instead of at λmax, so a small wavelength error produces a large absorbance error.",
    "Using glass or plastic cuvettes for measurements in the ultraviolet, where they absorb.",
    "Accepting a very high reading (above about 1.0–1.5) instead of diluting and re-reading.",
    "Leaving fingerprints, scratches or air bubbles in the light path, which add apparent absorbance.",
  ],
  practice: [
    {
      q: "A solution has an absorbance of 0.750. What percentage of the incident light does it transmit?",
      answer: "About 17.8% T.",
      working: ["T = 10⁻⁰·⁷⁵⁰ = 0.178.", "%T = 0.178 × 100 = 17.8%."],
    },
    {
      q: "A sample transmits 40.0% of the incident light. What is its absorbance?",
      answer: "A = 0.398.",
      working: ["T = 40.0 ÷ 100 = 0.400.", "A = −log₁₀ 0.400 = 0.398."],
    },
    {
      q: "A drug has ε = 8000 L mol⁻¹ cm⁻¹. Its solution reads A = 0.640 in a 1 cm cell. What is its molar concentration?",
      answer: "8.0 × 10⁻⁵ mol/L.",
      working: ["c = A ÷ (ε × b).", "c = 0.640 ÷ (8000 × 1) = 8.0 × 10⁻⁵ mol/L."],
    },
    {
      q: "The same 8.0 × 10⁻⁵ mol/L solution is read in a 0.5 cm cell. What absorbance do you expect?",
      answer: "A = 0.320.",
      working: ["A = ε × b × c = 8000 × 0.5 × 8.0 × 10⁻⁵ = 0.320.", "Halving the path length halves the absorbance."],
    },
    {
      q: "A drug of MW 300.0 g/mol has A(1%, 1 cm) = 350. What is its molar absorptivity?",
      answer: "ε = 10 500 L mol⁻¹ cm⁻¹.",
      working: ["ε = A(1%, 1 cm) × MW ÷ 10.", "ε = 350 × 300.0 ÷ 10 = 10 500 L mol⁻¹ cm⁻¹."],
    },
    {
      q: "A sample was diluted 5.0 mL to 50.0 mL and the diluted solution reads A = 0.420 in a 1 cm cell. The drug has ε = 12 000 L mol⁻¹ cm⁻¹ and MW 200.0 g/mol. What was the concentration of the original sample in µg/mL?",
      answer: "70 µg/mL (7.0 µg/mL in the cuvette).",
      working: [
        "c in the cuvette = 0.420 ÷ (12 000 × 1) = 3.5 × 10⁻⁵ mol/L.",
        "In mass units: 3.5 × 10⁻⁵ × 200.0 = 7.0 × 10⁻³ g/L = 7.0 µg/mL.",
        "Dilution factor = 50.0 ÷ 5.0 = 10, so the original sample = 7.0 × 10 = 70 µg/mL.",
      ],
    },
    {
      q: "An injection is labelled 20 mg/mL. 1.0 mL is diluted to 100 mL, then 2.0 mL of that is diluted to 100 mL. The final solution reads A = 0.209. The calibration line is A = 0.0520 × C + 0.0040 (C in µg/mL). What is the strength found, and the % label claim?",
      answer: "19.71 mg/mL, 98.6% of the label claim.",
      working: [
        "C in the cuvette = (0.209 − 0.0040) ÷ 0.0520 = 3.942 µg/mL.",
        "Total dilution factor = (100 ÷ 1.0) × (100 ÷ 2.0) = 100 × 50 = 5000.",
        "Original strength = 3.942 × 5000 = 19 712 µg/mL = 19.71 mg/mL.",
        "% label claim = 19.71 ÷ 20 × 100 = 98.6%.",
      ],
    },
    {
      q: "A reference standard solution of 10.0 µg/mL reads A = 0.500. A sample solution prepared the same way reads A = 0.465. What is the sample concentration?",
      answer: "9.30 µg/mL.",
      working: [
        "c(sample) = c(standard) × A(sample) ÷ A(standard).",
        "c(sample) = 10.0 × 0.465 ÷ 0.500 = 9.30 µg/mL.",
      ],
    },
  ],
  limitations: [
    "All drugs, absorptivities and readings here are invented for teaching. Real wavelengths, A(1%, 1 cm) values and reference standards come from the relevant monograph.",
    "Only single-component assays are covered. Mixtures that absorb at the same wavelength need simultaneous-equation, derivative or separation methods, which are not discussed.",
    "The working absorbance range and the acceptance limits for an assay are set by the method and your practical manual, not by this guide.",
    "Instrument checks (wavelength accuracy, stray light, photometric accuracy and resolution) are mentioned only in passing.",
  ],
  refs: ["harris10", "iupacGoldBook"],
  relatedTools: [
    {
      slug: "law-absorbance-calculator",
      name: "Beer-Lambert Law Calculator",
      why: "Solves A = εbc for absorbance, concentration or ε with unit conversion for mol/L and path length, and reports %T as 10⁻ᴬ × 100, as in this guide.",
    },
    {
      slug: "uv-spectrum-plotter",
      name: "UV-Vis Spectrum Plotter",
      why: "Plot your own scan to find λmax, or fit a least-squares calibration line to your standards instead of relying on a published absorptivity.",
    },
  ],
  relatedGuides: ["accuracy-precision-recovery", "dilution-and-concentration", "titrimetric-analysis-and-assay"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
