## Unit 3: Bioenergetics

### Introduction to Bioenergetics

Bioenergetics is the quantitative study of energy relationships and energy conversions in living cells. It encompasses the principles of thermodynamics as applied to biological systems and focuses on how cells harvest, store, and utilize energy to perform work. In pharmaceutical biochemistry, understanding bioenergetics is crucial for comprehending drug effects on energy metabolism, mitochondrial toxicity, and the development of therapeutics targeting metabolic disorders.

**Key Concepts**:

| Concept | Definition | Biological Relevance |
|---------|------------|----------------------|
| Free energy (ΔG) | Energy available to do work at constant temperature and pressure | Determines spontaneity of reactions |
| Endergonic reaction | ΔG > 0; requires energy input | Biosynthetic pathways (anabolism) |
| Exergonic reaction | ΔG < 0; releases energy | Catabolic pathways (glycolysis, TCA) |
| Coupled reactions | Energy from exergonic reaction drives endergonic reaction | ATP synthesis, active transport |
| High-energy compounds | Molecules with large negative ΔG of hydrolysis | ATP, GTP, UTP, phosphocreatine |

---

### 1. Principles of Bioenergetics

#### 1.1 Thermodynamic Foundations

Biological systems obey the laws of thermodynamics:

- **First law**: Energy cannot be created or destroyed, only transformed. Cells convert chemical energy from nutrients into work and heat.
- **Second law**: Entropy (disorder) increases in spontaneous processes. Cells maintain order by exporting entropy to surroundings.

**Gibbs Free Energy Equation**:
ΔG = ΔH – TΔS

Where:
- ΔG = change in free energy
- ΔH = change in enthalpy (heat content)
- T = absolute temperature (Kelvin)
- ΔS = change in entropy

#### 1.2 Standard Free Energy Change (ΔG°′)

- ΔG°′ is the free energy change under standard conditions (1 M, 25°C, pH 7.0).
- Actual ΔG depends on concentrations of reactants and products: ΔG = ΔG°′ + RT ln([products]/[reactants])
- Reactions with large negative ΔG°′ are essentially irreversible under physiological conditions.

#### 1.3 ATP: The Energy Currency of the Cell

ATP (adenosine triphosphate) is the primary energy carrier in cells. Hydrolysis of ATP to ADP and Pi releases energy that drives endergonic processes.

**Phosphate Transfer Potential**: A measure of the tendency of a compound to donate a phosphoryl group.

| Compound | ΔG°′ of hydrolysis (kcal/mol) |
|----------|-------------------------------|
| Phosphoenolpyruvate (PEP) | -14.8 |
| 1,3-Bisphosphoglycerate | -11.8 |
| Phosphocreatine | -10.3 |
| ATP (→ ADP) | -7.3 |
| Glucose-1-phosphate | -5.0 |
| Glucose-6-phosphate | -3.3 |

**Why ATP is an ideal energy currency**:
- Intermediate phosphate transfer potential (can donate to lower-energy acceptors and be formed from higher-energy donors)
- Hydrolytically stable (does not spontaneously decompose)
- Small and water-soluble
- Can be rapidly regenerated

#### 1.4 Other High-Energy Compounds

- **GTP**: Used in protein synthesis, signal transduction, and TCA cycle (succinyl-CoA synthetase).
- **UTP**: Used in glycogen synthesis (UDP-glucose formation).
- **CTP**: Used in phospholipid synthesis.
- **Phosphocreatine**: Rapid reserve for ATP regeneration in muscle and brain.

#### 1.5 Electron Carriers: NADH, NADPH, FADH₂

| Carrier | Oxidized Form | Reduced Form | Function |
|---------|---------------|--------------|----------|
| NAD⁺/NADH | NAD⁺ | NADH | Catabolic redox reactions (glycolysis, TCA) → donate electrons to ETC |
| NADP⁺/NADPH | NADP⁺ | NADPH | Anabolic reactions (fatty acid synthesis, steroidogenesis) and antioxidant defense |
| FAD/FADH₂ | FAD | FADH₂ | Oxidation of succinate, fatty acyl-CoA; donates electrons to ETC (via complex II) |

