# Unit 2: Electrochemical Methods

---

### **2.1 Potentiometry**
Potentiometry is an electrochemical method that measures the **potential (voltage)** of an electrochemical cell under conditions of zero current. The measured potential is related to the concentration of the analyte ion in solution via the **Nernst Equation**.

#### **Principle**
*   The potential of an **indicator electrode** sensitive to the analyte ion is measured relative to a stable **reference electrode** (e.g., Saturated Calomel Electrode - SCE).
*   The relationship is given by the **Nernst Equation**:
    `E = E⁰ - (RT/nF) * ln(a)`
    where:
    *   E = measured cell potential
    *   E⁰ = standard electrode potential
    *   R = gas constant
    *   T = temperature in Kelvin
    *   n = number of electrons transferred
    *   F = Faraday constant
    *   a = activity of the ion (approx. concentration in dilute solutions)
*   For direct potentiometry (e.g., pH measurement), the potential is measured and concentration is read from a calibration curve. In **potentiometric titrations**, the potential is monitored as titrant is added; the equivalence point is identified by a sharp change in potential (the inflection point on the titration curve).

#### **Instrumentation**
1.  **Indicator Electrode:** Develops a potential dependent on the activity of the analyte ion.
    *   **Metal Electrodes:** For the metal itself (e.g., Ag wire for Ag⁺).
    *   **Ion-Selective Electrodes (ISEs):** Have a selective membrane.
        *   **Glass Membrane Electrode:** For H⁺ ions (pH electrode).
        *   **Solid-State/Crystalline Electrodes:** e.g., LaF₃ crystal for F⁻.
        *   **Liquid Membrane Electrodes:** For ions like K⁺, Ca²⁺, NO₃⁻.
2.  **Reference Electrode:** Provides a stable, constant potential.
    *   **Saturated Calomel Electrode (SCE):** Hg | Hg₂Cl₂ | KCl (sat.)
    *   **Silver/Silver Chloride Electrode:** Ag | AgCl | KCl
3.  **Potentiometer/High-Impedance pH Meter:** Measures the potential difference without drawing significant current.

#### **Applications**
*   **Direct Potentiometry:**
    *   **pH Measurement:** Ubiquitous in labs for formulation, stability studies, and biochemical assays.
    *   **Ion Concentration:** Clinical analysis of Na⁺, K⁺, Ca²⁺, Cl⁻ in blood serum using specific ISEs.
*   **Potentiometric Titrations:**
    *   Acid-base titrations (especially for colored/turbid solutions where visual indicators fail).
    *   Precipitation titrations (e.g., halides with AgNO₃).
    *   Redox titrations (e.g., Fe²⁺ with Ce⁴⁺).
    *   Complexometric titrations with ion-selective electrodes.

---

### **2.2 Polarography**
Polarography is a type of **voltammetry** where the current flowing through an electrochemical cell is measured as a function of the applied potential. It uses a **Dropping Mercury Electrode (DME)** as the working electrode.

#### **Principle**
*   Based on the **electrolysis** of an analyte solution under a gradually increasing applied voltage.
*   The DME has a constantly renewed, clean mercury surface, minimizing passivation.
*   As the applied voltage reaches the **decomposition potential** of an ion, that ion is reduced (or oxidized) at the electrode surface, causing a current to flow.
*   The limiting current, called the **diffusion current (i_d)**, is proportional to the concentration of the analyte (Ilkovič equation).
*   The potential at half the diffusion current is the **half-wave potential (E₁/₂)**, which is characteristic of the analyte.

#### **Instrumentation**
1.  **Three-Electrode System:**
    *   **Working Electrode:** Dropping Mercury Electrode (DME) – mercury flows from a reservoir through a fine capillary.
    *   **Reference Electrode:** SCE or Ag/AgCl.
    *   **Counter/Auxiliary Electrode:** Platinum wire.
