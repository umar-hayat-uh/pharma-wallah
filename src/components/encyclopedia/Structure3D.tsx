"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Maximize2, Orbit, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import Viewer3D, { type Model3D, type Style3D, type Viewer3DHandle } from "@/components/molecular-lab/Viewer3D";
import { conformerModel } from "@/components/molecular-lab/model3d";
import { loadSmiles, makeConformer } from "@/components/molecular-lab/chem";
import type { MolGraph } from "@/components/molecular-lab/graph";
import type { Conformer3D } from "@/components/molecular-lab/molfile";

/*
 * The monograph's 3D structure, built on the device from the record's own
 * SMILES — OpenChemLib generates a conformer (in a Web Worker) and 3Dmol draws
 * it. Both are dynamic `import()`s inside those modules, and this whole file is
 * loaded by `next/dynamic` from StructurePlate, so /encyclopedia's first load
 * never pays for either: nothing downloads until the reader presses "3D".
 *
 * This is the documented second home of OpenChemLib/3Dmol (CLAUDE.md §6 rule
 * 18). It reuses the lab's Viewer3D rather than re-implementing it, so a fix to
 * the renderer reaches both surfaces — but it is strictly view-only: no picking,
 * no measuring, no editing. A reader who wants those has "Open in Molecular Lab".
 */

const STYLES: [Style3D, string][] = [
  ["ballStick", "Ball & stick"],
  ["stick", "Stick"],
  ["sphere", "Space-filling"],
];

type Build =
  | { status: "loading" }
  | { status: "ready"; conformer: Conformer3D; graph: MolGraph; minimised: boolean }
  | { status: "error"; message: string };

