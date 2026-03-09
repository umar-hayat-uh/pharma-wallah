import { Metadata } from "next";
import CalculationToolsClient from "./CalculationToolsClient";

export const metadata: Metadata = {
  title: "Pharmaceutical Calculation Tools | Advanced Calculators",
  description:
    "Professional pharmacy calculators and formula tools for pharmaceutical chemistry and healthcare professionals",
};

// Server component – safely exports metadata and renders the client component
export default function CalculationToolsPage() {
  return <CalculationToolsClient />;
}