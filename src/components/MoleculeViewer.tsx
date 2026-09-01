'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

/* ================================================================
   Types
   ================================================================ */
interface AtomData {
    serial: number;
    elem: string;
    atom: string;
    resn: string;
    resi: number;
    chain: string;
    x: number;
    y: number;
    z: number;
    b: number;
    hetflag: boolean;
    bonds: number[];
}

interface Measurement {
    id: number;
    a1: AtomData;
    a2: AtomData;
    dist: number;
}

interface MolInfo {
    name: string;
    atoms: number;
    bonds: number;
    chains: string[];
    residues: number;
    formula: string;
    mw: number;
}

type ViewStyle = 'stick' | 'ballStick' | 'sphere' | 'line' | 'cartoon';
type ColorScheme = 'element' | 'chain' | 'spectrum' | 'ss' | 'custom';
type SurfaceMode = 'none' | 'vdw' | 'sas' | 'ses';
type LabelMode = 'none' | 'atom' | 'residue';
type BgMode = 'white' | 'light' | 'dark';

/* ================================================================
   Constants
   ================================================================ */
const MASS: Record<string, number> = {
    H: 1.008, He: 4.003, C: 12.011, N: 14.007, O: 15.999, F: 18.998,
    Na: 22.99, Mg: 24.305, P: 30.974, S: 32.06, Cl: 35.45, K: 39.098,
    Ca: 40.078, Fe: 55.845, Zn: 65.38, Br: 79.904, I: 126.904, Se: 78.971,
    Mn: 54.938, Co: 58.933, Cu: 63.546, Si: 28.086, Al: 26.982, B: 10.81,
};

const PRESETS = [
    { label: 'Caffeine', src: 'pubchem', id: 'caffeine' },
    { label: 'Aspirin', src: 'pubchem', id: 'aspirin' },
    { label: 'Glucose', src: 'pubchem', id: 'glucose' },
    { label: 'Penicillin', src: 'pubchem', id: 'penicillin G' },
    { label: 'Crambin', src: 'pdb', id: '1CRN' },
    { label: 'Insulin', src: 'pdb', id: '3I40' },
    { label: 'GFP', src: 'pdb', id: '1EMA' },
    { label: 'Lysozyme', src: 'pdb', id: '1AKI' },
];

const BG_COLORS: Record<BgMode, string> = {
    white: '#ffffff',
    light: '#e4e8ee',
    dark: '#1a1d23',
};

function computeFormula(atoms: AtomData[]): string {
    const c: Record<string, number> = {};
    atoms.forEach((a) => (c[a.elem] = (c[a.elem] || 0) + 1));
    return Object.keys(c)
        .sort((a, b) => {
            if (a === 'C') return -1; if (b === 'C') return 1;
            if (a === 'H') return -1; if (b === 'H') return 1;
            return a.localeCompare(b);
        })
        .map((el) => (c[el] > 1 ? `${el}${c[el]}` : el))
        .join('');
}

function computeMW(atoms: AtomData[]): number {
    return atoms.reduce((s, a) => s + (MASS[a.elem] || 0), 0);
}

function emptyInfo(name = ''): MolInfo {
    return { name, atoms: 0, bonds: 0, chains: [], residues: 0, formula: '', mw: 0 };
}

function extractInfo(viewer: any, name: string): MolInfo {
    try {
        const model = viewer.getModel();
        if (!model) return emptyInfo(name);
        const atoms: AtomData[] = model.selectedAtoms({});
        const chains = [...new Set(atoms.map((a) => a.chain).filter(Boolean))];
        const residues = new Set(atoms.map((a) => `${a.chain}:${a.resn}:${a.resi}`));
        let bc = 0;
        atoms.forEach((a) => (bc += (a.bonds || []).length));
        return {
            name,
            atoms: atoms.length,
            bonds: Math.floor(bc / 2),
            chains: chains as string[],
            residues: residues.size,
            formula: computeFormula(atoms),
            mw: computeMW(atoms),
        };
    } catch {
        return emptyInfo(name);
    }
}

function guessFormat(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdb' || ext === 'ent') return 'pdb';
    if (ext === 'sdf' || ext === 'mol') return 'sdf';
    if (ext === 'mol2') return 'mol2';
    if (ext === 'xyz') return 'xyz';
    if (ext === 'cif' || ext === 'mmcif') return 'mmcif';
    return 'pdb';
}

/* ================================================================
   Theme
   ================================================================ */
