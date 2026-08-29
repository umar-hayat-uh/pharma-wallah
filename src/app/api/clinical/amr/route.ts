import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getGeographicClassification } from '@/lib/amr/constants';
import {
  AMRRecord,
  AMRSummary,
  AMRTrendPoint,
  AntibioticComparisonItem,
  CountryComparisonItem,
  PathogenProfileData,
  SpecimenAnalysisData,
  AMRMatrixData,
  AMRFilterOptions,
} from '@/types/amr';

export const revalidate = 600; // Cache for 10 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'records';
    const country = searchParams.get('country');
    const pathogen = searchParams.get('pathogen');
    const antibiotic = searchParams.get('antibiotic');
    const specimen = searchParams.get('specimen');
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    const includeRegions = searchParams.get('includeRegions') === 'true';
    const q = searchParams.get('q')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.get('pageSize') || '25', 10)));

    const supabase = await createClient();

    // 1. FILTERS OPTIONS ENDPOINT
    if (view === 'filters') {
      const [countriesRes, pathogensRes, antibioticsRes, specimensRes, yearsRes] = await Promise.all([
        supabase.from('amr_surveillance').select('country_iso3, geographic_type'),
        supabase.from('amr_surveillance').select('pathogen'),
        supabase.from('amr_surveillance').select('antibiotic'),
        supabase.from('amr_surveillance').select('specimen'),
        supabase.from('amr_surveillance').select('year').order('year', { ascending: false }),
      ]);

      const countryCounts: Record<string, number> = {};
      countriesRes.data?.forEach((r) => {
        if (r.country_iso3) {
          countryCounts[r.country_iso3] = (countryCounts[r.country_iso3] || 0) + 1;
        }
      });

      const countries = Object.entries(countryCounts)
        .map(([code, count]) => {
          const geo = getGeographicClassification(code);
          return {
            code,
            name: geo.label,
            type: geo.type,
            count,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      const pathogenCounts: Record<string, number> = {};
      pathogensRes.data?.forEach((r) => {
        if (r.pathogen) pathogenCounts[r.pathogen] = (pathogenCounts[r.pathogen] || 0) + 1;
      });

      const antibioticsCounts: Record<string, number> = {};
      antibioticsRes.data?.forEach((r) => {
        if (r.antibiotic) antibioticsCounts[r.antibiotic] = (antibioticsCounts[r.antibiotic] || 0) + 1;
      });

      const specimensCounts: Record<string, number> = {};
      specimensRes.data?.forEach((r) => {
        if (r.specimen) specimensCounts[r.specimen] = (specimensCounts[r.specimen] || 0) + 1;
      });

      const uniqueYears = Array.from(new Set(yearsRes.data?.map((r) => r.year) || [])).sort((a, b) => b - a);

      const filterOptions: AMRFilterOptions = {
        countries,
        pathogens: Object.entries(pathogenCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        antibiotics: Object.entries(antibioticsCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        specimens: Object.entries(specimensCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        years: uniqueYears,
      };

      return NextResponse.json(
        { success: true, data: filterOptions },
        { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' } }
      );
    }

    // Helper: Build query with filters
    const applyFilters = (queryBuilder: any, opts: { excludeCountry?: boolean; excludeAntibiotic?: boolean; excludeYear?: boolean } = {}) => {
      let qb = queryBuilder;
      if (country && !opts.excludeCountry) {
        qb = qb.eq('country_iso3', country.toUpperCase());
      } else if (!includeRegions && !opts.excludeCountry) {
        qb = qb.eq('geographic_type', 'COUNTRY');
      }

      if (pathogen) qb = qb.eq('pathogen', pathogen);
      if (antibiotic && !opts.excludeAntibiotic) qb = qb.eq('antibiotic', antibiotic);
      if (specimen) qb = qb.eq('specimen', specimen);
      if (year && !opts.excludeYear) qb = qb.eq('year', year);

      if (q) {
        qb = qb.or(`pathogen.ilike.%${q}%,antibiotic.ilike.%${q}%,country_iso3.ilike.%${q}%,specimen.ilike.%${q}%`);
      }
      return qb;
    };

    // 2. SUMMARY STATS VIEW
    if (view === 'summary') {
      let query = supabase.from('amr_surveillance').select('*');
      query = applyFilters(query);

      const { data, error } = await query;
      if (error) throw error;

      const records: AMRRecord[] = data || [];
      const countriesSet = new Set<string>();
      const pathogensSet = new Set<string>();
      const antibioticsSet = new Set<string>();
      const specimensSet = new Set<string>();
      const yearsSet = new Set<number>();
      let reportedResistance = 0;

      records.forEach((r) => {
        if (r.country_iso3) countriesSet.add(r.country_iso3);
        if (r.pathogen) pathogensSet.add(r.pathogen);
        if (r.antibiotic) antibioticsSet.add(r.antibiotic);
        if (r.specimen) specimensSet.add(r.specimen);
        if (r.year) yearsSet.add(r.year);
        if (r.resistant_percent !== null && r.resistant_percent !== undefined) {
          reportedResistance += 1;
        }
      });

      const summary: AMRSummary = {
        totalObservations: records.length,
        reportingEntitiesCount: countriesSet.size,
        pathogensCount: pathogensSet.size,
        antibioticsCount: antibioticsSet.size,
        specimensCount: specimensSet.size,
        yearsAvailable: Array.from(yearsSet).sort((a, b) => b - a),
        reportedResistanceCount: reportedResistance,
        unreportedResistanceCount: records.length - reportedResistance,
        dataQualityScore: records.length > 0 ? Math.round((reportedResistance / records.length) * 100) : 0,
      };

      return NextResponse.json({ success: true, data: summary });
    }

    // 3. ANTIBIOTIC COMPARISON VIEW
    if (view === 'antibiotic-comparison') {
      let query = supabase.from('amr_surveillance').select('antibiotic, resistant_percent, interpretable_ast');
      query = applyFilters(query, { excludeAntibiotic: true });

      const { data, error } = await query;
      if (error) throw error;

      const groups: Record<string, { count: number; ast: number; resSum: number; resCount: number }> = {};
      (data || []).forEach((row) => {
        const ab = row.antibiotic;
        if (!groups[ab]) {
          groups[ab] = { count: 0, ast: 0, resSum: 0, resCount: 0 };
        }
        groups[ab].count += 1;
        if (row.interpretable_ast) groups[ab].ast += row.interpretable_ast;
        if (row.resistant_percent !== null && row.resistant_percent !== undefined) {
          groups[ab].resSum += Number(row.resistant_percent);
          groups[ab].resCount += 1;
        }
      });

      const comparison: AntibioticComparisonItem[] = Object.entries(groups)
        .map(([ab, g]) => ({
          antibiotic: ab,
          observationCount: g.count,
          resistantPercent: g.resCount > 0 ? Number((g.resSum / g.resCount).toFixed(1)) : null,
          interpretableAST: g.ast > 0 ? g.ast : null,
          isReported: g.resCount > 0,
        }))
        .sort((a, b) => (b.resistantPercent ?? -1) - (a.resistantPercent ?? -1) || b.observationCount - a.observationCount);

      return NextResponse.json({ success: true, data: comparison });
    }

    // 4. COUNTRY COMPARISON VIEW
    if (view === 'country-comparison') {
      let query = supabase.from('amr_surveillance').select('country_iso3, geographic_type, resistant_percent, interpretable_ast');
      query = applyFilters(query, { excludeCountry: true });

      const { data, error } = await query;
      if (error) throw error;

      const groups: Record<string, { count: number; ast: number; resSum: number; resCount: number; geoType: any }> = {};
      (data || []).forEach((row) => {
        const c = row.country_iso3;
        if (!groups[c]) {
          groups[c] = { count: 0, ast: 0, resSum: 0, resCount: 0, geoType: row.geographic_type || 'COUNTRY' };
        }
        groups[c].count += 1;
        if (row.interpretable_ast) groups[c].ast += row.interpretable_ast;
        if (row.resistant_percent !== null && row.resistant_percent !== undefined) {
          groups[c].resSum += Number(row.resistant_percent);
          groups[c].resCount += 1;
        }
      });

      const comparison: CountryComparisonItem[] = Object.entries(groups)
        .map(([code, g]) => {
          const geo = getGeographicClassification(code);
          return {
            countryCode: code,
            countryName: geo.label,
            geographicType: geo.type,
            observationCount: g.count,
            resistantPercent: g.resCount > 0 ? Number((g.resSum / g.resCount).toFixed(1)) : null,
            interpretableAST: g.ast > 0 ? g.ast : null,
            isReported: g.resCount > 0,
          };
        })
        .filter((item) => includeRegions || item.geographicType === 'COUNTRY')
        .sort((a, b) => (b.resistantPercent ?? -1) - (a.resistantPercent ?? -1) || b.observationCount - a.observationCount);

      return NextResponse.json({ success: true, data: comparison });
    }

    // 5. RESISTANCE / SURVEILLANCE TREND VIEW
    if (view === 'trend') {
      let query = supabase.from('amr_surveillance').select('year, country_iso3, resistant_percent, interpretable_ast');
      query = applyFilters(query, { excludeYear: true });

      const { data, error } = await query;
      if (error) throw error;

      const yearMap: Record<number, { count: number; entities: Set<string>; resSum: number; resCount: number; ast: number }> = {};
      [2020, 2021, 2022, 2023].forEach((yr) => {
        yearMap[yr] = { count: 0, entities: new Set(), resSum: 0, resCount: 0, ast: 0 };
      });

      (data || []).forEach((row) => {
        if (yearMap[row.year]) {
          yearMap[row.year].count += 1;
          if (row.country_iso3) yearMap[row.year].entities.add(row.country_iso3);
          if (row.interpretable_ast) yearMap[row.year].ast += row.interpretable_ast;
          if (row.resistant_percent !== null && row.resistant_percent !== undefined) {
            yearMap[row.year].resSum += Number(row.resistant_percent);
            yearMap[row.year].resCount += 1;
          }
        }
      });

      const trend: AMRTrendPoint[] = Object.entries(yearMap)
        .map(([yrStr, val]) => {
          const yr = parseInt(yrStr, 10);
          return {
            year: yr,
            observationCount: val.count,
            resistantPercent: val.resCount > 0 ? Number((val.resSum / val.resCount).toFixed(1)) : null,
            interpretableAST: val.ast > 0 ? val.ast : null,
            reportingEntities: val.entities.size,
            isReported: val.resCount > 0,
          };
        })
        .sort((a, b) => a.year - b.year);

      return NextResponse.json({ success: true, data: trend });
    }

    // 6. PATHOGEN PROFILE VIEW
    if (view === 'pathogen-profile') {
      const targetPathogen = pathogen || 'Escherichia coli';
      const { data, error } = await supabase
        .from('amr_surveillance')
        .select('pathogen, antibiotic, specimen, country_iso3, year, resistant_percent')
        .eq('pathogen', targetPathogen);

      if (error) throw error;

      const rows = data || [];
      const entities = new Set<string>();
      const abMap: Record<string, { count: number; resSum: number; resCount: number }> = {};
      const spMap: Record<string, { count: number; resSum: number; resCount: number }> = {};
      const yrMap: Record<number, { count: number; resSum: number; resCount: number }> = {};

      rows.forEach((r) => {
        if (r.country_iso3) entities.add(r.country_iso3);

        if (!abMap[r.antibiotic]) abMap[r.antibiotic] = { count: 0, resSum: 0, resCount: 0 };
        abMap[r.antibiotic].count += 1;

        if (!spMap[r.specimen]) spMap[r.specimen] = { count: 0, resSum: 0, resCount: 0 };
        spMap[r.specimen].count += 1;

        if (!yrMap[r.year]) yrMap[r.year] = { count: 0, resSum: 0, resCount: 0 };
        yrMap[r.year].count += 1;

        if (r.resistant_percent !== null && r.resistant_percent !== undefined) {
          abMap[r.antibiotic].resSum += Number(r.resistant_percent);
          abMap[r.antibiotic].resCount += 1;
          spMap[r.specimen].resSum += Number(r.resistant_percent);
          spMap[r.specimen].resCount += 1;
          yrMap[r.year].resSum += Number(r.resistant_percent);
          yrMap[r.year].resCount += 1;
        }
      });

      const profile: PathogenProfileData = {
        pathogen: targetPathogen,
        totalObservations: rows.length,
        reportingEntities: entities.size,
        antibioticCount: Object.keys(abMap).length,
        antibioticDistribution: Object.entries(abMap)
          .map(([name, v]) => ({
            name,
            count: v.count,
            resistantPercent: v.resCount > 0 ? Number((v.resSum / v.resCount).toFixed(1)) : null,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        specimenDistribution: Object.entries(spMap).map(([name, v]) => ({
          name,
          count: v.count,
          resistantPercent: v.resCount > 0 ? Number((v.resSum / v.resCount).toFixed(1)) : null,
        })),
        yearlyTrend: Object.entries(yrMap)
          .map(([yrStr, v]) => ({
            year: parseInt(yrStr, 10),
            count: v.count,
            resistantPercent: v.resCount > 0 ? Number((v.resSum / v.resCount).toFixed(1)) : null,
          }))
          .sort((a, b) => a.year - b.year),
      };

      return NextResponse.json({ success: true, data: profile });
    }

    // 7. SPECIMEN ANALYSIS VIEW
    if (view === 'specimen-analysis') {
      const targetSpecimen = specimen || 'BLOOD';
      const { data, error } = await supabase
        .from('amr_surveillance')
        .select('pathogen, antibiotic, year, resistant_percent')
        .eq('specimen', targetSpecimen);

      if (error) throw error;

      const rows = data || [];
      const pathogenMap: Record<string, { count: number; resSum: number; resCount: number }> = {};
      const antibioticSet = new Set<string>();
      const yrMap: Record<number, number> = {};

      rows.forEach((r) => {
        if (r.antibiotic) antibioticSet.add(r.antibiotic);
        if (!pathogenMap[r.pathogen]) pathogenMap[r.pathogen] = { count: 0, resSum: 0, resCount: 0 };
        pathogenMap[r.pathogen].count += 1;
        yrMap[r.year] = (yrMap[r.year] || 0) + 1;

        if (r.resistant_percent !== null && r.resistant_percent !== undefined) {
          pathogenMap[r.pathogen].resSum += Number(r.resistant_percent);
          pathogenMap[r.pathogen].resCount += 1;
        }
      });

      const analysis: SpecimenAnalysisData = {
        specimen: targetSpecimen,
        totalObservations: rows.length,
        pathogensCount: Object.keys(pathogenMap).length,
        antibioticsCount: antibioticSet.size,
        topPathogens: Object.entries(pathogenMap)
          .map(([name, v]) => ({
            name,
            count: v.count,
            resistantPercent: v.resCount > 0 ? Number((v.resSum / v.resCount).toFixed(1)) : null,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8),
        yearlyTrend: Object.entries(yrMap)
          .map(([yrStr, count]) => ({ year: parseInt(yrStr, 10), count }))
          .sort((a, b) => a.year - b.year),
      };

      return NextResponse.json({ success: true, data: analysis });
    }

    // 8. AMR MATRIX VIEW
    if (view === 'matrix') {
      let query = supabase.from('amr_surveillance').select('pathogen, antibiotic, resistant_percent');
      query = applyFilters(query, { excludeAntibiotic: true });

      const { data, error } = await query;
      if (error) throw error;

      const matrixMap: Record<string, { count: number; resSum: number; resCount: number }> = {};
      const pathSet = new Set<string>();
      const abSet = new Set<string>();

      (data || []).forEach((row) => {
        pathSet.add(row.pathogen);
        abSet.add(row.antibiotic);
        const key = `${row.pathogen}:::${row.antibiotic}`;
        if (!matrixMap[key]) matrixMap[key] = { count: 0, resSum: 0, resCount: 0 };
        matrixMap[key].count += 1;
        if (row.resistant_percent !== null && row.resistant_percent !== undefined) {
          matrixMap[key].resSum += Number(row.resistant_percent);
          matrixMap[key].resCount += 1;
        }
      });

      const topPathogens = Array.from(pathSet).slice(0, 8);
      const topAntibiotics = Array.from(abSet).slice(0, 10);

      const cells = topPathogens.flatMap((p) =>
        topAntibiotics.map((ab) => {
          const entry = matrixMap[`${p}:::${ab}`];
          return {
            pathogen: p,
            antibiotic: ab,
            observationCount: entry ? entry.count : 0,
            resistantPercent: entry && entry.resCount > 0 ? Number((entry.resSum / entry.resCount).toFixed(1)) : null,
            isReported: entry ? entry.resCount > 0 : false,
          };
        })
      );

      const matrixData: AMRMatrixData = {
        pathogens: topPathogens,
        antibiotics: topAntibiotics,
        cells,
      };

      return NextResponse.json({ success: true, data: matrixData });
    }

    // 9. DEFAULT / PAGINATED OBSERVATION RECORDS (FOR TABLES & CORE RESULT)
    let recordsQuery = supabase.from('amr_surveillance').select('*', { count: 'exact' });
    recordsQuery = applyFilters(recordsQuery);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    recordsQuery = recordsQuery.order('year', { ascending: false }).range(from, to);

    const { data: records, count, error } = await recordsQuery;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: records as AMRRecord[],
      meta: {
        total: count || 0,
        page,
        pageSize,
        timestamp: new Date().toISOString(),
        filtersApplied: {
          country: country || undefined,
          pathogen: pathogen || undefined,
          antibiotic: antibiotic || undefined,
          specimen: specimen || undefined,
          year,
          includeRegions,
          searchQuery: q || undefined,
        },
      },
    });
  } catch (error: any) {
    console.error('[AMR_API_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve AMR surveillance records from WHO GLASS repository.',
      },
      { status: 500 }
    );
  }
}