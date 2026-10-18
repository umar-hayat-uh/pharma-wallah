"use client";

/**
 * A bone's 3D model with its landmark list beside it (below it on a phone).
 *
 * The list is the primary way in — precise taps on a small 3D surface are hard on a
 * phone — and the model follows it: choosing a landmark flies the camera to the
 * Z-Anatomy anchor and labels it. Landmarks Z-Anatomy does not mark are listed as
 * "Text only" rather than given a marker we would have to invent.
 *
 * The whole list renders on the server too (this is a client component, so Next
 * pre-renders it), so every definition is in the first HTML for readers without JS.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Crosshair, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoneContent, Landmark } from "@/lib/osteology/types";
import type { ModelLandmark } from "@/lib/osteology/models";
import { boneViews } from "@/lib/osteology/views";
import { ModelViewer } from "./viewer/ModelViewer";
import type { ViewerLandmark } from "./viewer/Viewer3D";

type Props = {
  bone: Pick<BoneContent, "slug" | "name" | "sideType" | "isGroup" | "landmarks">;
  modelSrc: string;
  modelSize: string;
  anchors: ModelLandmark[];
};

export function BoneExplorer({ bone, modelSrc, modelSize, anchors }: Props) {
  const [left, setLeft] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Content landmark → its Z-Anatomy anchor (exact name, and mesh for group models).
  const placed = useMemo(() => {
    const out = new Map<string, ModelLandmark>();
    for (const l of bone.landmarks) {
      if (!l.zName) continue;
      const a = anchors.find((x) => x.name === l.zName && (!l.mesh || x.mesh === l.mesh));
      if (a) out.set(l.id, a);
    }
    return out;
  }, [bone.landmarks, anchors]);

  const viewerLandmarks: ViewerLandmark[] = useMemo(
    () =>
      bone.landmarks
        .filter((l) => placed.has(l.id) && (advanced || !l.advanced || l.id === selected))
        .map((l) => ({ id: l.id, label: l.name, p: placed.get(l.id)!.p, n: placed.get(l.id)!.n })),
    [bone.landmarks, placed, advanced, selected],
  );

  const advancedCount = bone.landmarks.filter((l) => l.advanced).length;
  const q = query.trim().toLowerCase();
  const visible = bone.landmarks.filter(
    (l) => (advanced || !l.advanced || l.id === selected) && (!q || `${l.name} ${l.definition}`.toLowerCase().includes(q)),
  );

  // Deep link (#lm-<id>) from a question's "learn" link opens that landmark.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace(/^#lm-/, ""));
    const lm = bone.landmarks.find((l) => l.id === id);
    if (lm) {
      if (lm.advanced) setAdvanced(true);
      setSelected(lm.id);
    }
  }, [bone.landmarks]);

  function choose(l: Landmark, fromList: boolean) {
    const next = selected === l.id ? null : l.id;
    setSelected(next);
    // On a phone the model is above the list: bring it into view so the student sees
    // where the landmark is, not just its definition.
    if (fromList && next && placed.has(l.id) && window.matchMedia("(max-width: 1023px)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      viewerRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  const views = boneViews(bone.slug, bone.sideType, left);
  const withMarker = bone.landmarks.filter((l) => placed.has(l.id)).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
      <div ref={viewerRef} className="pw-osteo-anchor min-w-0 lg:sticky lg:top-24">
        <ModelViewer
          src={modelSrc}
          sizeLabel={modelSize}
          views={views}
          mirror={left}
          landmarks={viewerLandmarks}
          showLandmarks={showMarkers}
          selectedLandmark={selected && placed.has(selected) ? selected : null}
          onSelectLandmark={(id) => {
            const l = bone.landmarks.find((x) => x.id === id);
            if (l) choose(l, false);
            document.getElementById(`lm-${id}`)?.scrollIntoView({ block: "nearest" });
          }}
          onToggleLandmarks={withMarker > 0 ? () => setShowMarkers((v) => !v) : undefined}
          sidePicker={bone.sideType === "paired"}
          onMirrorChange={setLeft}
          hint={
            bone.sideType === "paired"
              ? `Showing a ${left ? "left" : "right"} ${bone.isGroup ? "set" : "bone"}. Rotate it to inspect every surface; switch sides to practise siding.`
              : "Rotate the bone to inspect every surface. Blue dots are landmarks — tap one."
          }
          fallback={<p className="text-sm">Use the landmark list to study each feature.</p>}
        />
      </div>

      <section aria-labelledby="landmarks-title" className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="landmarks-title" className="text-xl font-bold tracking-tight">Landmarks</h2>
          <span className="text-sm text-[#5b616b]">{withMarker} of {bone.landmarks.length} marked on the model</span>
        </div>
        <p className="mt-1 text-sm text-[#4a4f57]">Tap a landmark to find it on the {bone.isGroup ? "bones" : "bone"} and read what it is.</p>

        <label className="mt-3 flex min-h-11 items-center gap-2 rounded-xl border border-[#16181d]/12 bg-white px-3 focus-within:border-brandBlue">
          <Search className="h-4 w-4 text-[#6b7079]" aria-hidden />
          <span className="sr-only">Search landmarks</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search landmarks"
            className="w-full !bg-transparent text-base outline-none"
          />
        </label>

        {advancedCount > 0 && (
          <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={advanced} onChange={(e) => setAdvanced(e.target.checked)} className="h-5 w-5 accent-[#1c7bd9]" />
            Show advanced landmarks ({advancedCount})
          </label>
        )}

        <ul className="pw-osteo-list mt-3 divide-y divide-[#16181d]/8 rounded-2xl border border-[#16181d]/10 bg-white">
          {visible.map((l) => {
            const open = selected === l.id;
            const has3d = placed.has(l.id);
            return (
              <li key={l.id} id={`lm-${l.id}`} className="pw-osteo-anchor">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`lm-${l.id}-body`}
                  onClick={() => choose(l, true)}
                  className={cn(
                    "flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brandBlue",
                    open && "bg-brandBlue/[0.06]",
                  )}
                >
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", has3d ? (open ? "bg-brandGreen" : "bg-brandBlue") : "bg-[#16181d]/20")} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug">{l.name}</span>
                    <span className="block text-xs text-[#6b7079]">
                      {l.kind}
                      {l.mesh ? ` · ${l.mesh}` : ""}
                      {has3d ? "" : " · text only"}
                      {l.advanced ? " · advanced" : ""}
                    </span>
                  </span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
                </button>
                <div id={`lm-${l.id}-body`} hidden={!open} className="space-y-2 px-4 pb-4 text-sm leading-relaxed text-[#2b2f36]">
                  <p>{l.definition}</p>
                  <p><span className="font-semibold">Where: </span>{l.location}</p>
                  <p><span className="font-semibold">Why it matters: </span>{l.significance}</p>
                  {l.related && <p><span className="font-semibold">Related: </span>{l.related}</p>}
                  {l.viva && <VivaReveal q={l.viva.q} a={l.viva.a} />}
                  {has3d && (
                    <p className="flex items-center gap-1.5 text-xs text-[#5b616b]">
                      <Crosshair className="h-3.5 w-3.5" aria-hidden /> Marked on the model at the point Z-Anatomy places this label.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
          {visible.length === 0 && <li className="px-4 py-6 text-sm text-[#5b616b]">No landmark matches “{query}”.</li>}
        </ul>
      </section>
    </div>
  );
}

export function VivaReveal({ q, a }: { q: string; a: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="rounded-xl bg-[#f4f7fb] p-3">
      <p className="font-semibold">Viva: {q}</p>
      {shown ? (
        <p className="mt-1">{a}</p>
      ) : (
        <button type="button" onClick={() => setShown(true)} className="mt-1 min-h-10 text-sm font-semibold text-brandBlue underline underline-offset-2">
          Show answer
        </button>
      )}
    </div>
  );
}