const T = {
    bg: '#ffffff', bgAlt: '#f8f9fb', bgPanel: '#f2f4f7', bgInput: '#ffffff',
    border: '#d4d8e1', borderLight: '#e8ebf0', text: '#1a1d23', text2: '#4b5563',
    text3: '#9ca3af', accent: '#2563eb', accentBg: 'rgba(37,99,235,0.07)',
    success: '#10b981', successBg: 'rgba(16,185,129,0.07)',
    danger: '#ef4444', dangerBg: 'rgba(239,68,68,0.06)', dangerText: '#b91c1c',
    warn: '#f59e0b', warnBg: 'rgba(245,158,11,0.08)',
    font: "'Inter','Segoe UI',system-ui,-apple-system,sans-serif",
};

/* ================================================================
   Component
   ================================================================ */
export default function MoleculeViewer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<any>(null);
    const $3DmolRef = useRef<any>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const [viewerReady, setViewerReady] = useState(false);
    const [hasModel, setHasModel] = useState(false);
    const [molInfo, setMolInfo] = useState<MolInfo>(emptyInfo());

    const [viewStyle, setViewStyle] = useState<ViewStyle>('stick');
    const [colorScheme, setColorScheme] = useState<ColorScheme>('element');
    const [customColor, setCustomColor] = useState('#3b82f6');
    const [surfaceMode, setSurfaceMode] = useState<SurfaceMode>('none');
    const [surfaceOpacity, setSurfaceOpacity] = useState(0.7);
    const [bgMode, setBgMode] = useState<BgMode>('white');
    const [labelMode, setLabelMode] = useState<LabelMode>('none');
    const [isSpinning, setIsSpinning] = useState(false);
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [measureAtom1, setMeasureAtom1] = useState<AtomData | null>(null);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [hoveredAtom, setHoveredAtom] = useState<AtomData | null>(null);
    const [selectedAtom, setSelectedAtom] = useState<AtomData | null>(null);

    const [pdbQuery, setPdbQuery] = useState('');
    const [pubchemQuery, setPubchemQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('Load a molecule to get started.');
    const [msgType, setMsgType] = useState<'info' | 'error' | 'success'>('info');

    // Stable refs for callbacks
    const isMeasuringRef = useRef(isMeasuring);
    isMeasuringRef.current = isMeasuring;
    const measureAtom1Ref = useRef(measureAtom1);
    measureAtom1Ref.current = measureAtom1;
    const measurementsRef = useRef(measurements);
    measurementsRef.current = measurements;
    const labelModeRef = useRef(labelMode);
    labelModeRef.current = labelMode;

    const flash = useCallback((text: string, type: 'info' | 'error' | 'success' = 'info') => {
        setMsg(text);
        setMsgType(type);
    }, []);

    /* ---------- Apply visual style ---------- */
    const applyStyle = useCallback(() => {
        const v = viewerRef.current;
        if (!v) return;

        const colorOpt: any = {};
        switch (colorScheme) {
            case 'chain': colorOpt.colorscheme = 'chainHetatm'; break;
            case 'spectrum': colorOpt.color = 'spectrum'; break;
            case 'ss': colorOpt.colorscheme = 'ssJmol'; break;
            case 'custom': colorOpt.color = customColor; break;
            default: break; // element = default Jmol
        }

        if (viewStyle === 'cartoon') {
            v.setStyle({ hetflag: false }, { cartoon: { thickness: 1.2, ...colorOpt } });
            v.setStyle({ hetflag: true }, { stick: { radius: 0.14, ...colorOpt } });
        } else {
            const spec: any = {};
            switch (viewStyle) {
                case 'stick': spec.stick = { radius: 0.15, ...colorOpt }; break;
                case 'ballStick': spec.stick = { radius: 0.1, ...colorOpt }; spec.sphere = { scale: 0.25, ...colorOpt }; break;
                case 'sphere': spec.sphere = { scale: 1.0, ...colorOpt }; break;
                case 'line': spec.line = { linewidth: 2.5, ...colorOpt }; break;
            }
            v.setStyle({}, spec);
        }
        v.render();
    }, [viewStyle, colorScheme, customColor]);

    /* ---------- Apply surface ---------- */
    const applySurface = useCallback(() => {
        const v = viewerRef.current;
        const lib = $3DmolRef.current;
        if (!v || !lib) return;

        v.removeAllSurfaces();
        if (surfaceMode !== 'none') {
            const typeMap: Record<string, number> = {
                vdw: lib.SurfaceType.VDW,
                sas: lib.SurfaceType.SAS,
                ses: lib.SurfaceType.SES,
            };
            v.addSurface(typeMap[surfaceMode], {
                opacity: surfaceOpacity,
                color: 'white',
                voldata: null,
            });
        }
        v.render();
    }, [surfaceMode, surfaceOpacity]);

    /* ---------- Apply labels ---------- */
    const applyLabels = useCallback(() => {
        const v = viewerRef.current;
        if (!v) return;
        v.removeAllLabels();

        // Display labels
        if (labelModeRef.current === 'residue') {
            v.addResLabels({}, {
                font: 'Arial', fontSize: 11, fontColor: '#1a1d23',
                backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 3,
                showBackground: true, alignment: 'center',
            });
        } else if (labelModeRef.current === 'atom') {
            const model = v.getModel();
            if (model) {
                const atoms: AtomData[] = model.selectedAtoms({});
                if (atoms.length > 500) {
                    // Only label heteroatoms + CA for large structures
                    atoms.filter((a) => a.hetflag || a.atom === 'CA').forEach((a) => {
                        v.addLabel(`${a.elem}${a.serial}`, {
                            position: a, fontSize: 9, fontColor: '#1a1d23',
                            backgroundColor: 'rgba(255,255,255,0.65)',
                            showBackground: true, inFront: true,
                        });
                    });
                } else {
                    atoms.forEach((a) => {
                        v.addLabel(a.elem, {
                            position: a, fontSize: 9, fontColor: '#1a1d23',
                            backgroundColor: 'rgba(255,255,255,0.6)',
                            showBackground: true, inFront: true,
                        });
                    });
                }
            }
        }

        // Measurement labels
        measurementsRef.current.forEach((m) => {
            v.addLabel(`${m.dist.toFixed(2)} Å`, {
                position: {
                    x: (m.a1.x + m.a2.x) / 2,
                    y: (m.a1.y + m.a2.y) / 2,
                    z: (m.a1.z + m.a2.z) / 2,
                },
                backgroundColor: '#1f2937', fontColor: '#ffffff',
                fontSize: 12, showBackground: true, borderRadius: 4,
            });
        });

        v.render();
    }, []);

    /* ---------- Redraw measurement shapes ---------- */
    const drawMeasurementShapes = useCallback(() => {
        const v = viewerRef.current;
        if (!v) return;
        v.removeAllShapes();
        measurementsRef.current.forEach((m) => {
            v.addCylinder({
                start: { x: m.a1.x, y: m.a1.y, z: m.a1.z },
                end: { x: m.a2.x, y: m.a2.y, z: m.a2.z },
                radius: 0.04, color: '#f59e0b', dashed: true,
                dashLength: 0.15, gapLength: 0.1,
                fromCap: true, toCap: true,
            });
        });
        v.render();
    }, []);

    /* ---------- Refresh overlays ---------- */
    const refreshOverlays = useCallback(() => {
        drawMeasurementShapes();
        applyLabels();
    }, [drawMeasurementShapes, applyLabels]);

    /* ---------- Interaction setup ---------- */
    const onHoverRef = useRef<(a: any) => void>(() => { });
    const onUnhoverRef = useRef<() => void>(() => { });
    const onClickRef = useRef<(a: any) => void>(() => { });

    onHoverRef.current = (atom: AtomData) => setHoveredAtom(atom);
    onUnhoverRef.current = () => setHoveredAtom(null);
    onClickRef.current = (atom: AtomData) => {
        if (isMeasuringRef.current) {
            const a1 = measureAtom1Ref.current;
            if (!a1) {
                setMeasureAtom1(atom);
                flash(`Measuring from ${atom.elem}${atom.serial} (${atom.resn || ''} ${atom.resi || ''}). Click another atom.`, 'info');
            } else {
                if (a1.serial === atom.serial) {
                    setMeasureAtom1(null);
                    flash('Measurement cancelled.', 'info');
                    return;
                }
                const dist = Math.sqrt((atom.x - a1.x) ** 2 + (atom.y - a1.y) ** 2 + (atom.z - a1.z) ** 2);
                const newM: Measurement = { id: Date.now(), a1, a2: atom, dist };
                setMeasurements((prev) => [...prev, newM]);
                setMeasureAtom1(null);
                flash(`Distance: ${dist.toFixed(2)} Å`, 'success');
                // Will be drawn by effect
            }
        } else {
            setSelectedAtom(atom);
        }
    };

    function setupInteraction(viewer: any) {
        viewer.setHoverable({}, true,
            (atom: any) => onHoverRef.current(atom),
            () => onUnhoverRef.current()
        );
        viewer.setClickable({}, true,
            (atom: any) => onClickRef.current(atom)
        );
    }

    /* ---------- Load model ---------- */
    const loadModel = useCallback((data: string, format: string, name: string) => {
        const v = viewerRef.current;
        if (!v) return;

        v.removeAllModels();
        v.removeAllSurfaces();
        v.removeAllLabels();
        v.removeAllShapes();

        v.addModel(data, format);
        setHasModel(true);
        setSelectedAtom(null);
        setHoveredAtom(null);
        setMeasurements([]);
        setMeasureAtom1(null);
        setSurfaceMode('none');

        setupInteraction(v);
        applyStyle();
        v.zoomTo();
        v.render();

        const info = extractInfo(v, name);
        setMolInfo(info);
        flash(`Loaded "${name}" — ${info.atoms} atoms, ${info.bonds} bonds${info.chains.length > 0 ? `, ${info.chains.length} chain(s)` : ''}.`, 'success');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applyStyle, flash]);

    /* ---------- Init 3Dmol.js ---------- */
    useEffect(() => {
        let cancelled = false;
        const container = containerRef.current;
        if (!container) return;

        function init(lib: any) {
            if (cancelled || !container) return;
            $3DmolRef.current = lib;
            const viewer = lib.createViewer(container, {
                backgroundColor: BG_COLORS.white,
                antialias: true,
                cartoonQuality: 8,
            });
            viewerRef.current = viewer;
            viewer.render();
            setViewerReady(true);
        }

        // Check if already loaded
        if ((window as any).$3Dmol) {
            init((window as any).$3Dmol);
            return;
        }

        // Load from CDN
        const script = document.createElement('script');
        script.src = 'https://3Dmol.org/build/3Dmol-min.js';
        script.async = true;
        script.onload = () => {
            const lib = (window as any).$3Dmol;
            if (lib) init(lib);
            else flash('Failed to initialize 3Dmol.js.', 'error');
        };
        script.onerror = () => flash('Failed to load 3Dmol.js from CDN.', 'error');
        document.head.appendChild(script);

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---------- Resize observer ---------- */
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !viewerReady) return;
        const ro = new ResizeObserver(() => {
            viewerRef.current?.resize();
            viewerRef.current?.render();
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [viewerReady]);

    /* ---------- Effects: re-apply on change ---------- */
    useEffect(() => { if (viewerReady && hasModel) applyStyle(); }, [viewStyle, colorScheme, customColor, viewerReady, hasModel, applyStyle]);
    useEffect(() => { if (viewerReady && hasModel) applySurface(); }, [surfaceMode, surfaceOpacity, viewerReady, hasModel, applySurface]);
    useEffect(() => { if (viewerReady && hasModel) refreshOverlays(); }, [labelMode, measurements, viewerReady, hasModel, refreshOverlays]);

    useEffect(() => {
        const v = viewerRef.current;
        if (!v || !viewerReady) return;
        v.setBackgroundColor(BG_COLORS[bgMode]);
        v.render();
    }, [bgMode, viewerReady]);

    useEffect(() => {
        const v = viewerRef.current;
        if (!v || !viewerReady) return;
        if (isSpinning) v.spin('y', 1);
        else v.spin(false);
    }, [isSpinning, viewerReady]);

    /* ---------- Import handlers ---------- */
    const fetchPDB = useCallback(async () => {
        const id = pdbQuery.trim().toUpperCase();
        if (!id) { flash('Enter a PDB ID (e.g. 1CRN).', 'error'); return; }
        setLoading(true);
        flash(`Fetching ${id} from RCSB PDB…`, 'info');
        try {
            const res = await fetch(`https://files.rcsb.org/download/${id}.pdb`);
            if (!res.ok) throw new Error(`PDB returned ${res.status}. Check ID.`);
            const text = await res.text();
            loadModel(text, 'pdb', id);
            setViewStyle('cartoon');
        } catch (err: any) {
            flash(`PDB fetch failed: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [pdbQuery, loadModel, flash]);

    const fetchPubChem = useCallback(async () => {
        const q = pubchemQuery.trim();
        if (!q) { flash('Enter a compound name (e.g. caffeine).', 'error'); return; }
        setLoading(true);
        flash(`Fetching "${q}" from PubChem…`, 'info');
        try {
            let res = await fetch(
                `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(q)}/SDF?record_type=3d`
            );
            if (!res.ok) {
                res = await fetch(
                    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(q)}/SDF`
                );
            }
            if (!res.ok) throw new Error(`PubChem returned ${res.status}. Check name.`);
            const text = await res.text();
            loadModel(text, 'sdf', q);
            setViewStyle('ballStick');
        } catch (err: any) {
            flash(`PubChem fetch failed: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [pubchemQuery, loadModel, flash]);

    const loadPreset = useCallback(async (preset: (typeof PRESETS)[0]) => {
        if (preset.src === 'pdb') {
            setPdbQuery(preset.id);
            setLoading(true);
            flash(`Fetching ${preset.label}…`, 'info');
            try {
                const res = await fetch(`https://files.rcsb.org/download/${preset.id}.pdb`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                loadModel(await res.text(), 'pdb', preset.label);
                setViewStyle('cartoon');
            } catch (err: any) {
                flash(`Failed: ${err.message}`, 'error');
            } finally {
                setLoading(false);
            }
        } else {
            setPubchemQuery(preset.id);
            setLoading(true);
            flash(`Fetching ${preset.label}…`, 'info');
            try {
                let res = await fetch(
                    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(preset.id)}/SDF?record_type=3d`
                );
                if (!res.ok) {
                    res = await fetch(
                        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(preset.id)}/SDF`
                    );
                }
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                loadModel(await res.text(), 'sdf', preset.label);
                setViewStyle('ballStick');
            } catch (err: any) {
                flash(`Failed: ${err.message}`, 'error');
            } finally {
                setLoading(false);
            }
        }
    }, [loadModel, flash]);

    const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const fmt = guessFormat(file.name);
                loadModel(String(reader.result), fmt, file.name);
                if (fmt === 'pdb') setViewStyle('cartoon');
                else setViewStyle('ballStick');
            } catch (err: any) {
                flash(`Parse error: ${err.message}`, 'error');
            }
        };
        reader.onerror = () => flash('Could not read file.', 'error');
        reader.readAsText(file);
        e.target.value = '';
    }, [loadModel, flash]);

    /* ---------- Tool handlers ---------- */
    const takeScreenshot = useCallback(() => {
        const v = viewerRef.current;
        if (!v) return;
        const uri = v.pngURI();
        const a = document.createElement('a');
        a.href = uri;
        a.download = `${molInfo.name || 'molecule'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        flash('Screenshot saved.', 'success');
    }, [molInfo.name, flash]);

    const resetView = useCallback(() => {
        const v = viewerRef.current;
        if (!v) return;
        v.zoomTo();
        v.render();
        flash('View reset.', 'info');
    }, [flash]);

    const clearMeasurements = useCallback(() => {
        setMeasurements([]);
        setMeasureAtom1(null);
        viewerRef.current?.removeAllShapes();
        applyLabels();
        flash('Measurements cleared.', 'info');
    }, [applyLabels, flash]);

    const clearAll = useCallback(() => {
        const v = viewerRef.current;
        if (!v) return;
        v.removeAllModels();
        v.removeAllSurfaces();
        v.removeAllLabels();
        v.removeAllShapes();
        v.render();
        setHasModel(false);
        setMolInfo(emptyInfo());
        setSelectedAtom(null);
        setHoveredAtom(null);
        setMeasurements([]);
        setMeasureAtom1(null);
        setIsMeasuring(false);
        setSurfaceMode('none');
        flash('Cleared.', 'info');
    }, [flash]);

    /* ---------- Keyboard shortcuts ---------- */
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.target instanceof HTMLInputElement) return;
            if (e.key === 'Escape') {
                setIsMeasuring(false);
                setMeasureAtom1(null);
                setSelectedAtom(null);
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    /* ---------- Derived ---------- */
    const displayAtom = hoveredAtom || selectedAtom;

    /* ================================================================
       Render
       ================================================================ */
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', width: '100%', height: '100vh',
            background: T.bg, fontFamily: T.font, color: T.text, overflow: 'hidden', paddingTop: '20px',
        }}>
            {/* ---- Top bar ---- */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 16px', borderBottom: `1px solid ${T.borderLight}`,
                background: T.bgAlt, flexWrap: 'wrap', gap: '8px', flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: '8px', background: `linear-gradient(135deg, ${T.accent}, #7c3aed)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 14,
                    }}>M</div>
                    <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>MolViewer</span>
                    <span style={{ fontSize: 11, color: T.text3, fontWeight: 500, background: T.bgPanel, padding: '2px 8px', borderRadius: 4 }}>
                        3Dmol.js
                    </span>
                </div>
                {hasModel && (
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.text2, flexWrap: 'wrap' }}>
                        <span>Atoms <b style={{ color: T.text }}>{molInfo.atoms}</b></span>
                        <span>Bonds <b style={{ color: T.text }}>{molInfo.bonds}</b></span>
                        {molInfo.chains.length > 0 && <span>Chains <b style={{ color: T.text }}>{molInfo.chains.join(', ')}</b></span>}
                        <span>MW <b style={{ color: T.accent }}>{molInfo.mw.toFixed(1)} Da</b></span>
                        {molInfo.formula && <span style={{ color: T.success, fontWeight: 600 }}>{molInfo.formula}</span>}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                {/* ---- Left Sidebar ---- */}
                <div style={{
                    width: 210, borderRight: `1px solid ${T.borderLight}`, background: T.bgPanel,
                    display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0,
                }}>
                    <div style={{ padding: '12px 12px 0' }}>
                        {/* IMPORT */}
                        <SectionTitle>Import</SectionTitle>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                            <input value={pdbQuery} onChange={(e) => setPdbQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchPDB()}
                                placeholder="PDB ID" style={inputStyle} />
                            <Btn onClick={fetchPDB} disabled={loading} accent>PDB</Btn>
                        </div>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                            <input value={pubchemQuery} onChange={(e) => setPubchemQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchPubChem()}
                                placeholder="Compound name" style={inputStyle} />
                            <Btn onClick={fetchPubChem} disabled={loading} accent>Go</Btn>
                        </div>
                        <Btn onClick={() => fileRef.current?.click()} full disabled={loading}>
                            📂 Import File
                        </Btn>
                        <input ref={fileRef} type="file" accept=".pdb,.sdf,.mol,.mol2,.xyz,.cif,.mmcif,.ent"
                            style={{ display: 'none' }} onChange={handleFile} />

                        <div style={{ fontSize: 10, color: T.text3, margin: '8px 0 4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>
                            Quick Load
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
                            {PRESETS.map((p) => (
                                <Btn key={p.label} onClick={() => loadPreset(p)} disabled={loading} small>
                                    {p.label}
                                </Btn>
                            ))}
                        </div>

                        <Hr />

                        {/* STYLE */}
                        <SectionTitle>Representation</SectionTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
                            {([
                                ['stick', '╱ Stick'],
                                ['ballStick', '● B&S'],
                                ['sphere', '⬤ CPK'],
                                ['line', '— Line'],
                                ['cartoon', '🎗 Cartoon'],
                            ] as [ViewStyle, string][]).map(([v, label]) => (
                                <ToggleBtn key={v} active={viewStyle === v} onClick={() => setViewStyle(v)}>
                                    {label}
                                </ToggleBtn>
                            ))}
                        </div>

                        <Hr />

                        {/* COLOR */}
                        <SectionTitle>Color Scheme</SectionTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 4 }}>
                            {([
                                ['element', 'Element'],
                                ['chain', 'Chain'],
                                ['spectrum', 'Rainbow'],
                                ['ss', 'SS Type'],
                                ['custom', 'Custom'],
                            ] as [ColorScheme, string][]).map(([c, label]) => (
                                <ToggleBtn key={c} active={colorScheme === c} onClick={() => setColorScheme(c)}>
                                    {label}
                                </ToggleBtn>
                            ))}
                        </div>
                        {colorScheme === 'custom' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 6px' }}>
                                <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)}
                                    style={{ width: 28, height: 24, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
                                <span style={{ fontSize: 11, color: T.text2 }}>{customColor}</span>
                            </div>
                        )}

                        <Hr />

                        {/* SURFACE */}
                        <SectionTitle>Surface</SectionTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4, marginBottom: 4 }}>
                            {(['none', 'vdw', 'sas', 'ses'] as SurfaceMode[]).map((s) => (
                                <ToggleBtn key={s} active={surfaceMode === s} onClick={() => setSurfaceMode(s)}>
                                    {s === 'none' ? 'Off' : s.toUpperCase()}
                                </ToggleBtn>
                            ))}
                        </div>
                        {surfaceMode !== 'none' && (
                            <div style={{ marginBottom: 6 }}>
                                <div style={{ fontSize: 10, color: T.text3, marginBottom: 2 }}>Opacity: {Math.round(surfaceOpacity * 100)}%</div>
                                <input type="range" min={10} max={100} value={Math.round(surfaceOpacity * 100)}
                                    onChange={(e) => setSurfaceOpacity(Number(e.target.value) / 100)}
                                    style={{ width: '100%', accentColor: T.accent }} />
                            </div>
                        )}

                        <Hr />

                        {/* VIEW */}
                        <SectionTitle>View</SectionTitle>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                            {(['white', 'light', 'dark'] as BgMode[]).map((b) => (
                                <ToggleBtn key={b} active={bgMode === b} onClick={() => setBgMode(b)} style={{ flex: 1 }}>
                                    {b.charAt(0).toUpperCase() + b.slice(1)}
                                </ToggleBtn>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                            {(['none', 'atom', 'residue'] as LabelMode[]).map((l) => (
                                <ToggleBtn key={l} active={labelMode === l} onClick={() => setLabelMode(l)} style={{ flex: 1 }}>
                                    {l === 'none' ? 'No Labels' : l === 'atom' ? 'Atoms' : 'Residues'}
                                </ToggleBtn>
                            ))}
                        </div>

                        <Hr />

                        {/* TOOLS */}
                        <SectionTitle>Tools</SectionTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 12 }}>
                            <ToggleBtn active={isSpinning} onClick={() => setIsSpinning(!isSpinning)}>
                                {isSpinning ? '⏸ Stop Spin' : '⟳ Auto Spin'}
                            </ToggleBtn>
                            <ToggleBtn active={isMeasuring} onClick={() => { setIsMeasuring(!isMeasuring); setMeasureAtom1(null); }}
                                style={isMeasuring ? { borderColor: T.warn, background: T.warnBg } : {}}>
                                {isMeasuring ? '📏 Measuring…' : '📏 Measure Distance'}
                            </ToggleBtn>
                            {measurements.length > 0 && (
                                <Btn onClick={clearMeasurements} small>Clear Measurements</Btn>
                            )}
                            <Btn onClick={takeScreenshot} disabled={!hasModel}>📷 Screenshot</Btn>
                            <Btn onClick={resetView} disabled={!hasModel}>↺ Reset View</Btn>
                            <Btn onClick={clearAll} disabled={!hasModel} style={{ color: T.danger }}>🗑 Clear All</Btn>
                        </div>
                    </div>
                </div>

                {/* ---- Center: 3Dmol viewer ---- */}
                <div style={{ flex: 1, position: 'relative', minWidth: 0, background: BG_COLORS[bgMode] }}>
                    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

                    {/* Loading overlay */}
                    {!viewerReady && (
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.9)', zIndex: 10,
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Loading 3Dmol.js…</div>
                                <div style={{ fontSize: 12, color: T.text3 }}>Initializing molecular viewer</div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {viewerReady && !hasModel && (
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            pointerEvents: 'none', zIndex: 5,
                        }}>
                            <div style={{
                                textAlign: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
                                padding: '32px 40px', borderRadius: 16, border: `1px solid ${T.borderLight}`,
                                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                            }}>
                                <div style={{ fontSize: 36, marginBottom: 12 }}>🧬</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>No molecule loaded</div>
                                <div style={{ fontSize: 13, color: T.text2, maxWidth: 260, lineHeight: 1.5 }}>
                                    Import from RCSB PDB, PubChem, or upload a file. Try a quick-load preset to get started.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Measure mode indicator */}
                    {isMeasuring && (
                        <div style={{
                            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                            background: T.warnBg, border: `1px solid ${T.warn}44`, color: '#92400e',
                            padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, zIndex: 5,
                        }}>
                            📏 {measureAtom1 ? `Click second atom (first: ${measureAtom1.elem}${measureAtom1.serial})` : 'Click first atom to measure'}
                            <span onClick={() => { setIsMeasuring(false); setMeasureAtom1(null); }}
                                style={{ marginLeft: 12, cursor: 'pointer', opacity: 0.7 }}>✕</span>
                        </div>
                    )}

                    {/* Hint bar */}
                    <div style={{
                        position: 'absolute', bottom: 10, left: 10, fontSize: 11, color: T.text3,
                        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)',
                        padding: '5px 10px', borderRadius: 6, border: `1px solid ${T.borderLight}`, zIndex: 5,
                    }}>
                        Left-drag: rotate · Right-drag: translate · Scroll: zoom · Click: select · Esc: deselect
                    </div>
                </div>

                {/* ---- Right Panel ---- */}
                <div style={{
                    width: 230, borderLeft: `1px solid ${T.borderLight}`, background: T.bgPanel,
                    display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0,
                    padding: '12px 12px',
                }}>
                    {/* Atom info */}
                    <SectionTitle>Atom Info</SectionTitle>
                    {displayAtom ? (
                        <div style={{
                            background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8,
                            padding: 10, marginBottom: 12,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%', border: `2px solid ${T.accent}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 700, color: T.accent,
                                }}>{displayAtom.elem}</div>
                                <span style={{ fontSize: 14, fontWeight: 700 }}>{displayAtom.elem}{displayAtom.serial}</span>
                                <span style={{ fontSize: 10, color: T.text3, marginLeft: 'auto' }}>
                                    {hoveredAtom ? 'hovered' : 'selected'}
                                </span>
                            </div>
                            <InfoRow label="Element" value={displayAtom.elem} />
                            <InfoRow label="Atom Name" value={displayAtom.atom || '—'} />
                            <InfoRow label="Residue" value={displayAtom.resn ? `${displayAtom.resn} ${displayAtom.resi}` : '—'} />
                            <InfoRow label="Chain" value={displayAtom.chain || '—'} />
                            <InfoRow label="Position" value={`(${displayAtom.x.toFixed(2)}, ${displayAtom.y.toFixed(2)}, ${displayAtom.z.toFixed(2)})`} mono />
                            {displayAtom.b > 0 && <InfoRow label="B-factor" value={displayAtom.b.toFixed(1)} />}
                        </div>
                    ) : (
                        <div style={{ fontSize: 12, color: T.text3, fontStyle: 'italic', marginBottom: 12 }}>
                            Hover or click an atom
                        </div>
                    )}

                    {/* Molecule info */}
                    {hasModel && (
                        <>
                            <SectionTitle>Molecule</SectionTitle>
                            <div style={{
                                background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8,
                                padding: 10, marginBottom: 12,
                            }}>
                                <InfoRow label="Name" value={molInfo.name} />
                                <InfoRow label="Atoms" value={String(molInfo.atoms)} />
                                <InfoRow label="Bonds" value={String(molInfo.bonds)} />
                                <InfoRow label="Chains" value={molInfo.chains.length > 0 ? molInfo.chains.join(', ') : '—'} />
                                <InfoRow label="Residues" value={String(molInfo.residues)} />
                                <InfoRow label="Formula" value={molInfo.formula || '—'} mono accent />
                                <InfoRow label="MW" value={`${molInfo.mw.toFixed(1)} Da`} />
                            </div>
                        </>
                    )}

                    {/* Measurements */}
                    {measurements.length > 0 && (
                        <>
                            <SectionTitle>Measurements</SectionTitle>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {measurements.map((m) => (
                                    <div key={m.id} style={{
                                        background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6,
                                        padding: '6px 8px', fontSize: 11,
                                    }}>
                                        <span style={{ color: T.text2 }}>{m.a1.elem}{m.a1.serial}</span>
                                        <span style={{ color: T.text3 }}> ↔ </span>
                                        <span style={{ color: T.text2 }}>{m.a2.elem}{m.a2.serial}</span>
                                        <span style={{ float: 'right', fontWeight: 700, color: T.warn }}>{m.dist.toFixed(2)} Å</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ---- Status bar ---- */}
            <div style={{
                padding: '7px 16px', borderTop: `1px solid ${T.borderLight}`, flexShrink: 0,
                background: msgType === 'error' ? T.dangerBg : msgType === 'success' ? T.successBg : T.bgAlt,
                color: msgType === 'error' ? T.dangerText : msgType === 'success' ? '#065f46' : T.text2,
                fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
            }}>
                <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: msgType === 'error' ? T.danger : msgType === 'success' ? T.success : T.accent
                }} />
                {msg}
                {loading && <span style={{ marginLeft: 'auto', color: T.text3 }}>Loading…</span>}
            </div>
        </div>
    );
}

