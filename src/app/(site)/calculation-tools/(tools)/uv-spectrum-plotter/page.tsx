"use client";

import { useRef, useState } from "react";
import { Activity, LineChart as LineChartIcon, ScanLine } from "lucide-react";
import {
  CalculatorShell,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  LabReport,
  LabActions,
  ModeSwitch,
} from "@/components/calculators";
import { SpectrumPanel, useSpectrum } from "./_spectrum";
import { CalibrationPanel, useCalibration } from "./_calibration";

/*
 * UV-Vis Spectrum Plotter.
 *
 * Two modes over one lab record:
 *  - Spectrum: plot absorbance against wavelength, find λmax and peaks.
 *  - Calibration: fit A = m·c + b to standards and read unknowns off the line.
 *
 * State for both modes lives here (in two hooks) so switching mode does not
 * throw away a table the student has typed in; only the active panel renders,
 * so a hidden chart never measures itself at zero width.
 *
 * Nothing is invented: incomplete rows are excluded and flagged, λmax and
 * peaks come only from measured readings, and the example datasets are
 * labelled as illustrative wherever they appear.
 */

type Mode = "spectrum" | "calibration";

export default function UvSpectrumPlotter() {
  const [mode, setMode] = useState<Mode>("spectrum");
  const [submitted, setSubmitted] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const spectrum = useSpectrum(submitted);
  const calibration = useCalibration(submitted);
  const report = mode === "spectrum" ? spectrum.report : calibration.report;

  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setSubmitted(false);
    if (mode === "spectrum") spectrum.reset();
    else calibration.reset();
  };

  return (
    <CalculatorShell
      title="UV-Vis Spectrum Plotter"
      subtitle="Plot absorbance spectra, find λmax and peaks, and fit calibration curves."
      eyebrow="Pharmaceutical analysis"
      icon={ScanLine}
      aside={
        <>
          <CalcAbout title="About UV-Vis spectrophotometry">
            <p>
              A UV-Visible spectrophotometer measures how much light a solution absorbs at each wavelength.
              Absorbance follows the <strong>Beer–Lambert law</strong>, A = εbc: it is proportional to the
              concentration c and the path length b, with ε the molar absorptivity of the substance at that
              wavelength.
            </p>
            <p>
              Assays are read at <strong>λmax</strong>, the wavelength of maximum absorbance. There the response
              per unit concentration is largest, and the spectrum is flat, so a small error in the wavelength
              setting barely changes the reading.
            </p>
            <CalcList
              title="Good practice"
              items={[
                "Zero the instrument on a blank of the same solvent in the same (or a matched) cuvette",
                "Use quartz cuvettes below about 340 nm — glass and most plastics absorb in the UV",
                "Keep readings between roughly 0.2 and 1.0 A, where photometric error is smallest",
                "Scan with a fine step near λmax; a coarse step can miss the true maximum",
              ]}
            />
            <CalcList
              tone="caution"
              title="Where results stop being reliable"
              items={[
                "Below the solvent cut-off — about 190 nm for water, 205 nm for methanol, 210 nm for ethanol",
                "Above about 2 A, stray light makes absorbance read low and calibration curves bend over",
                "Turbid or fluorescent samples scatter or re-emit light and distort the spectrum",
                "Negative absorbance means the sample transmits more than the blank — re-check the blank",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ModeSwitch
        label="Analysis mode"
        value={mode}
        onChange={(next) => { setMode(next); setSubmitted(false); }}
        options={[
          { value: "spectrum", label: "Spectrum", description: "λmax, peaks and graph", icon: Activity },
          { value: "calibration", label: "Calibration", description: "Linear regression and unknowns", icon: LineChartIcon },
        ]}
      />

      {mode === "spectrum" ? <SpectrumPanel s={spectrum} /> : <CalibrationPanel c={calibration} />}

      <LabActions
        report={report}
        onCalculate={calculate}
        onReset={reset}
        fileName={mode === "spectrum" ? "uv-spectrum" : "uv-calibration"}
      />

      <div ref={reportRef} className="scroll-mt-24">
        {report ? (
          <LabReport data={report} />
        ) : (
          <div className="rounded-[20px] border border-dashed bg-card p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Laboratory calculation card</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "spectrum"
                ? "Enter at least 2 complete readings to find λmax and build the lab card."
                : "Enter at least 3 standards with different concentrations to fit the calibration line."}
            </p>
          </div>
        )}
      </div>

      <FormulaNote>
        <Formula>A = ε · b · c</Formula>
        <p>
          A is absorbance (no units), ε the molar absorptivity (L mol⁻¹ cm⁻¹), b the path length (cm, usually 1)
          and c the concentration (mol/L). Absorbance is also A = log₁₀(I₀/I) = −log₁₀ T, so 1 A means 10% of the
          light gets through and 2 A means 1%.
        </p>
        <Formula>λmax = the measured wavelength with the highest absorbance</Formula>
        <p>
          Peaks are readings higher than the reading before them whose level then falls — endpoints excluded, a flat
          top counted once at its first point. Prominence = peak height − the higher of the two bases, where each base
          is the lowest reading between the peak and the nearest higher reading on that side (or the end of the data).
        </p>
        <Formula>m = Σ(c − c̄)(A − Ā) / Σ(c − c̄)²   b = Ā − m·c̄</Formula>
        <Formula>Through origin: m = Σ(c·A) / Σc²   b = 0</Formula>
        <Formula>R² = 1 − SSres / SStot   SSres = Σ(A − A_fit)²   SStot = Σ(A − Ā)²</Formula>
        <Formula>SE(m) = s(y/x) / √Σ(c − c̄)²   s(y/x) = √(SSres / (n − 2))</Formula>
        <Formula>Unknown: c = (A − b) / m   Original = c × dilution factor</Formula>
        <p>
          For a line forced through the origin, s(y/x) uses n − 1 degrees of freedom and SE(m) = s(y/x) / √Σc². R² is
          still computed about the mean absorbance so the two fits can be compared.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "Why is my λmax a few nanometres off the literature value?", a: "λmax depends on the solvent, pH and the instrument's slit width, and it can only be found at the wavelengths you measured. A 5 nm scan step cannot locate a maximum more precisely than about ±2.5 nm. Rescan near the peak with a 1 nm step, in the solvent the monograph specifies." },
          { q: "Should I use straight segments or the smoothed line?", a: "Straight segments show exactly what you measured and are the default. The smoothed line is a monotone cubic, which never rises above or dips below neighbouring readings, so it cannot invent a peak — but it is still a drawing aid. λmax, peaks and every number in the report use only the readings as entered." },
          { q: "What does peak prominence mean?", a: "How far a peak stands above the surrounding spectrum. A small noise bump on the side of a large band has a tiny prominence even if its absorbance is high. Set a minimum prominence (for example 0.02 A) to ignore bumps that are within your instrument's noise." },
          { q: "Why does ICH Q2 ask for at least 5 standards?", a: "With 3 points almost any smooth curve looks straight, and a single bad standard can hide. Five or more concentrations spread across the working range let you see curvature and outliers in the residuals, which is what a linearity claim actually needs." },
          { q: "Is R² above 0.999 proof of linearity?", a: "No. R² measures scatter about the line, not whether a straight line is the right model — a gently curving calibration can still give R² of 0.998. Look at the residuals in the report: they should be small and randomly scattered, not a systematic arch." },
          { q: "When should I force the line through the origin?", a: "Only when you have evidence the intercept is zero — the blank reads zero and the intercept's confidence interval includes zero. Forcing it otherwise biases every result, most at low concentrations. The ordinary fit is the safer default." },
          { q: "My unknown is outside the calibrated range. Can I still report it?", a: "Not as a validated result. Linearity is only demonstrated between the lowest and highest standards. Dilute the sample (and enter the dilution factor) or prepare a standard that brackets it, then re-measure." },
        ]}
      />
    </CalculatorShell>
  );
}