---

### 2. Electron Transport Chain (ETC)

#### 2.1 Overview

The electron transport chain (ETC), also called the respiratory chain, is a series of protein complexes embedded in the inner mitochondrial membrane. It accepts electrons from NADH and FADH₂ (produced in glycolysis, TCA, fatty acid oxidation) and transfers them to molecular oxygen, forming water. The energy released during electron transfer is used to pump protons across the inner membrane, creating an electrochemical gradient that drives ATP synthesis.

#### 2.2 Location and Components

**Mitochondrial Structure**:
- Outer membrane: permeable to small molecules
- Inner membrane: impermeable; contains ETC complexes and ATP synthase
- Matrix: site of TCA cycle, fatty acid oxidation
- Intermembrane space

**Complexes of the ETC**:

| Complex | Name | Prosthetic Groups | Electron Flow | Proton Pumping |
|---------|------|-------------------|---------------|----------------|
| **Complex I** | NADH dehydrogenase (NADH:ubiquinone oxidoreductase) | FMN, Fe-S clusters | NADH → ubiquinone (Q) | Yes (4 H⁺/2 e⁻) |
| **Complex II** | Succinate dehydrogenase (Succinate:ubiquinone oxidoreductase) | FAD, Fe-S clusters, heme b | Succinate → FAD → Q | No |
| **Complex III** | Cytochrome bc₁ complex (Ubiquinol:cytochrome c oxidoreductase) | Heme bL, heme bH, heme c₁, Fe-S (Rieske) | QH₂ → cytochrome c | Yes (2 H⁺/e⁻? Actually Q cycle: 4 H⁺/2 e⁻) |
| **Complex IV** | Cytochrome c oxidase | Heme a, heme a₃, CuA, CuB | Cytochrome c → O₂ | Yes (2 H⁺/e⁻) |
| **Complex V** | ATP synthase (not part of ETC but coupled) | F₁ (catalytic), F₀ (proton channel) | Uses proton gradient to synthesize ATP | N/A (uses gradient) |

**Mobile Electron Carriers**:
- **Ubiquinone (Coenzyme Q, Q)**: Lipid-soluble, moves within the membrane, shuttles electrons from Complexes I and II to III.
- **Cytochrome c**: Water-soluble protein in intermembrane space, shuttles electrons from Complex III to IV.

#### 2.3 Electron Flow Pathway

```
NADH → Complex I → Q → Complex III → Cyt c → Complex IV → O₂
            ↓
FADH₂ (via Complex II) → Q
(Also electrons from fatty acyl-CoA via ETF:ubiquinone oxidoreductase feed into Q)
```

#### 2.4 The Q Cycle (Complex III Mechanism)

Complex III transfers electrons from ubiquinol (QH₂) to cytochrome c via a two-step cycle that increases proton pumping efficiency.

1. QH₂ binds to Q₀ site; one electron goes to Rieske Fe-S → cytochrome c₁ → cytochrome c; the other to heme bL → heme bH → Q at Qᵢ site, forming semiquinone.
2. Second QH₂ repeats, reducing semiquinone to QH₂ at Qᵢ site (consumes 2H⁺ from matrix).
Net: 2 QH₂ oxidized, 1 QH₂ formed, 4 H⁺ pumped (2 from Q₀ site to intermembrane space, 2 from matrix used at Qᵢ site).

#### 2.5 Complex IV: Cytochrome c Oxidase

- Transfers electrons from cytochrome c to O₂, reducing it to H₂O.
- Contains copper centers (CuA, CuB) and heme a, a₃.
- Reaction: 4 cytochrome c (Fe²⁺) + 8 H⁺(matrix) + O₂ → 4 cytochrome c (Fe³⁺) + 2 H₂O + 4 H⁺(pumped)
- Highly efficient; almost all energy conserved.

#### 2.6 Proton Motive Force (PMF)

Electron transport creates:
- **Chemical gradient** (ΔpH): higher [H⁺] in intermembrane space (acidic)
- **Electrical gradient** (ΔΨ): positive outside, negative inside

