'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AMRRecord,
  AMRFilters,
  AMRSummary,
  AMRFilterOptions,
  AMRTrendPoint,
  AntibioticComparisonItem,
  CountryComparisonItem,
  PathogenProfileData,
  SpecimenAnalysisData,
  AMRMatrixData,
} from '@/types/amr';
import { buildAMRQueryString, parseAMRQueryParams, exportAMRDataToCSV, exportAMRDataToJSON } from '@/lib/amr/utils';
import { AMRHeader } from './AMRHeader';
import { AMRSearch } from './AMRSearch';
import { AMRFiltersComponent } from './AMRFilters';
import { AMRContextBar } from './AMRContextBar';
import { AMRResultCard } from './AMRResultCard';
import { AMRStats } from './AMRStats';
import { AntibioticComparison } from './AntibioticComparison';
import { CountryComparison } from './CountryComparison';
import { AMRTrendChart } from './AMRTrendChart';
import { PathogenProfile } from './PathogenProfile';
import { SpecimenAnalysis } from './SpecimenAnalysis';
import { TimeAnalysis } from './TimeAnalysis';
import { AMRMatrix } from './AMRMatrix';
import { AMRCompare } from './AMRCompare';
import { AMREvidence } from './AMREvidence';
import { AMRDataTable } from './AMRDataTable';
import { AMRDisclaimer } from './AMRDisclaimer';
import { AMRSkeleton } from './AMRSkeleton';

