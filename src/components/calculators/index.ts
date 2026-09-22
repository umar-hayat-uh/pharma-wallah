/**
 * Shared calculator UI kit — used by both the website and the Android app.
 *
 * Purpose: make all 89 calculators consistent, thumb-friendly and readable on a
 * phone without each one reinventing inputs, results and explanations.
 * See .claude/skills/calculator-tool/SKILL.md for how to migrate a calculator.
 */
export { CalculatorShell, CalcSection, FieldGrid } from "./CalculatorShell";
export { NumberField, SelectField, type UnitOption } from "./NumberField";
export { ResultCard, ResultRow, type ResultTone } from "./ResultCard";
export { FormulaNote, Formula } from "./FormulaNote";
export { CalcAbout, CalcList, CalcFaq } from "./CalcAbout";
export { AdSlot } from "./AdSlot";
export { CalcDisclaimer } from "./CalcDisclaimer";
export { SourceLink } from "./SourceLink";

// Laboratory calculators — lab record card, mode switch, units, formula → molar mass.
export {
  LabReport,
  LabActions,
  reportToText,
  downloadReportPng,
  printReport,
  type LabReportData,
  type LabReportSection,
  type LabReportRow,
} from "./LabReport";
export { ModeSwitch, type ModeOption } from "./ModeSwitch";
export { TextField, LabNotice } from "./LabFields";
export * from "./lab-math";
export { molarMassFromFormula, ATOMIC_WEIGHTS, type FormulaResult } from "./chemistry";
