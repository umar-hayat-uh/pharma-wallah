import { TEAM_AUTHOR } from "@/lib/content/governance";
import type { Guide } from "@/lib/guides/types";

/*
 * DRAFT. Every number below was recomputed in Python on 2026-10-13 with the
 * same arithmetic as src/components/calculators/hemocytometer.ts
 * (count = N × dilution ÷ (squares × area × depth)). Cell counts are invented
 * for teaching. No population reference interval is stated as fact: the guide
 * sends students to their laboratory's own interval.
 */

export const guide: Guide = {
  slug: "blood-cell-counts-with-a-haemocytometer",
  title: "Blood Cell Counts with a Haemocytometer: RBC and WBC Calculations",
  description:
    "How the improved Neubauer chamber turns cells counted into cells per mm³: area, depth, dilution, the WBC and RBC factors, SI units and counting error.",
  category: "Physiology",
  objectives: [
    "Describe the improved Neubauer ruling and calculate the volume over any set of squares.",
    "Calculate a total WBC count and a total RBC count from cells counted, squares, depth and dilution.",
    "Derive the familiar factors (50 for WBC, 10 000 for RBC) instead of memorising them.",
    "Convert counts between cells/mm³, cells/µL and the SI units ×10⁹/L and ×10¹²/L.",
    "Estimate the counting error from the number of cells counted, and say how to reduce it.",
  ],
  intro: [
    "Automated analysers now count blood cells in most hospital laboratories, but the manual count with a haemocytometer is still a core physiology practical, and for good reason. It shows exactly what a 'count' is: the number of cells found in a tiny, known volume of diluted blood, scaled up to a standard volume.",
    "The calculation has only three ingredients: how many cells you counted, the volume of chamber they were in, and how much the blood was diluted. Every factor printed in a lab manual — 50 for white cells, 10 000 for red cells — is just those ingredients multiplied together for one standard counting method. If you understand where they come from, you can handle any variation your manual or demonstrator throws at you.",
    "All counts in this guide are invented for teaching. Whether a result is high, low or normal depends on the reference interval of the laboratory that produced it, which varies with age, sex, altitude, population and method; this guide does not give one as a rule.",
  ],
  terms: [
    { term: "Haemocytometer", definition: "A thick glass slide with a ruled counting area and a precisely ground depth beneath a special coverslip, used to count cells in a known volume." },
    { term: "Improved Neubauer ruling", definition: "The common ruling: a 3 mm × 3 mm area divided into nine large squares of 1 mm², the central one divided into 25 medium squares, each of those into 16 smallest squares." },
    { term: "Chamber depth", definition: "The gap between the ruled floor and the coverslip: 0.1 mm for the improved Neubauer chamber when the coverslip is correctly seated." },
    { term: "Dilution factor", definition: "Final volume ÷ volume of blood. A 1 in 20 (1:20) dilution has a factor of 20." },
    { term: "Türk's fluid", definition: "A WBC diluting fluid: dilute acetic acid lyses red cells, and gentian violet stains white-cell nuclei." },
    { term: "Hayem's fluid", definition: "An isotonic RBC diluting fluid that preserves red cells for counting." },
    { term: "Chamber factor", definition: "Dilution ÷ volume counted (mm³). Cells counted × factor = cells per mm³ of blood." },
    { term: "mm³ and µL", definition: "The same volume: 1 mm³ = 1 µL. Cells/mm³ and cells/µL are therefore the same number." },
  ],
  sections: [
    {
      id: "principle",
      heading: "The principle: cells in a known volume",
      blocks: [
        {
          kind: "p",
          text: "Blood contains millions of red cells and thousands of white cells in every cubic millimetre, far too many to count directly. So it is diluted by a known factor, a drop is run under the coverslip of the chamber, and the cells lying over a ruled area are counted under the microscope. The ruled area times the chamber depth is the volume you looked at. Divide the cells by that volume to get cells per mm³ of diluted sample, then multiply by the dilution to get back to undiluted blood.",
        },
        {
          kind: "formula",
          expr: "Count (cells/mm³) = N × D ÷ V     V = squares counted × area of one square × depth",
          where: [
            { sym: "N", meaning: "total number of cells counted in all the squares" },
            { sym: "D", meaning: "dilution factor (20 for 1:20)" },
            { sym: "V", meaning: "volume counted, mm³" },
            { sym: "area of one square", meaning: "mm²; 1 for a large square, 0.04 for a medium square, 0.0025 for a smallest square" },
            { sym: "depth", meaning: "chamber depth, mm; 0.1 for the improved Neubauer chamber" },
          ],
          note: "D ÷ V is the chamber factor. Multiplying N by it gives the same answer in one step.",
        },
        {
          kind: "table",
          caption: "Improved Neubauer ruling: the squares and the volumes over them (depth 0.1 mm)",
          head: ["Squares counted", "Area counted (mm²)", "Volume counted (mm³)", "Usually used for"],
          rows: [
            ["1 large square (1 mm × 1 mm)", "1", "0.1", "—"],
            ["4 corner large squares", "4", "0.4", "WBC count"],
            ["5 medium squares (0.2 mm × 0.2 mm each)", "0.2", "0.02", "RBC count"],
            ["80 smallest squares (0.05 mm × 0.05 mm each)", "0.2", "0.02", "RBC count (the same 5 medium squares, counted in small units)"],
            ["All 9 large squares", "9", "0.9", "Low WBC counts, if the manual allows"],
          ],
        },
      ],
    },
    {
      id: "wbc-count",
      heading: "The total WBC count",
      blocks: [
        {
          kind: "p",
          text: "White cells are diluted only moderately, typically 1 in 20 in Türk's fluid, which destroys the red cells so they do not hide the white ones. Because white cells are relatively few, a large area is counted: the four large corner squares.",
        },
        {
          kind: "formula",
          expr: "Factor = 20 ÷ (4 × 1 mm² × 0.1 mm) = 20 ÷ 0.4 mm³ = 50     WBC/mm³ = N × 50",
          note: "The factor of 50 is correct only for 4 large squares, a 1:20 dilution and a 0.1 mm chamber. Change any of these and recalculate it.",
        },
        {
          kind: "example",
          title: "Standard WBC count",
          problem:
            "Blood is diluted 1 in 20 in Türk's fluid. The four corner large squares contain 38, 35, 40 and 37 white cells. Calculate the total WBC count and express it in SI units.",
          steps: [
            "N = 38 + 35 + 40 + 37 = 150 cells.",
            "V = 4 × 1 mm² × 0.1 mm = 0.4 mm³.",
            "Count = 150 × 20 ÷ 0.4 = 7500 cells/mm³ (= 150 × 50).",
            "In SI units: 7500 cells/µL × 10⁶ µL/L = 7.5 × 10⁹ cells/L.",
          ],
          answer: "7500 cells/mm³, which is 7.5 × 10⁹/L.",
          note: "The four squares agree closely (35–40), which suggests the chamber filled evenly. A square far out of line with the others points to a filling or mixing problem.",
        },
        {
          kind: "example",
          title: "A non-standard WBC method",
          problem:
            "A sample with a low count is diluted 1 in 10 and all nine large squares are counted, giving 212 cells. Calculate the WBC count.",
          steps: [
            "V = 9 × 1 mm² × 0.1 mm = 0.9 mm³.",
            "Factor = 10 ÷ 0.9 = 11.11.",
            "Count = 212 × 10 ÷ 0.9 = 2356 cells/mm³.",
          ],
          answer: "About 2360 cells/mm³ (2.36 × 10⁹/L).",
          note: "Using the usual factor of 50 here would give 10 600 — more than four times too high. The factor belongs to the method, not to the cell type.",
        },
      ],
    },
    {
      id: "rbc-count",
      heading: "The total RBC count",
      blocks: [
        {
          kind: "p",
          text: "Red cells outnumber white cells by several hundred to one, so the blood is diluted much more (commonly 1 in 200 in Hayem's fluid) and a much smaller area is counted: five medium squares of the central large square, usually the four corners and the centre one.",
        },
        {
          kind: "formula",
          expr: "Factor = 200 ÷ (5 × 0.04 mm² × 0.1 mm) = 200 ÷ 0.02 mm³ = 10 000     RBC/mm³ = N × 10 000",
          note: "If your manual uses a 1:100 dilution with the same five squares, the factor is 5000.",
        },
        {
          kind: "example",
          title: "Standard RBC count",
          problem:
            "Blood is diluted 1 in 200 in Hayem's fluid. A total of 480 red cells are counted in five medium squares. Calculate the RBC count in cells/mm³ and in SI units.",
          steps: [
            "V = 5 × 0.04 mm² × 0.1 mm = 0.02 mm³.",
            "Count = 480 × 200 ÷ 0.02 = 4 800 000 cells/mm³ (= 480 × 10 000).",
            "In millions: 4.80 × 10⁶ cells/mm³.",
            "In SI units: 4 800 000 cells/µL × 10⁶ µL/L = 4.80 × 10¹² cells/L.",
          ],
          answer: "4 800 000 cells/mm³, which is 4.80 × 10¹²/L.",
          note: "If the same cells were tallied as 80 smallest squares instead (5 groups of 16), the area is still 80 × 0.0025 = 0.2 mm², so the answer is identical.",
        },
      ],
    },
    {
      id: "units",
      heading: "Units: mm³, µL and SI",
      blocks: [
        {
          kind: "p",
          text: "Practical manuals traditionally report counts per mm³ (often written 'per cu mm'), while laboratory reports increasingly use SI units per litre. Because 1 mm³ is exactly 1 µL, and 1 L is 10⁶ µL, the conversion is a single power of ten.",
        },
        {
          kind: "formula",
          expr: "cells/L = cells/µL × 10⁶     WBC (×10⁹/L) = WBC/µL ÷ 1000     RBC (×10¹²/L) = RBC/µL ÷ 10⁶",
        },
        {
          kind: "table",
          caption: "The same results written in different units",
          head: ["Result", "cells/mm³ (= cells/µL)", "Scaled form", "SI form"],
          rows: [
            ["WBC", "7500", "7.5 × 10³/µL", "7.5 × 10⁹/L"],
            ["WBC", "5600", "5.6 × 10³/µL", "5.6 × 10⁹/L"],
            ["RBC", "4 800 000", "4.80 × 10⁶/mm³", "4.80 × 10¹²/L"],
            ["RBC", "4 250 000", "4.25 × 10⁶/mm³", "4.25 × 10¹²/L"],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Comparing with a reference interval",
          text: "To decide whether a count is high or low, compare it with the reference interval printed by the laboratory that measured it, in the same units. Intervals differ with age, sex, altitude and method, so a number memorised from one book is not a reliable yardstick for every report. In a practical, use the interval your manual gives and name its source.",
        },
      ],
    },
    {
      id: "counting-error",
      heading: "Counting error and good technique",
      blocks: [
        {
          kind: "p",
          text: "Cells settle into the squares at random, so even a perfect technique gives a count that varies from one filling to the next. For random counts the standard deviation is about the square root of the number counted, so the relative error is about 1 ÷ √N. Counting more cells is the only way to shrink it.",
        },
        {
          kind: "formula",
          expr: "Relative counting error ≈ 1 ÷ √N × 100%",
          where: [{ sym: "N", meaning: "total cells actually counted (not the final count per mm³)" }],
        },
        {
          kind: "list",
          items: [
            "150 cells counted: 1 ÷ √150 ≈ 8.2%.",
            "400 cells counted: 1 ÷ √400 = 5.0%.",
            "480 cells counted: 1 ÷ √480 ≈ 4.6%.",
            "25 cells counted: 1 ÷ √25 = 20% — too few for a useful result.",
          ],
        },
        {
          kind: "list",
          items: [
            "Count cells touching the top and left boundary lines of each square, and ignore those touching the bottom and right lines, so no cell is counted twice.",
            "Mix the diluted blood well and discard the first drops from the pipette before charging the chamber.",
            "Fill the chamber in one smooth movement; overfilling, underfilling or air bubbles change the volume.",
            "Let the cells settle for a few minutes before counting.",
            "Check that the coverslip is properly seated; a lifted coverslip increases the depth and the volume.",
          ],
        },
      ],
    },
  ],
  mistakes: [
    "Using the factor 50 or 10 000 from memory when the dilution, the number of squares or the square size is different.",
    "Entering the area of one square instead of the total area counted, or forgetting the depth, so the volume is wrong by a factor of 4, 5 or 10.",
    "Dividing by the dilution factor instead of multiplying by it.",
    "Counting cells on all four boundary lines, so cells on shared lines are counted twice.",
    "Treating cells/mm³ and cells/µL as different values; they are the same number.",
    "Writing 4.8 × 10⁶ /L instead of 4.8 × 10¹² /L when converting an RBC count to SI units.",
    "Reporting a result from very few cells, where the counting error alone can be 20% or more.",
    "Judging a count as normal or abnormal against a range memorised from a book instead of the laboratory's own reference interval.",
  ],
  practice: [
    {
      q: "A WBC count uses 1:20 dilution and the four corner large squares. 96 cells are counted in total. What is the WBC count?",
      answer: "4800 cells/mm³ (4.8 × 10⁹/L).",
      working: ["V = 4 × 1 × 0.1 = 0.4 mm³.", "Count = 96 × 20 ÷ 0.4 = 96 × 50 = 4800 cells/mm³."],
    },
    {
      q: "An RBC count uses 1:200 dilution and five medium squares. 415 cells are counted. Give the count in cells/mm³ and in SI units.",
      answer: "4 150 000 cells/mm³, 4.15 × 10¹²/L.",
      working: [
        "V = 5 × 0.04 × 0.1 = 0.02 mm³.",
        "Count = 415 × 200 ÷ 0.02 = 415 × 10 000 = 4 150 000 cells/mm³.",
        "SI: 4 150 000 × 10⁶ /L = 4.15 × 10¹²/L.",
      ],
    },
    {
      q: "Your manual uses a 1:100 dilution for red cells and the same five medium squares. 300 cells are counted. What is the RBC count?",
      answer: "1 500 000 cells/mm³ (factor 5000).",
      working: ["Factor = 100 ÷ 0.02 = 5000.", "Count = 300 × 5000 = 1 500 000 cells/mm³."],
    },
    {
      q: "Show where the WBC factor of 50 comes from.",
      answer: "Factor = 20 ÷ 0.4 mm³ = 50.",
      working: [
        "Area = 4 large squares × 1 mm² = 4 mm².",
        "Volume = 4 mm² × 0.1 mm = 0.4 mm³.",
        "Factor = dilution ÷ volume = 20 ÷ 0.4 = 50.",
      ],
    },
    {
      q: "A low WBC sample is diluted 1:10 and the four corner large squares contain 64 cells in total. What is the WBC count in SI units?",
      answer: "1600 cells/mm³ = 1.6 × 10⁹/L.",
      working: ["Factor = 10 ÷ 0.4 = 25.", "Count = 64 × 25 = 1600 cells/mm³.", "SI: 1600 ÷ 1000 = 1.6 × 10⁹/L."],
    },
    {
      q: "Approximately what relative counting error do you expect when 400 cells are counted? How many cells must be counted for the error to fall to about 5%?",
      answer: "About 5%; about 400 cells.",
      working: ["Relative error ≈ 1 ÷ √400 = 1 ÷ 20 = 5%.", "For 5%: √N = 1 ÷ 0.05 = 20, so N = 400 cells."],
    },
    {
      q: "A student counts 180 white cells in four large squares at 1:20, but the chamber used is 0.2 mm deep, not 0.1 mm. They calculate with 0.1 mm. What did they report, and what is the correct count?",
      answer: "Reported 9000 cells/mm³; correct 4500 cells/mm³.",
      working: [
        "With 0.1 mm: V = 0.4 mm³, count = 180 × 20 ÷ 0.4 = 9000 cells/mm³.",
        "With 0.2 mm: V = 4 × 1 × 0.2 = 0.8 mm³, count = 180 × 20 ÷ 0.8 = 4500 cells/mm³.",
        "Doubling the depth doubles the volume, so the true count is half the reported one.",
      ],
    },
    {
      q: "Convert a WBC count of 5600 cells/µL and an RBC count of 4 250 000 cells/µL into SI units.",
      answer: "WBC 5.6 × 10⁹/L; RBC 4.25 × 10¹²/L.",
      working: [
        "WBC: 5600 × 10⁶ = 5.6 × 10⁹ cells/L.",
        "RBC: 4 250 000 × 10⁶ = 4.25 × 10¹² cells/L.",
      ],
    },
  ],
  limitations: [
    "All counts are invented for teaching and are not patient results. This guide supports a practical class and is not a basis for clinical decisions.",
    "No reference interval is given as a rule. Intervals vary with age, sex, altitude, population and method; use the one supplied by your laboratory or practical manual.",
    "The calculations assume an improved Neubauer chamber with a 0.1 mm depth. Other chambers have different rulings and depths; follow the counting area your manual specifies.",
    "Differential counts, correction of the WBC count for nucleated red cells, and platelet counts are not covered.",
  ],
  refs: ["bipmSI"],
  relatedTools: [
    {
      slug: "wbc-count-calculator",
      name: "WBC Count Calculator",
      why: "Uses count = N × dilution ÷ (squares × area × depth) exactly as here, shows the area, volume and factor at each step, and lets you enter your own laboratory's reference interval instead of assuming one.",
    },
    {
      slug: "rbc-count-calculator",
      name: "RBC Count Calculator",
      why: "The same shared arithmetic, with presets for 5 medium or 80 smallest squares at 1:200 or 1:100, the Poisson counting error and SI conversion to ×10¹²/L.",
    },
  ],
  relatedGuides: ["dilution-and-concentration", "accuracy-precision-recovery"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
