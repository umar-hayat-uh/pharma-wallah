## Unit 4: Stereochemistry

### Introduction to Stereochemistry

Stereochemistry is the branch of chemistry concerned with the three-dimensional arrangement of atoms in molecules and the effects of these arrangements on chemical and physical properties. In pharmaceutical sciences, stereochemistry is of paramount importance because biological systems are inherently chiral and often discriminate between stereoisomers. The different spatial arrangements of a drug molecule can result in profound differences in pharmacological activity, toxicity, metabolism, and pharmacokinetics.

**Key Definitions**:

| Term | Definition |
|------|------------|
| Isomerism | Phenomenon where two or more compounds have the same molecular formula but different structures or spatial arrangements |
| Constitutional isomers | Same molecular formula but different connectivity of atoms |
| Stereoisomers | Same molecular formula and connectivity but different spatial arrangement |
| Enantiomers | Stereoisomers that are non-superimposable mirror images |
| Diastereomers | Stereoisomers that are not mirror images of each other |
| Chiral | A molecule that is not superimposable on its mirror image |
| Achiral | A molecule that is superimposable on its mirror image |
| Racemic mixture | Equal mixture of two enantiomers, optically inactive |

---

### 1. Isomerism: An Overview

```
                    ISOMERS
                        |
        +---------------+---------------+
        |                               |
Constitutional                    Stereoisomers
   Isomers                              |
 (Structural)                +----------+----------+
                             |                     |
                        Configurational     Conformational
                        Isomers             Isomers
                             |
                 +-----------+-----------+
                 |                       |
          Optical Isomers         Geometrical Isomers
          (Enantiomers)           (cis/trans, E/Z)
```

---

### 2. Optical Isomerism and Chirality

#### 2.1 Chirality

A molecule is chiral if it is not superimposable on its mirror image. The most common cause of chirality is the presence of a stereogenic center (chiral center)—an atom (usually carbon) bonded to four different substituents.

**Criteria for Chirality**:
- Presence of a stereogenic center (asymmetric atom)
- No plane of symmetry
- No center of inversion
- No improper rotation axis

**Examples**:
- Lactic acid (CH₃–CHOH–COOH) has a chiral carbon (the central carbon attached to H, OH, CH₃, and COOH).
- Amino acids (except glycine) are chiral.

#### 2.2 Optical Activity

Chiral molecules rotate the plane of polarized light. This property is called optical activity.

| Term | Definition |
|------|------------|
| Dextrorotatory (+) | Rotates plane of polarized light to the right (clockwise) |
| Levorotatory (-) | Rotates plane of polarized light to the left (counterclockwise) |
| Specific rotation [α] | α / (l × c) where α = observed rotation, l = path length (dm), c = concentration (g/mL) |
| Racemic mixture | Equal amounts of (+) and (-) enantiomers; no net optical rotation |

#### 2.3 Enantiomers

Enantiomers are pairs of stereoisomers that are non-superimposable mirror images. They have identical physical properties (melting point, boiling point, solubility in achiral solvents) but differ in their interaction with plane-polarized light and with other chiral entities.

**Properties of Enantiomers**:

| Property | Enantiomers |
|----------|-------------|
| Melting point | Same |
| Boiling point | Same |
| Solubility (achiral solvent) | Same |
| Solubility (chiral solvent) | Different |
| NMR spectrum (achiral environment) | Same |
| NMR spectrum (chiral shift reagent) | Different |
| Reaction with achiral reagents | Same rate |
| Reaction with chiral reagents | Different rates |
| Biological activity | Often different |

#### 2.4 Diastereomers

Diastereomers are stereoisomers that are not mirror images of each other. They occur when a molecule has two or more stereogenic centers. Unlike enantiomers, diastereomers have different physical and chemical properties.

**Properties of Diastereomers**:
- Different melting points, boiling points, solubilities
- Can be separated by conventional methods (chromatography, crystallization)
- Different NMR spectra even in achiral environments
- Different reaction rates with both chiral and achiral reagents

**Example**: Tartaric acid has two chiral centers, giving three stereoisomers: (R,R), (S,S) (enantiomers), and (R,S) (meso compound, which is achiral due to internal plane of symmetry). (R,R) and (R,S) are diastereomers.

#### 2.5 Meso Compounds

A meso compound is an achiral compound that possesses chiral centers but also has an internal plane of symmetry. It is superimposable on its mirror image and therefore optically inactive.

**Example**: (R,S)-tartaric acid (meso) has a plane of symmetry through the C2–C3 bond.

#### 2.6 Racemic Mixtures and Racemates

