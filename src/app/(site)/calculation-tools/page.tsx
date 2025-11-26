import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Calculation Tools | Page",
};

export default function CalculationTools() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Calculation Tools</h1>
      <p className="text-muted-foreground mt-2">
        Access pharmacy calculators and formula tools.
      </p>
    </div>
  );
}