/* ================================================================
   Reusable sub-components (inline, no separate files needed)
   ================================================================ */
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            fontSize: 10, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase',
            fontWeight: 700, marginBottom: 6, marginTop: 2,
        }}>{children}</div>
    );
}

function Hr() {
    return <div style={{ borderTop: `1px solid ${T.borderLight}`, margin: '8px 0' }} />;
}

function InfoRow({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, lineHeight: 1.9 }}>
            <span style={{ color: '#6b7280' }}>{label}</span>
            <b style={{
                color: accent ? T.success : T.text,
                fontFamily: mono ? "'JetBrains Mono','Fira Code',monospace" : 'inherit',
                fontSize: mono ? 10 : 11,
                maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{value}</b>
        </div>
    );
}

function Btn({ children, onClick, disabled, accent, full, small, style: extraStyle }: {
    children: React.ReactNode; onClick?: () => void; disabled?: boolean;
    accent?: boolean; full?: boolean; small?: boolean; style?: React.CSSProperties;
}) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            padding: small ? '5px 0' : '7px 10px', borderRadius: 6,
            border: `1px solid ${accent ? T.accent + '55' : T.border}`,
            background: accent ? T.accentBg : T.bg,
            color: disabled ? T.text3 : accent ? T.accent : T.text2,
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: small ? 11 : 12, fontWeight: accent ? 600 : 400,
            width: full ? '100%' : undefined,
            transition: 'all 0.15s', fontFamily: 'inherit',
            ...extraStyle,
        }}>{children}</button>
    );
}

function ToggleBtn({ children, active, onClick, style: extraStyle }: {
    children: React.ReactNode; active: boolean; onClick: () => void; style?: React.CSSProperties;
}) {
    return (
        <button onClick={onClick} style={{
            padding: '6px 4px', borderRadius: 6,
            border: `1.5px solid ${active ? T.accent : T.border}`,
            background: active ? T.accentBg : T.bg,
            color: active ? T.accent : T.text2,
            cursor: 'pointer', fontSize: 11, fontWeight: active ? 700 : 400,
            transition: 'all 0.15s', fontFamily: 'inherit',
            ...extraStyle,
        }}>{children}</button>
    );
}

const inputStyle: React.CSSProperties = {
    flex: 1, minWidth: 0, background: T.bg, border: `1px solid ${T.border}`,
    borderRadius: 6, color: T.text, fontSize: 12, padding: '6px 8px',
    fontFamily: 'inherit', outline: 'none',
};