The proton motive force (PMF) = ΔΨ + (2.303 RT/F) ΔpH ≈ 200 mV under physiological conditions.

---

### 3. Oxidative Phosphorylation

#### 3.1 Definition

Oxidative phosphorylation is the process by which ATP is synthesized using energy derived from the electron transport chain. It couples the exergonic flow of electrons to O₂ with the endergonic phosphorylation of ADP.

#### 3.2 Chemiosmotic Theory (Peter Mitchell, 1961)

- Electron transport pumps protons out of the matrix.
- The resulting proton gradient stores energy.
- Protons flow back into the matrix through ATP synthase, driving ATP synthesis.
- This theory earned Mitchell the Nobel Prize in 1978.

#### 3.3 ATP Synthase (Complex V)

**Structure**:
- **F₁ subunit**: Spherical head in matrix; contains catalytic sites (α₃β₃γδε). γ subunit rotates.
- **F₀ subunit**: Proton channel embedded in inner membrane (ab₂c₁₀–₁₄). Protons flow through F₀, causing rotation of c-ring, which drives γ subunit rotation in F₁.
- Rotation causes conformational changes in β subunits (open, loose, tight) that synthesize and release ATP.

**Mechanism**:
- **Binding change mechanism** (Paul Boyer, John Walker): Three β subunits cycle through three conformations:
  - **O (open)**: Releases ATP
  - **L (loose)**: Binds ADP + Pi
  - **T (tight)**: Catalyzes ATP formation
- Each full rotation (360°) produces 3 ATP.

**Proton/ATP stoichiometry**: ~4 H⁺ per ATP (including transport of Pi and ADP/ATP exchange via antiporters). Older estimates were 3 H⁺/ATP.

#### 3.4 ATP Yield from Complete Glucose Oxidation

| Source | ATP per Glucose | Notes |
|--------|-----------------|-------|
| Glycolysis (substrate-level) | 2 ATP | |
| Glycolysis (2 NADH) | 3–5 ATP | Depends on shuttle (malate-aspartate: 2.5 each; glycerol-3-phosphate: 1.5 each) |
| Pyruvate → Acetyl-CoA (2 NADH) | 5 ATP | 2.5 each |
| TCA cycle (2 acetyl-CoA) | | |
| 2 GTP | 2 ATP | |
| 6 NADH | 15 ATP | |
| 2 FADH₂ | 3 ATP | 1.5 each |
| **Total** | ~30–32 ATP | Theoretical maximum |

#### 3.5 Regulation of Oxidative Phosphorylation

- **Respiratory control**: ATP demand regulates electron transport. High ADP (low ATP) stimulates respiration; high ATP inhibits.
- **Acceptor control ratio**: Ratio of respiration rate with ADP present vs. without. Indicates coupling.
- **Allosteric regulation**: ATP inhibits, ADP activates isocitrate dehydrogenase and α-ketoglutarate dehydrogenase (TCA cycle), indirectly controlling NADH supply.
- **Calcium**: Activates several dehydrogenases (pyruvate, isocitrate, α-KG) and ATP synthase.

---

### 4. Disorders of Electron Transport Chain and Oxidative Phosphorylation

#### 4.1 Inhibitors of ETC and Oxidative Phosphorylation

| Inhibitor | Target | Effect |
|-----------|--------|--------|
| **Rotenone** (insecticide) | Complex I (blocks electron transfer from Fe-S to Q) | Prevents NADH oxidation; ATP synthesis stops |
| **Amytal** (barbiturate) | Complex I | Similar to rotenone |
| **Malonate** | Complex II (competitive inhibitor of succinate dehydrogenase) | Blocks succinate oxidation |
| **Antimycin A** (antibiotic) | Complex III (blocks Q cycle at Qᵢ site) | Prevents electron transfer to cytochrome c |
| **Cyanide (CN⁻)** , **Azide**, **Carbon monoxide (CO)** | Complex IV (bind heme a₃/CuB, inhibit O₂ reduction) | Complete inhibition; rapidly fatal |
| **Oligomycin** | ATP synthase (F₀ subunit) | Blocks proton flow; ATP synthesis stops; electron transport also slows due to increased proton gradient |
| **Atractyloside** | Adenine nucleotide translocase (ANT) | Prevents ADP/ATP exchange across inner membrane |

