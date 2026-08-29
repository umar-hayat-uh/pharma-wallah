import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AMRExplorer } from '@/components/Clinical/amr/AMRExplorer';
import { AMRSkeleton } from '@/components/Clinical/amr/AMRSkeleton';

export const metadata: Metadata = {
  title: 'AMR Surveillance Explorer | PharmaWallah Clinical',
  description:
    'Explore antimicrobial resistance surveillance data from WHO GLASS across pathogens, antibiotics, specimens, countries and years.',
};

export default function AMRPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl p-6">
          <AMRSkeleton />
        </div>
      }
    >
      <AMRExplorer />
    </Suspense>
  );
}