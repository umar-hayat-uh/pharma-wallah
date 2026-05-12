// app/simulations/disk-diffusion/page.tsx
import type { Metadata } from 'next';
import DiskDiffusionSim from '@/components/Simulations/DiskDiffusion/DiskDiffusionSim';

export const metadata: Metadata = {
  title: 'Disk Diffusion Simulation — PharmaWallah',
  description:
    'Interactive Kirby-Bauer antibiotic susceptibility test simulation. Learn disk diffusion, measure zones, interpret CLSI breakpoints, and download a lab report.',
};

export default function DiskDiffusionPage() {
  return <DiskDiffusionSim />;
}