#### 4.2 Uncouplers

Uncouplers dissociate electron transport from ATP synthesis by dissipating the proton gradient. Electrons continue to flow, but energy is released as heat.

| Uncoupler | Mechanism | Use/Effect |
|-----------|-----------|------------|
| **2,4-Dinitrophenol (DNP)** | Lipid-soluble weak acid; shuttles protons across membrane | Causes rapid heat production; was used as weight-loss drug but caused hyperthermia, death (banned) |
| **FCCP, CCCP** (carbonyl cyanide phenylhydrazones) | Potent protonophores | Experimental tools |
| **Thermogenin (UCP1)** in brown adipose tissue | Endogenous uncoupling protein; generates heat (non-shivering thermogenesis) | Important in neonates and hibernating animals |
| **Aspirin (high doses)** | Weak uncoupler | May contribute to salicylate toxicity |

**Clinical consequence**: Uncoupling leads to increased O₂ consumption, heat production, and potential cell damage due to ATP depletion.

#### 4.3 Mitochondrial Diseases

Mitochondrial diseases result from mutations in mitochondrial DNA (mtDNA) or nuclear genes encoding ETC components. Tissues with high energy demand (CNS, muscle, heart, endocrine) are most affected.

| Disease | Genetic Defect | Clinical Features |
|---------|----------------|-------------------|
| **Leber's Hereditary Optic Neuropathy (LHON)** | mtDNA mutations (usually complex I subunits) | Acute or subacute vision loss in young adults |
| **MELAS (Mitochondrial Encephalomyopathy, Lactic Acidosis, and Stroke-like episodes)** | mtDNA mutations (often tRNA^Leu) | Stroke-like episodes, seizures, dementia, lactic acidosis |
| **MERRF (Myoclonic Epilepsy with Ragged Red Fibers)** | mtDNA mutations (tRNA^Lys) | Myoclonus, epilepsy, ataxia, myopathy |
| **Kearns-Sayre Syndrome** | Large-scale mtDNA deletions | Progressive external ophthalmoplegia, pigmentary retinopathy, heart block, onset before age 20 |
| **Leigh Syndrome** | Nuclear or mtDNA mutations (complex I, IV, pyruvate dehydrogenase) | Subacute necrotizing encephalomyelopathy in infants; psychomotor regression, brainstem signs |
| **Complex I deficiency** | Nuclear or mtDNA mutations in NADH dehydrogenase subunits | Wide spectrum: from lethal infantile lactic acidosis to adult-onset myopathy |

#### 4.4 Drug-Induced Mitochondrial Toxicity

Many drugs impair mitochondrial function, leading to adverse effects.

| Drug Class | Example | Mechanism of Mitochondrial Toxicity | Clinical Consequence |
|------------|---------|--------------------------------------|----------------------|
| **NRTIs (antivirals)** | Zidovudine (AZT) | Inhibit mitochondrial DNA polymerase γ, depleting mtDNA | Lactic acidosis, myopathy, hepatic steatosis |
| **Statins** | Atorvastatin | May reduce coenzyme Q10 levels; mitochondrial dysfunction in muscle | Myalgia, rhabdomyolysis (rare) |
| **Metformin** | Metformin | Mild inhibition of complex I; reduces hepatic gluconeogenesis | Lactic acidosis (rare, mainly in renal impairment) |
| **Amiodarone** | Amiodarone | Inhibits fatty acid oxidation and ETC | Hepatotoxicity, phospholipidosis |
| **Valproic acid** | Valproate | Inhibits fatty acid oxidation; depletes carnitine; mitochondrial toxicity | Hepatotoxicity (especially in children with underlying defects) |
| **Aspirin (high dose)** | Salicylate | Uncouples oxidative phosphorylation | Hyperthermia, metabolic acidosis |
| **Doxorubicin** (anthracycline) | Doxorubicin | Generates ROS, inhibits complex I, cardiotoxic | Cardiomyopathy (cumulative dose-dependent) |