export const AMRExplorer: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<AMRFilters>(() => parseAMRQueryParams(searchParams));
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [filterOptions, setFilterOptions] = useState<AMRFilterOptions | null>(null);

  const [summary, setSummary] = useState<AMRSummary | null>(null);
  const [records, setRecords] = useState<AMRRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Tab Data States
  const [antibioticsData, setAntibioticsData] = useState<AntibioticComparisonItem[]>([]);
  const [countriesData, setCountriesData] = useState<CountryComparisonItem[]>([]);
  const [trendData, setTrendData] = useState<AMRTrendPoint[]>([]);
  const [pathogenProfile, setPathogenProfile] = useState<PathogenProfileData | null>(null);
  const [specimenData, setSpecimenData] = useState<SpecimenAnalysisData | null>(null);
  const [matrixData, setMatrixData] = useState<AMRMatrixData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  // Sync state to URL
  const updateFilters = useCallback(
    (newFilters: Partial<AMRFilters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      setCurrentPage(1);
      const qs = buildAMRQueryString(updated);
      router.push(`/clinical/amr?${qs}`, { scroll: false });
    },
    [filters, router]
  );

  // 1. Initial Load of Filter Metadata
  useEffect(() => {
    fetch('/api/clinical/amr?view=filters')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setFilterOptions(res.data);
      })
      .catch(console.error);
  }, []);

  // 2. Load Core Data whenever filters change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const qs = buildAMRQueryString(filters);

    Promise.all([
      fetch(`/api/clinical/amr?view=summary&${qs}`).then((r) => r.json()),
      fetch(`/api/clinical/amr?view=records&page=${currentPage}&pageSize=15&${qs}`).then((r) => r.json()),
      fetch(`/api/clinical/amr?view=antibiotic-comparison&${qs}`).then((r) => r.json()),
      fetch(`/api/clinical/amr?view=country-comparison&${qs}`).then((r) => r.json()),
      fetch(`/api/clinical/amr?view=trend&${qs}`).then((r) => r.json()),
      fetch(`/api/clinical/amr?view=pathogen-profile&${qs}`).then((r) => r.json()),
      fetch(`/api/clinical/amr?view=specimen-analysis&${qs}`).then((r) => r.json()),
      fetch(`/api/clinical/amr?view=matrix&${qs}`).then((r) => r.json()),
    ])
      .then(([sumRes, recRes, abRes, ctyRes, trdRes, pathRes, specRes, mtxRes]) => {
        if (!isMounted) return;
        if (sumRes.success) setSummary(sumRes.data);
        if (recRes.success) {
          setRecords(recRes.data);
          setTotalRecords(recRes.meta?.total || 0);
        }
        if (abRes.success) setAntibioticsData(abRes.data);
        if (ctyRes.success) setCountriesData(ctyRes.data);
        if (trdRes.success) setTrendData(trdRes.data);
        if (pathRes.success) setPathogenProfile(pathRes.data);
        if (specRes.success) setSpecimenData(specRes.data);
        if (mtxRes.success) setMatrixData(mtxRes.data);
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters, currentPage]);

  const tabs = [
    { id: 'overview', label: 'Overview & Results' },
    { id: 'antibiotics', label: 'Antibiotic Comparison' },
    { id: 'countries', label: 'Country Comparison' },
    { id: 'trend', label: 'Surveillance Trend' },
    { id: 'pathogen', label: 'Pathogen Profile' },
    { id: 'specimen', label: 'Specimen Analysis' },
    { id: 'time', label: 'Time Analysis' },
    { id: 'matrix', label: 'AMR Matrix' },
    { id: 'compare', label: 'Compare Mode' },
    { id: 'evidence', label: 'Evidence & Sources' },
  ];

  return (
    <div className="min-h-screen bg-slate-100/60 pb-16">
      <AMRHeader onOpenDisclaimer={() => setIsDisclaimerOpen(true)} totalRecords={totalRecords} />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Unified Search */}
        <AMRSearch
          filterOptions={filterOptions}
          onSelectResult={(type, val) => updateFilters({ [type]: val })}
          onSearchQuerySubmit={(q) => updateFilters({ searchQuery: q })}
        />

        {/* Filters */}
        <AMRFiltersComponent
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={updateFilters}
          onReset={() => {
            setFilters({});
            router.push('/clinical/amr');
          }}
        />

        {/* Active Context Bar */}
        <AMRContextBar
          filters={filters}
          onRemoveFilter={(key) => updateFilters({ [key]: undefined })}
          onClearAll={() => {
            setFilters({});
            router.push('/clinical/amr');
          }}
        />

        {/* Summary Stats */}
        <AMRStats summary={summary} />

        {/* Primary Surveillance Result Card */}
        <AMRResultCard record={records[0] || null} totalFilteredCount={totalRecords} />

        {/* Analytics Navigation Tabs */}
        <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 shadow-xs">
          <nav className="flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Analytics Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 pb-3 px-1 text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-700 text-teal-900'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Analytics View Switcher */}
        <div className="rounded-b-xl border-x border-b border-slate-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <AMRSkeleton />
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <AntibioticComparison data={antibioticsData} selectedPathogen={filters.pathogen} />
                  <AMRDataTable
                    records={records}
                    totalRecords={totalRecords}
                    currentPage={currentPage}
                    pageSize={15}
                    onPageChange={setCurrentPage}
                    onExportCSV={() => exportAMRDataToCSV(records)}
                    onExportJSON={() => exportAMRDataToJSON(records)}
                  />
                </div>
              )}

              {activeTab === 'antibiotics' && (
                <AntibioticComparison data={antibioticsData} selectedPathogen={filters.pathogen} />
              )}

              {activeTab === 'countries' && (
                <CountryComparison
                  data={countriesData}
                  selectedPathogen={filters.pathogen}
                  selectedAntibiotic={filters.antibiotic}
                />
              )}

              {activeTab === 'trend' && (
                <AMRTrendChart
                  data={trendData}
                  contextTitle={`${filters.pathogen || 'All Pathogens'} — ${filters.antibiotic || 'All Antibiotics'}`}
                />
              )}

              {activeTab === 'pathogen' && <PathogenProfile profile={pathogenProfile} />}

              {activeTab === 'specimen' && <SpecimenAnalysis data={specimenData} />}

              {activeTab === 'time' && (
                <TimeAnalysis
                  yearsAvailable={summary?.yearsAvailable}
                  totalObservations={summary?.totalObservations}
                />
              )}

              {activeTab === 'matrix' && <AMRMatrix matrixData={matrixData} />}

              {activeTab === 'compare' && <AMRCompare filterOptions={filterOptions} />}

              {activeTab === 'evidence' && <AMREvidence />}
            </>
          )}
        </div>
      </main>

      <AMRDisclaimer isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
    </div>
  );
};