A racemic mixture (racemate) contains equal amounts of two enantiomers and is optically inactive. Racemates can exist as:
- **Racemic conglomerates**: Physical mixture of enantiomer crystals; can be separated mechanically.
- **Racemic compounds**: Homogeneous crystalline phase containing both enantiomers in equal amounts in the crystal lattice.
- **Pseudoracemates**: Solid solutions of enantiomers.

---

### 3. Nomenclature of Stereoisomers

#### 3.1 D/L System (Relative Configuration)

The D/L system is based on the configuration relative to glyceraldehyde. It is still used for sugars and amino acids.

- **D-glyceraldehyde**: OH on the right in Fischer projection
- **L-glyceraldehyde**: OH on the left in Fischer projection

For amino acids, the standard is based on serine or alanine. Most naturally occurring amino acids are L (S configuration for most, but note that cysteine is D due to priority rules).

**Limitations**: The D/L system is ambiguous for molecules with multiple chiral centers and does not indicate absolute configuration.

#### 3.2 R/S System (Absolute Configuration) – Cahn-Ingold-Prelog Rules

The R/S system unambiguously describes the absolute configuration of a chiral center.

**Sequence Rules**:
1. Assign priorities to the four substituents based on atomic number (higher atomic number gets higher priority).
2. If the first atom is the same, move to the next atom until a difference is found.
3. Multiple bonds are treated as if each bond is duplicated (e.g., C=O is treated as C bonded to O, O, and the other atom).
4. Orient the molecule so that the lowest priority group (4) is pointing away from you.
5. Determine the order of priorities 1 → 2 → 3:
   - If the sequence is clockwise → **R** (from Latin *rectus*)
   - If the sequence is counterclockwise → **S** (from Latin *sinister*)

**Examples**:
- Lactic acid: (R)-lactic acid or (S)-lactic acid depending on enantiomer.
- Thalidomide: (R)-thalidomide is sedative; (S)-thalidomide is teratogenic.

---

### 4. Geometrical Isomerism

Geometrical isomerism arises from restricted rotation around a bond, typically a double bond or a ring structure.

#### 4.1 Cis-Trans Isomerism in Alkenes

- **Cis**: Similar groups on the same side of the double bond
- **Trans**: Similar groups on opposite sides of the double bond

**Limitation**: The cis/trans system is ambiguous when there are more than two different substituents.

#### 4.2 E/Z System (Cahn-Ingold-Prelog for Double Bonds)

The E/Z system is based on priority rules applied to each end of the double bond.

- **E** (from German *entgegen*): opposite – the two higher priority groups are on opposite sides.
- **Z** (from German *zusammen*): together – the two higher priority groups are on the same side.

**Procedure**:
1. Assign priorities to the two substituents on each carbon of the double bond using the same rules as for chiral centers.
2. Compare the two higher priority groups (one from each carbon).
3. If they are on the same side → Z; if on opposite sides → E.

**Example**: (Z)- and (E)-1,2-dichloroethene.

#### 4.3 Geometrical Isomerism in Cyclic Compounds

Cyclic compounds also exhibit cis-trans isomerism when substituents are attached to a ring.

- **Cis**: Substituents on the same side of the ring plane
- **Trans**: Substituents on opposite sides of the ring plane

---

### 5. Projection Formulas

#### 5.1 Fischer Projections

**Rules**:
- Carbon chain is drawn vertically with the most oxidized group at the top (for sugars, aldehydes; for amino acids, carboxylic acid at top).
- Horizontal bonds project out of the plane (toward the viewer).
- Vertical bonds project behind the plane (away from the viewer).
- Intersections represent chiral carbon atoms.

**Interconversion Rules**:
- Rotation by 180° in the plane is allowed (retains configuration).
- Swapping any two groups inverts configuration (enantiomer).
- Swapping three groups (cyclic permutation) retains configuration.

#### 5.2 Newman Projections

Newman projections visualize conformations by looking along a specific carbon-carbon bond.

- **Front carbon** is represented by a dot with three bonds at 120°.
- **Back carbon** is represented by a circle with three bonds at 120°.
- Torsional (dihedral) angle is the angle between bonds on front and back carbons.

**Types of Conformations in Ethane**:
- **Eclipsed**: Torsional angle 0° (or 120°, etc.) – bonds align, higher energy.
- **Staggered**: Torsional angle 60° – bonds alternate, lower energy.

#### 5.3 Sawhorse Projections

Sawhorse projections show the carbon-carbon bond from an oblique angle, with both carbons visible and bonds drawn as lines.