#### 4.5 Ischemia-Reperfusion Injury

- During ischemia, electron transport halts due to lack of O₂, leading to ATP depletion, ion imbalances, and Ca²⁺ overload.
- Upon reperfusion, rapid electron flow combined with damaged complexes causes massive ROS production (see below), leading to cell death.

---

### 5. Reactive Oxygen Species (ROS)

#### 5.1 Definition

Reactive oxygen species (ROS) are chemically reactive molecules containing oxygen. They are produced as byproducts of normal metabolism, especially during electron transport, and also by dedicated enzymes.

#### 5.2 Major ROS

| ROS | Symbol | Characteristics | Source |
|-----|--------|-----------------|--------|
| Superoxide anion | O₂•⁻ | One-electron reduction of O₂; precursor of most other ROS | Complex I (leakage), Complex III (via Q•⁻), NADPH oxidase, xanthine oxidase |
| Hydrogen peroxide | H₂O₂ | Two-electron reduction of O₂; more stable; can cross membranes | Superoxide dismutase (from O₂•⁻), oxidases (e.g., monoamine oxidase) |
| Hydroxyl radical | •OH | Most reactive; damages everything in its vicinity | Fenton reaction (Fe²⁺ + H₂O₂) |
| Singlet oxygen | ¹O₂ | Excited state of O₂ | Photosensitization reactions |
| Peroxynitrite | ONOO⁻ | Reaction of O₂•⁻ with NO• | Nitric oxide synthase uncoupling, inflammation |

#### 5.3 Sites of ROS Production in ETC

- **Complex I**: Electron leakage from FMN or Fe-S clusters, especially when high NADH/NAD⁺ ratio or damage.
- **Complex III**: Ubisemiquinone intermediate at Q₀ site can donate electrons to O₂, forming O₂•⁻ (released into intermembrane space and matrix).
- **Other mitochondrial sources**: Glycerol-3-phosphate dehydrogenase, dihydroorotate dehydrogenase, pyruvate and α-ketoglutarate dehydrogenases (minor).

#### 5.4 Physiological Roles of ROS

- **Signal transduction**: H₂O₂ modulates activity of kinases, phosphatases, transcription factors (e.g., NF-κB, HIF-1α).
- **Immune defense**: Phagocytes produce ROS via NADPH oxidase to kill pathogens.
- **Cellular differentiation and proliferation**: ROS influence cell cycle.
- **Hormone synthesis**: Thyroid peroxidase uses H₂O₂ for iodination of thyroglobulin.

#### 5.5 Pathological Effects of ROS (Oxidative Stress)

When ROS production exceeds antioxidant capacity, oxidative stress damages cellular components:

| Target | Effect | Consequence |
|--------|--------|-------------|
| **Lipids** | Lipid peroxidation (chain reaction) | Membrane damage, loss of fluidity, generation of reactive aldehydes (4-HNE, MDA) |
| **Proteins** | Oxidation of amino acids (cysteine, methionine), carbonyl formation | Enzyme inactivation, protein aggregation, cross-linking |
| **DNA** | Strand breaks, base modifications (8-oxo-dG) | Mutagenesis, carcinogenesis, mitochondrial DNA damage |
| **Carbohydrates** | Glycosylation, fragmentation | Altered function |

**Diseases associated with oxidative stress**:
- Neurodegenerative (Alzheimer's, Parkinson's, ALS)
- Cardiovascular (atherosclerosis, heart failure)
- Ischemia-reperfusion injury
- Inflammatory diseases
- Diabetes complications
- Aging
- Cancer

---

### 6. Antioxidant Defense Systems

Cells have multiple antioxidant mechanisms to neutralize ROS.

#### 6.1 Enzymatic Antioxidants