2.  **Potentiostat:** Applies a linearly changing voltage (ramp) to the cell.
3.  **Current Measuring Device:** Records the resulting current.
4.  **Supporting Electrolyte:** An inert salt (e.g., KCl) is added in high concentration to carry the current and eliminate ionic migration.

#### **Applications**
*   **Quantitative Analysis:** Determination of trace metals (Zn²⁺, Cd²⁺, Pb²⁺, Cu²⁺) in pharmaceuticals, water, or biological samples.
*   **Qualitative Analysis:** Identification of species based on their characteristic **half-wave potential (E₁/₂)**.
*   **Study of Reversible Reactions:** Determining the number of electrons (n) involved in a redox process.
*   **Analysis of Functional Groups:** Nitro, azo, carbonyl groups in organic compounds can be reduced at the DME.
*   **Limitation:** Less common today due to the toxicity of mercury and the advent of more sensitive techniques like HPLC and AAS, but its principles underpin modern voltammetric methods.

---

### **2.3 Conductometry**
Conductometry measures the **ability of a solution to carry an electric current**, which is related to the total concentration and mobility of ions present. It is a non-specific technique.

#### **Principle**
*   The **electrical conductance (G)** of a solution is the reciprocal of its resistance (R): `G = 1/R`. The SI unit is Siemens (S).
*   Conductance depends on:
    *   **Concentration** of ions
    *   **Charge** on the ions
    *   **Mobility** of the ions (size, hydration, temperature)
    *   **Geometry of the cell** (constant for a given cell = cell constant, K)
*   **Molar Conductivity (Λₘ)** = Conductivity (κ) / Molar Concentration. It indicates the conducting power of all ions from one mole of electrolyte.
*   In **conductometric titrations**, the change in conductance is plotted against titrant volume. The equivalence point is at the intersection of two straight lines with different slopes, representing changes in the conductivity of the solution as ions are replaced by others with different mobilities.

#### **Instrumentation**
1.  **Conductivity Cell:** Contains two parallel platinum electrodes, often platinized (coated with Pt black) to increase surface area and reduce polarization.
2.  **Wheatstone Bridge Circuit:** Used to measure the resistance of the solution accurately. An AC source (1-3 kHz) is used to prevent electrolysis and polarization at the electrodes.
3.  **Null-Detector:** An oscilloscope or earphone to detect the balance point of the bridge.

#### **Applications**
*   **Conductometric Titrations:** Excellent for very dilute solutions, colored/turbid solutions, or weak acid-base systems where visual indicators are ineffective.
    *   **Strong Acid vs. Strong Base:** Sharp V-shaped curve.
    *   **Weak Acid vs. Strong Base:** Different curve shape.
    *   **Precipitation Reactions:** e.g., SO₄²⁻ with Ba²⁺.
*   **Purity of Water:** Continuous monitoring of water purity (e.g., in pharmaceutical water systems - WFI, purified water). High conductance indicates ionic impurities.
*   **Solubility of Sparingly Soluble Salts:** By measuring the conductivity of a saturated solution.
*   **Basicity Constants of Acids:** By measuring conductivity at different concentrations.

---

### **Key References & Source Material**
The content above is synthesized and explained based on the principles outlined in the following recommended texts:

1.  **Skoog, Holler & Nieman. *Principles of Instrumental Analysis*, 5th/6th Edition.** – The definitive source for the theoretical principles, instrumentation details, and modern contexts of all three electrochemical methods.
2.  **Ewing, G.W. *Instrumental Methods of Chemical Analysis*, 5th Edition (1985).** – Provides classic and detailed explanations of polarographic theory (Ilkovič equation) and conductometric cell design.
3.  **Watson, D.G. *Pharmaceutical Analysis* (1999).** – For applied, pharmaceutical-focused examples of potentiometry (ion-selective electrodes in clinical analysis) and conductometric titrations.
4.  **Vogel’s *Textbook of Quantitative Chemical Analysis*, 6th Ed. (2006).** – For practical laboratory procedures, cell constants, and classic applications of these methods in analytical chemistry.

