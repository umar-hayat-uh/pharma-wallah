"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, FlaskConical, ImagePlus, ShieldCheck, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ACCEPT_ATTRIBUTE } from "./canvas";
import type { SavedAnalysis } from "./types";

/**
 * The first screen: pick a photo, take one, or try the sample plate.
 *
 * Two inputs, on purpose. Capacitor's Android file chooser only offers the
 * camera when the input asks for exactly `image/*` with `capture`; the gallery
 * input lists the three accepted types so the picker hides everything else.
 * Neither sends the file anywhere — it is decoded in the page.
 */
export function TLCUploader({
  onFile,
  onSample,
  saved,
  savedError,
  onOpenSaved,
  onDeleteSaved,
  onClearLocal,
  busy,
}: {
  onFile: (file: File) => void;
  onSample: () => void;
  saved: SavedAnalysis[];
  savedError: string | null;
  onOpenSaved: (analysis: SavedAnalysis) => void;
  onDeleteSaved: (id: string) => void;
  onClearLocal: () => void;
  busy: boolean;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  // "Take photo" is only offered where a camera is likely; decided after mount so SSR and hydration agree.
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    try {
      setTouch(window.matchMedia("(pointer: coarse)").matches);
    } catch {
      setTouch(false);
    }
  }, []);

  const take = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset, so choosing the same file again still fires a change.
    event.target.value = "";
    if (file) onFile(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed bg-card px-5 py-8 text-center transition-colors sm:px-8 sm:py-12",
          dragging ? "border-blue-500 bg-blue-50/60" : "border-border",
        )}
      >
        <PlateGlyph />
        <h2 className="mt-5 text-xl font-bold tracking-[-0.02em] text-foreground sm:text-2xl">
          Calculate Rf values from a TLC plate image
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Photograph the developed plate square-on, against a plain background, with the solvent front
          still marked. Then mark the baseline, the front and the spots.
        </p>

        <div className="mx-auto mt-6 grid max-w-md gap-2.5 sm:grid-cols-2">
          {touch && (
            <Button disabled={busy} onClick={() => cameraRef.current?.click()} className="bg-blue-600 hover:bg-blue-700">
              <Camera />
              Take photo
            </Button>
          )}
          <Button
            disabled={busy}
            variant={touch ? "outline" : "default"}
            onClick={() => galleryRef.current?.click()}
            className={cn(!touch && "bg-blue-600 hover:bg-blue-700 sm:col-span-2")}
          >
            {touch ? <ImagePlus /> : <Upload />}
            {touch ? "Choose from gallery" : "Upload image"}
          </Button>
          <Button disabled={busy} variant="ghost" onClick={onSample} className="text-blue-700 sm:col-span-2">
            <FlaskConical />
            Try a sample plate
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          JPG, PNG or WEBP{touch ? "" : " · or drop the file here"}
        </p>

        <input ref={galleryRef} type="file" accept={ACCEPT_ATTRIBUTE} className="sr-only" tabIndex={-1} aria-hidden onChange={take} />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={take}
        />
      </div>

      <p className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-relaxed text-emerald-900">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <span>
          <strong className="font-semibold">Image processing happens locally on your device.</strong> Your TLC image is
          not uploaded. The analyzer also works with no internet connection.
        </span>
      </p>

      {(saved.length > 0 || savedError) && (
        <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-foreground">Saved on this device</h2>
            <Button variant="ghost" size="sm" onClick={onClearLocal} className="text-muted-foreground">
              <Trash2 />
              Clear local data
            </Button>
          </div>
          {savedError && <p className="text-sm text-destructive">{savedError}</p>}
          <ul className="divide-y divide-border/70">
            {saved.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2.5">
                <button
                  type="button"
                  onClick={() => onOpenSaved(item)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {/* A data URL made on this device; next/image cannot optimise it and the APK has no optimiser. */}
                  <img src={item.thumbnail} alt="" className="h-14 w-11 shrink-0 rounded-md border object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {item.spots.filter((s) => s.accepted).length} spots ·{" "}
                      {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => onDeleteSaved(item.id)}
                  className="text-muted-foreground"
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** A small drawn plate — baseline, front and three spots — so the empty state shows what the tool reads. */
function PlateGlyph() {
  return (
    <svg viewBox="0 0 120 150" className="mx-auto h-28 w-auto sm:h-32" aria-hidden="true">
      <rect x="22" y="6" width="76" height="138" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="30" x2="90" y1="26" y2="26" stroke="#16a34a" strokeWidth="2" strokeDasharray="5 4" />
      <line x1="30" x2="90" y1="122" y2="122" stroke="#1c7ad9" strokeWidth="2" />
      <ellipse cx="44" cy="92" rx="6" ry="5" fill="#7c3aed" fillOpacity="0.55" />
      <ellipse cx="60" cy="92" rx="6" ry="5" fill="#92400e" fillOpacity="0.5" />
      <ellipse cx="60" cy="58" rx="5.5" ry="7" fill="#ea580c" fillOpacity="0.45" />
      <ellipse cx="76" cy="58" rx="6" ry="5" fill="#334155" fillOpacity="0.5" />
      <line x1="104" x2="104" y1="122" y2="26" stroke="#16a34a" strokeWidth="1.5" />
      <path d="M100 32 L104 26 L108 32" fill="none" stroke="#16a34a" strokeWidth="1.5" />
    </svg>
  );
}