| Enzyme | Reaction | Location | Cofactor |
|--------|----------|----------|----------|
| **Superoxide dismutase (SOD)** | 2 O₂•⁻ + 2 H⁺ → H₂O₂ + O₂ | Cu,Zn-SOD (cytosol); Mn-SOD (mitochondria) | Cu, Zn, or Mn |
| **Catalase** | 2 H₂O₂ → 2 H₂O + O₂ | Peroxisomes | Heme |
| **Glutathione peroxidase (GPx)** | H₂O₂ + 2 GSH → 2 H₂O + GSSG | Cytosol, mitochondria | Selenium (selenocysteine) |
| **Glutathione reductase (GR)** | GSSG + NADPH + H⁺ → 2 GSH + NADP⁺ | Cytosol, mitochondria | FAD |
| **Peroxiredoxins (Prx)** | H₂O₂ + (SH)₂ → 2 H₂O + S–S | Cytosol, mitochondria, nucleus | Thioredoxin system |
| **Thioredoxin reductase (TrxR)** | Thioredoxin (oxidized) + NADPH → thioredoxin (reduced) | Cytosol, mitochondria | Selenium, FAD |
| **Heme oxygenase-1 (HO-1)** | Heme → biliverdin + CO + Fe²⁺ | Cytosol | Inducible by stress |

#### 6.2 Non-Enzymatic Antioxidants

| Antioxidant | Source | Mechanism |
|-------------|--------|-----------|
| **Glutathione (GSH)** | Synthesized in cells | Thiol donor; substrate for GPx and GST; directly scavenges ROS |
| **Vitamin E (α-tocopherol)** | Dietary (plant oils) | Lipid-soluble; breaks chain of lipid peroxidation in membranes |
| **Vitamin C (ascorbate)** | Dietary (fruits, vegetables) | Water-soluble; directly scavenges ROS; regenerates vitamin E |
| **β-Carotene** | Dietary (carrots, leafy greens) | Quenches singlet oxygen |
| **Uric acid** | Purine metabolism | Scavenges ROS; major antioxidant in plasma |
| **Coenzyme Q10 (ubiquinol)** | Endogenous synthesis, diet | Lipid-soluble; in mitochondria, regenerates vitamin E; electron carrier |
| **Bilirubin** | Heme degradation | Antioxidant at low concentrations |
| **Melatonin** | Pineal gland, diet | Direct scavenger; stimulates antioxidant enzymes |
| **Flavonoids, polyphenols** | Plant-based diet | Multiple mechanisms (direct scavenging, metal chelation, enzyme modulation) |

#### 6.3 The Glutathione System

Glutathione (γ-glutamylcysteinylglycine) is the most abundant intracellular thiol. Its reduced form (GSH) maintains redox balance.

**Cycle**:
- GSH + ROS → GSSG (via GPx or direct reaction)
- GSSG + NADPH → 2 GSH (via glutathione reductase)
- NADPH is supplied mainly by pentose phosphate pathway (G6PD)

**Importance in drug metabolism**: Glutathione S-transferases (GST) conjugate GSH to electrophilic xenobiotics (detoxification). Depletion of GSH (e.g., by acetaminophen overdose) leads to oxidative damage and hepatotoxicity.

#### 6.4 Antioxidant Therapeutic Strategies

- **N-Acetylcysteine (NAC)** : Replenishes GSH; used in acetaminophen overdose, chronic obstructive pulmonary disease, etc.
- **Edaravone**: Free radical scavenger; used in ALS, stroke.
- **Vitamin E**: Used in some neurodegenerative conditions; controversial efficacy.
- **Coenzyme Q10**: Supplement in mitochondrial diseases, statin-induced myopathy.
- **Mitochondria-targeted antioxidants** (e.g., MitoQ, MitoTEMPO) – experimental.

---

### 7. Summary Tables

#### Table 1: ETC Complexes and Inhibitors

| Complex | Name | Substrates → Products | Proton Pumping | Inhibitors |
|---------|------|------------------------|----------------|------------|
| I | NADH dehydrogenase | NADH → Q | 4 H⁺ | Rotenone, amytal |
| II | Succinate dehydrogenase | Succinate → Q | 0 | Malonate |
| III | Cytochrome bc₁ | QH₂ → cyt c | 4 H⁺ | Antimycin A, myxothiazol |
| IV | Cytochrome c oxidase | cyt c → O₂ | 4 H⁺ | CN⁻, CO, N₃⁻ |
| V | ATP synthase | ADP + Pi → ATP | (uses gradient) | Oligomycin |