export default function Structure3D({ smiles, name, molKey }: { smiles: string; name: string; molKey: string }) {
  const [build, setBuild] = useState<Build>({ status: "loading" });
  const [style, setStyle] = useState<Style3D>("ballStick");
  const [spin, setSpin] = useState(false);
  const [showH, setShowH] = useState(false);
  const viewerRef = useRef<Viewer3DHandle>(null);

  useEffect(() => {
    let cancelled = false;
    setBuild({ status: "loading" });
    (async () => {
      try {
        // A SMILES string carries no coordinates, so `loaded.conformer` is
        // normally null and the conformer has to be generated. PubChem-style
        // records that already carry 3D are used as they are.
        const loaded = await loadSmiles(smiles);
        if (cancelled) return;
        if (loaded.conformer) {
          setBuild({ status: "ready", conformer: loaded.conformer, graph: loaded.graph, minimised: false });
          return;
        }
        const made = await makeConformer(loaded.graph);
        if (cancelled) return;
        setBuild({ status: "ready", conformer: made.conformer, graph: loaded.graph, minimised: made.minimised });
      } catch (err) {
        if (cancelled) return;
        setBuild({
          status: "error",
          message:
            err instanceof Error && err.message
              ? err.message
              : "A 3D conformer could not be generated for this structure.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [smiles]);

  const model: Model3D | null = useMemo(() => {
    if (build.status !== "ready") return null;
    return conformerModel(build.conformer, build.graph, molKey, name);
  }, [build, molKey, name]);

  // 3Dmol has no "hide hydrogens" switch on a model it has already parsed, so
  // the SDF is filtered instead: drop every hydrogen atom and renumber the
  // bonds that survive. Kept here rather than in the lab's model builder
  // because only this view offers the choice.
  const shown: Model3D | null = useMemo(() => {
    if (!model || showH || !model.elements) return model;
    const keep: number[] = [];
    const remap = new Map<number, number>();
    model.elements.forEach((el, i) => {
      if (el === "H") return;
      remap.set(i, keep.length);
      keep.push(i);
    });
    if (keep.length === model.elements.length) return model;
    if (!keep.length) return model;
    return {
      ...model,
      key: `${model.key}:heavy`,
      text: filterMolfileHydrogens(model.text, keep, remap),
      parents: keep.map((i) => model.parents?.[i] ?? i),
      isSelf: keep.map((i) => model.isSelf?.[i] ?? true),
      positions: keep.map((i) => model.positions![i]),
      elements: keep.map((i) => model.elements![i]),
      charges: keep.map((i) => model.charges?.[i]),
      bonds: (model.bonds ?? [])
        .filter((b) => remap.has(b.a) && remap.has(b.b))
        .map((b) => ({ id: b.id, a: remap.get(b.a)!, b: remap.get(b.b)! })),
    };
  }, [model, showH]);

  const noop = useCallback(() => {}, []);

  return (
    <div className="pw-enc-3d">
      <div className="pw-enc-3d__stage">
        {shown && (
          <Viewer3D
            ref={viewerRef}
            model={shown}
            fitKey={shown.key}
            style={style}
            labels="none"
            spin={spin}
            selectedAtoms={[]}
            selectedBonds={[]}
            highlightAtoms={[]}
            highlightBonds={[]}
            measure={null}
            onPickAtom={noop}
            onPickBond={noop}
          />
        )}

        {build.status === "loading" && (
          <div className="pw-enc-3d__wait" role="status">
            <span className="pw-enc-3d__spinner" aria-hidden="true" />
            <p>Building the 3D model</p>
            <p className="pw-enc-3d__waitnote">
              Generating a conformer from the record&rsquo;s SMILES, on this device.
            </p>
          </div>
        )}

        {build.status === "error" && (
          <div className="pw-enc-3d__wait pw-enc-3d__wait--bad" role="status">
            <p>No 3D model</p>
            <p className="pw-enc-3d__waitnote">{build.message}</p>
          </div>
        )}
      </div>

      {build.status === "ready" && (
        <>
          <div className="pw-enc-3d__bar">
            <div className="pw-enc-3d__styles" role="group" aria-label="3D display style">
              {STYLES.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  data-on={style === value || undefined}
                  aria-pressed={style === value}
                  onClick={() => setStyle(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="pw-enc-3d__tools">
              <button type="button" data-on={showH || undefined} aria-pressed={showH} onClick={() => setShowH((v) => !v)} title="Show or hide hydrogen atoms">
                <Box className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{showH ? "Hydrogens on" : "Hydrogens off"}</span>
              </button>
              <button type="button" data-on={spin || undefined} aria-pressed={spin} onClick={() => setSpin((v) => !v)} title="Spin the model">
                <Orbit className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{spin ? "Spinning" : "Spin"}</span>
              </button>
              <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => viewerRef.current?.zoom(1.2)}>
                <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => viewerRef.current?.zoom(1 / 1.2)}>
                <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button type="button" aria-label="Fit the model to the view" title="Fit to view" onClick={() => viewerRef.current?.center()}>
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button type="button" aria-label="Reset the view" title="Reset the view" onClick={() => viewerRef.current?.reset()}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="pw-enc-3d__note">
            Drag to rotate · scroll or pinch to zoom.{" "}
            {build.minimised
              ? "Geometry relaxed with the MMFF94s+ force field — a plausible low-energy shape, not a measured crystal structure."
              : "A generated conformer — one plausible shape, not a measured crystal structure."}
          </p>
        </>
      )}
    </div>
  );
}

/**
 * Rewrites a V2000 record keeping only `keep` atoms (in order) and the bonds
 * between them. Written against `conformerToMolfile`'s output: a 4-line header,
 * a counts line, one line per atom, then one line per bond with 3-wide fields.
 */
function filterMolfileHydrogens(text: string, keep: number[], remap: Map<number, number>): string {
  const lines = text.split("\n");
  const countsAt = 3;
  const counts = lines[countsAt] ?? "";
  const nAtoms = Number(counts.slice(0, 3));
  const nBonds = Number(counts.slice(3, 6));
  if (!Number.isFinite(nAtoms) || !Number.isFinite(nBonds)) return text;

  const atomLines = lines.slice(countsAt + 1, countsAt + 1 + nAtoms);
  const bondLines = lines.slice(countsAt + 1 + nAtoms, countsAt + 1 + nAtoms + nBonds);

  const atoms = keep.map((i) => atomLines[i]).filter(Boolean);
  const bonds: string[] = [];
  for (const line of bondLines) {
    const a = Number(line.slice(0, 3)) - 1;
    const b = Number(line.slice(3, 6)) - 1;
    if (!remap.has(a) || !remap.has(b)) continue;
    const pad = (n: number) => String(n).padStart(3, " ");
    bonds.push(`${pad(remap.get(a)! + 1)}${pad(remap.get(b)! + 1)}${line.slice(6)}`);
  }

  const pad3 = (n: number) => String(n).padStart(3, " ");
  const newCounts = `${pad3(atoms.length)}${pad3(bonds.length)}${counts.slice(6)}`;
  return [...lines.slice(0, countsAt), newCounts, ...atoms, ...bonds, "M  END"].join("\n");
}
