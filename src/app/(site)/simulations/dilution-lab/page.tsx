// src/app/(site)/simulations/dilution-lab/page.tsx
import type { Metadata } from 'next';
import PharmaWallahDilutionLab from '@/components/Simulations/DilutionLab/DilutionLabSim';

export const metadata: Metadata = {
  title: 'Solution Dilution Lab — PharmaWallah',
  description:
    'Prepare precise molar solutions in a virtual lab. Choose compounds, calculate required stock volume, pipette, transfer, top up, and mix—learn the dilution equation C₁V₁ = C₂V₂ with real-time feedback.',
};

export default function DilutionLabPage() {
  return <PharmaWallahDilutionLab />;
}