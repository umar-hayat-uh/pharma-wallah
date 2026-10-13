// app/simulations/disk-diffusion/page.tsx
import type { Metadata } from 'next';
import { pageMeta } from "@/lib/seo";
import DiskDiffusionLab from '@/components/Simulations/DiskDiffusion/DiskDiffusionLab';

export const metadata: Metadata = pageMeta({
  title: 'Disk Diffusion Lab (Kirby-Bauer) — PharmaWallah',
  description:
    'Virtual Kirby-Bauer antibiotic susceptibility test. Walk through the illustrated lab guide, then standardise the inoculum, inoculate a Mueller-Hinton plate, apply disks, incubate, measure the zones of inhibition yourself and interpret them against configurable criteria.',
  path: "/simulations/disk-diffusion",
});

export default function DiskDiffusionPage() {
  return <DiskDiffusionLab />;
}