#### Table 2: ROS and Antioxidant Defenses

| ROS | Primary Sources | Scavenging Enzymes | Non-Enzymatic Scavengers |
|-----|-----------------|---------------------|---------------------------|
| O₂•⁻ | ETC, NADPH oxidase, xanthine oxidase | SOD | Vitamin C, GSH |
| H₂O₂ | SOD, oxidases | Catalase, GPx, Prx | GSH, vitamin C |
| •OH | Fenton reaction (Fe²⁺ + H₂O₂) | None (direct scavengers limited) | Mannitol, DMSO (weak) |
| Lipid peroxides | Lipid peroxidation chain | GPx, glutathione S-transferase | Vitamin E, coenzyme Q10 |

#### Table 3: Clinical Conditions Associated with ETC/ROS

| Condition | Mechanism | Examples |
|-----------|-----------|----------|
| Mitochondrial diseases | Genetic defects in ETC subunits or assembly factors | MELAS, MERRF, Leigh syndrome |
| Drug-induced mitochondrial toxicity | Inhibition of ETC, mtDNA depletion, uncoupling | NRTIs, doxorubicin, valproate |
| Ischemia-reperfusion injury | ROS burst upon reoxygenation | Myocardial infarction, stroke |
| Neurodegeneration | Oxidative stress, mitochondrial dysfunction | Parkinson's, Alzheimer's, ALS |
| Aging | Accumulation of oxidative damage | Mitochondrial theory of aging |
| Metabolic diseases | ROS-induced insulin resistance | Type 2 diabetes |

---

### References

1. Lippincott Williams & Wilkins. (2020). *Lippincott's illustrated reviews: Biochemistry*. (Chapters on Bioenergetics, ETC, and Oxidative Phosphorylation)

2. Berg, J. M., Tymoczko, J. L., & Gatto, G. J. (2019). *Stryer's biochemistry* (8th ed.). W. H. Freeman and Company. (Chapters on Oxidative Phosphorylation and Reactive Oxygen Species)

3. Nelson, D. L., & Cox, M. M. (2017). *Lehninger principles of biochemistry* (7th ed.). W. H. Freeman and Company. (Chapters on Electron Transport and Oxidative Phosphorylation)

4. Rodwell, V. W., Bender, D. A., Botham, K. M., Kennelly, P. J., & Weil, P. A. (2017). *Harper's illustrated biochemistry* (31st ed.). McGraw-Hill Education. (Chapters on Biological Oxidations and Antioxidants)

5. Devlin, T. M. (2016). *Textbook of biochemistry with clinical correlations* (8th ed.). Wiley-Liss. (Chapters on Bioenergetics and Mitochondrial Function)

6. Halliwell, B., & Gutteridge, J. M. C. (2015). *Free radicals in biology and medicine* (5th ed.). Oxford University Press. (Comprehensive coverage of ROS and antioxidants)

7. DiMauro, S., & Schon, E. A. (2003). Mitochondrial respiratory-chain diseases. *New England Journal of Medicine*, 348(26), 2656–2668.

8. Wallace, D. C. (2005). A mitochondrial paradigm of metabolic and degenerative diseases, aging, and cancer: A dawn for evolutionary medicine. *Annual Review of Genetics*, 39, 359–407.

9. Dykens, J. A., & Will, Y. (2007). The significance of mitochondrial toxicity testing in drug development. *Drug Discovery Today*, 12(17-18), 777–785.

---

**Recommended Textbooks for Further Reading:**
- Lippincott Williams & Wilkins. (2020). *Lippincott's illustrated reviews: Biochemistry*. (Excellent for visual summaries and clinical notes)
- Nelson, D. L., & Cox, M. M. (2017). *Lehninger principles of biochemistry* (7th ed.). (Detailed mechanistic explanations)
- Halliwell, B., & Gutteridge, J. M. C. (2015). *Free radicals in biology and medicine* (5th ed.). (Definitive text on oxidative stress)

