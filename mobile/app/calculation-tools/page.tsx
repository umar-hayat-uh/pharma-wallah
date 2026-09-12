import ToolHub from "../_components/ToolHub";

// Mirrors the web URL so a tool page's own "/calculation-tools" style links
// (and anything a student pastes in) land on the catalogue rather than a 404.
export default function CalculationToolsPage() {
  return <ToolHub />;
}