- They are useful for visualizing steric interactions in staggered and eclipsed conformations.
- Can be interconverted with Newman projections by changing viewpoint.

#### 5.4 Comparison of Projection Formulas

| Projection | Usage | Advantages | Limitations |
|------------|-------|------------|-------------|
| Fischer | Sugars, amino acids | Easy to draw, shows configuration | Not good for conformation |
| Newman | Conformational analysis | Clear view of torsional angles | Only one bond at a time |
| Sawhorse | 3D visualization | Shows both carbons, good for stereochemistry | Can be cluttered |

---

### 6. Resolution of Racemic Mixtures

Since enantiomers have identical properties in achiral environments, they cannot be separated by conventional methods. Resolution is the process of separating a racemic mixture into its individual enantiomers.

#### 6.1 Methods of Resolution

| Method | Principle | Example |
|--------|-----------|---------|
| **Mechanical separation** | Physical separation of enantiomorphous crystals (Pasteur's method) | Sodium ammonium tartrate (Pasteur, 1848) |
| **Preferential crystallization** | Seeding a supersaturated racemic solution with one enantiomer causes it to crystallize | Used industrially for some compounds |
| **Formation of diastereomers** | Reaction with a chiral resolving agent to form diastereomeric derivatives, which have different physical properties and can be separated by chromatography or crystallization | Classic method: use of chiral acids or bases |
| **Chromatography on chiral stationary phases** | Direct separation using HPLC or GC with chiral columns | Modern method for analytical and preparative scale |
| **Enzymatic resolution** | Enzymes selectively react with one enantiomer (kinetic resolution) | Lipases, esterases |
| **Kinetic resolution** | Use of chiral catalysts or reagents that react at different rates with enantiomers | Asymmetric synthesis |

#### 6.2 Example of Diastereomeric Resolution

A racemic mixture of a chiral acid can be treated with a chiral base (e.g., brucine, quinine, or a synthetic amine) to form two diastereomeric salts. These salts have different solubilities and can be separated by fractional crystallization. After separation, the pure enantiomer is recovered by acidification.

---

### 7. Conformational Analysis

Conformational analysis studies the different spatial arrangements of atoms that result from rotation about single bonds. Conformations are rapidly interconverting at room temperature and are not isolable isomers.

#### 7.1 Conformations of Acyclic Compounds

**Ethane**:
- **Staggered conformation**: Torsional angle 60°, most stable (0 kcal/mol relative).
- **Eclipsed conformation**: Torsional angle 0°, less stable by ~12 kJ/mol (3.0 kcal/mol) due to torsional strain.

**Butane**:
- **Anti conformation**: CH₃ groups 180° apart – most stable.
- **Gauche conformation**: CH₃ groups 60° apart – less stable by ~3.8 kJ/mol due to steric strain.
- **Eclipsed conformations**: Higher energy.

**Energy diagram for butane** shows minima at anti and gauche, maxima at eclipsed forms.

#### 7.2 Conformations of Cyclic Compounds

**Cyclohexane**:
- **Chair conformation**: Most stable; all bonds staggered, no angle strain.
- **Boat conformation**: Less stable due to steric hindrance (flagpole interactions) and torsional strain.
- **Twist-boat**: Slightly more stable than boat, intermediate between boat and chair.
- **Half-chair**: Transition state between chair and twist-boat.

**Chair Conformation Features**:
- Axial bonds: parallel to the axis of the ring (alternating up and down).
- Equatorial bonds: oriented outward, approximately in the plane of the ring.
- Ring flip interconverts axial and equatorial positions.

**Monosubstituted Cyclohexanes**:
- Substituents prefer equatorial position to avoid 1,3-diaxial interactions.
- **A-value**: The free energy difference between axial and equatorial conformations. Larger substituents have larger A-values.

| Substituent | A-value (kcal/mol) |
|-------------|---------------------|
| H | 0 |
| CH₃ | 1.7 |
| C₂H₅ | 1.8 |
| i-Pr | 2.1 |
| t-Bu | >4.5 (essentially locked equatorial) |
| OH | 0.5-1.0 (H-bonding effects) |
| Cl | 0.5 |

**Disubstituted Cyclohexanes**:
- **Cis-1,2**: one axial, one equatorial (or both equatorial after ring flip? Actually cis-1,2 can have both equatorial only if the ring is flipped? Wait: For cis-1,2, the substituents are either both axial or both equatorial? Let's recall: In a chair, adjacent carbons have one axial and one equatorial if they are on opposite sides. For cis-1,2-disubstituted, the two substituents are either both axial or both equatorial. For trans-1,2, one axial one equatorial. Correct.
- **Trans-1,2**: one axial, one equatorial.
- **Cis-1,3**: both equatorial (most stable) or both axial.
- **Trans-1,3**: one axial, one equatorial.
- **Cis-1,4**: one axial, one equatorial.
- **Trans-1,4**: both equatorial or both axial (but both equatorial is favored).

**Decalins (bicyclic systems)**:
- **trans-Decalin**: Both rings fused in trans configuration (more stable).
- **cis-Decalin**: Rings fused cis (less stable, can flip).

---

### 8. Applications of Stereochemistry in Pharmacy

#### 8.1 Importance of Chirality in Drug Action

Biological receptors, enzymes, and other targets are chiral. Therefore, enantiomers of a drug often exhibit different:

- **Pharmacodynamics**: Binding affinity, efficacy, selectivity
- **Pharmacokinetics**: Absorption, distribution, metabolism, excretion
- **Toxicology**: Side effects, toxicity

**Examples**:

| Drug | Enantiomer Difference | Clinical Significance |
|------|----------------------|----------------------|
| **Thalidomide** | (R)-form: sedative; (S)-form: teratogenic | Tragedy led to stricter regulations; now used with caution |
| **Ibuprofen** | (S)-ibuprofen is active COX inhibitor; (R)-form is inactive but can be converted in vivo | Sold as racemate; conversion varies among individuals |
| **Propranolol** | (S)-propranolol is β-blocker; (R)-form is much less active | Racemate used clinically |
| **Ketamine** | (S)-ketamine is more potent anesthetic and antidepressant | (S)-enantiomer (esketamine) approved for depression |
| **Omeprazole** | Racemic mixture; (S)-omeprazole (esomeprazole) has improved pharmacokinetics | Esomeprazole marketed for better efficacy |
| **Levodopa** | (S)-DOPA (L-DOPA) is active against Parkinson's; (R)-form is inactive and may cause side effects | Pure L-DOPA used |
| **Ethambutol** | (S,S)-enantiomer is antitubercular; (R,R)-form causes blindness | Used as pure (S,S) |
| **Citalopram** | (S)-citalopram (escitalopram) is the active antidepressant; racemate also used | Escitalopram marketed as improved version |

#### 8.2 Stereochemistry in Drug Development

- **Chiral switching**: Replacing a racemate with a single enantiomer to improve efficacy, safety, or pharmacokinetics (e.g., esomeprazole, levosalbutamol, escitalopram).
- **Regulatory requirements**: Increasingly, regulatory agencies (FDA, EMA) require characterization of stereoisomers and justification for racemate vs. single enantiomer.
- **Asymmetric synthesis**: Development of methods to produce enantiomerically pure drugs.

#### 8.3 Stereochemistry in Pharmacokinetics

- **Absorption**: Transporters and passive diffusion may be stereoselective.
- **Distribution**: Binding to plasma proteins (e.g., albumin) can be stereoselective.
- **Metabolism**: Enzymes (CYP450, esterases, transferases) often show stereoselectivity, leading to different metabolic rates and pathways for enantiomers.
- **Excretion**: Renal transporters may discriminate between enantiomers.

#### 8.4 Stereochemistry in Drug-Receptor Interactions

The three-point interaction model explains enantioselectivity: a chiral receptor site interacts with a drug molecule at three attachment points. Only one enantiomer can align all three interactions optimally, leading to higher affinity.

#### 8.5 Stereochemistry in Natural Products

Many natural products (alkaloids, antibiotics, steroids) are enantiomerically pure and their biological activity depends on absolute configuration.

| Natural Product | Stereochemical Feature |
|-----------------|------------------------|
| Morphine | Multiple chiral centers; specific configuration essential for opioid activity |
| Penicillins | Chiral centers in β-lactam ring and side chain |
| Quinine | Chiral centers crucial for antimalarial activity |
| Taxol | Complex stereochemistry essential for anticancer activity |

#### 8.6 Stereochemistry in Formulation and Stability

- **Polymorphism and chirality**: Different crystalline forms of enantiomers and racemates can affect solubility, stability, and bioavailability.
- **Racemization**: Some chiral drugs may racemize during storage or in vivo, affecting potency and safety.

---

### Summary Tables

#### Table 1: Comparison of Enantiomers and Diastereomers

| Property | Enantiomers | Diastereomers |
|----------|-------------|---------------|
| Mirror images | Yes | No |
| Physical properties | Identical (in achiral environment) | Different |
| Optical activity | Equal magnitude, opposite sign | Different |
| Separation | Requires chiral environment | Conventional methods |
| NMR (achiral) | Identical | Different |
| Reaction with achiral reagents | Same rate | Different rates |
| Biological activity | Often different | Usually different |

#### Table 2: R/S Nomenclature Rules Summary

| Step | Action |
|------|--------|
| 1 | Assign priority to each substituent based on atomic number (higher atomic number = higher priority) |
| 2 | If tie, move to next atom along the chain |
| 3 | Treat multiple bonds as if each bond is duplicated |
| 4 | Orient molecule so lowest priority group (4) points away |
| 5 | Trace path 1→2→3; if clockwise = R, counterclockwise = S |

#### Table 3: Comparison of Projection Formulas

| Feature | Fischer | Newman | Sawhorse |
|---------|---------|--------|----------|
| View direction | Not along a bond | Along C–C bond | Oblique |
| Representation of bonds | Cross with chiral center | Dot and circle | Lines from both carbons |
| Best for | Configurational analysis | Conformational analysis | 3D visualization |
| Interconversion | Can be rotated 180° | Can be rotated 60° | Can be converted to Newman |

#### Table 4: Conformational Energies (Approximate)

| Interaction | Energy (kcal/mol) |
|-------------|-------------------|
| Ethane eclipsed | 3.0 |
| Butane eclipsed (CH₃/CH₃) | 4-5 |
| Gauche butane | 0.9 |
| 1,3-Diaxial interaction (CH₃) | 1.7 per CH₃ |
| Ring flip barrier for cyclohexane | ~10 |

#### Table 5: A-Values of Common Substituents

| Substituent | A-value (kcal/mol) |
|-------------|---------------------|
| H | 0 |
| F | 0.15 |
| Cl | 0.5 |
| Br | 0.5 |
| I | 0.5 |
| OH | 0.5-1.0 (H-bond dependent) |
| OCH₃ | 0.6 |
| CH₃ | 1.7 |
| C₂H₅ | 1.8 |
| CH(CH₃)₂ | 2.1 |
| C(CH₃)₃ | >4.5 |

---

### References

1. Brown, W. H., & Bursten, M. L. (2014). *Introduction to organic chemistry* (8th ed.). Wiley. (Chapter on Stereochemistry)

2. Vollhardt, K. P. C., & Schore, N. E. (2014). *Organic chemistry: Structure and function* (7th ed.). W. H. Freeman and Company. (Chapter 4: Stereochemistry)

3. Carey, F. A. (2007). *Advanced organic chemistry: Part A: Structure and mechanisms* (5th ed.). Wiley. (Chapters on Stereochemistry and Conformational Analysis)

4. Silverman, R. B. (2014). *The organic chemistry of drug design and drug action* (2nd ed.). Academic Press. (Chapter 2: Drug Discovery and Development, including stereochemical considerations)

5. Lemke, T. L., & Williams, D. A. (2013). *Foye's principles of medicinal chemistry* (7th ed.). Lippincott Williams & Wilkins. (Chapter 3: Stereochemistry and Drug Action)

6. Eliel, E. L., Wilen, S. H., & Doyle, M. P. (2001). *Basic organic stereochemistry*. Wiley-Interscience. (Comprehensive reference)

7. Clayden, J., Greeves, N., & Warren, S. (2012). *Organic chemistry* (2nd ed.). Oxford University Press. (Chapters on Stereochemistry)

8. Patrick, G. L. (2013). *An introduction to medicinal chemistry* (5th ed.). Oxford University Press. (Chapter 5: Chirality and Drug Action)

9. Smith, M. B., & March, J. (2007). *March's advanced organic chemistry: Reactions, mechanisms, and structure* (6th ed.). Wiley. (Chapter on Stereochemistry)

10. Solomons, T. W. G., & Fryhle, C. B. (2011). *Organic chemistry* (10th ed.). Wiley. (Chapters on Stereochemistry)

---

**Recommended Textbooks for Further Reading:**
- Brown, W. H., & Bursten, M. L. (2014). *Introduction to organic chemistry* (8th ed.). Wiley. (Accessible introduction)
- Vollhardt, K. P. C., & Schore, N. E. (2014). *Organic chemistry: Structure and function* (7th ed.). W. H. Freeman and Company. (Excellent coverage of stereochemistry)
- Eliel, E. L., Wilen, S. H., & Doyle, M. P. (2001). *Basic organic stereochemistry*. Wiley-Interscience. (Definitive text on stereochemistry)
- Lemke, T. L., & Williams, D. A. (2013). *Foye's principles of medicinal chemistry* (7th ed.). Lippincott Williams & Wilkins. (Connects stereochemistry to drug action)

