"use client";

import { useEffect, useRef, useState } from "react";
import { Great_Vibes } from "next/font/google";
import { Download, FileText } from "lucide-react";
import { BRAND_BUTTON } from "@/components/page-kit";
import { Spinner, primaryButtonClass, secondaryButtonClass } from "../ui";
import { CERT_H, CERT_W, drawCertificate, type CertFonts } from "./draw";
import type { CertificateData } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

/*
 * The name is set in a script face, as on a printed certificate. Loaded here,
 * so only the page that shows a certificate requests it (like the landing's
 * scoped faces); everything else on the certificate is Outfit.
 */
const script = Great_Vibes({ subsets: ["latin"], weight: "400", display: "swap" });

function fileBase(d: CertificateData) {
  const who = d.name.trim().replace(/[\s/\\:*?"<>|.]+/g, "-").replace(/^-|-$/g, "") || "participant";
  return `PharmaWallah-Battle-Royale-Certificate-${who}`;
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Resolves once the certificate's fonts and the logo are ready to draw. */
async function prepare(): Promise<{ fonts: CertFonts; logo: HTMLImageElement | null }> {
  const outfit = getComputedStyle(document.documentElement).getPropertyValue("--font-outfit").trim() || "system-ui, sans-serif";
  const fonts: CertFonts = { sans: outfit, script: script.style.fontFamily };
  await Promise.all([
    document.fonts.load(`400 64px ${fonts.script}`, "Aa"),
    document.fonts.load(`800 64px ${fonts.sans}`, "Aa"),
    document.fonts.load(`400 32px ${fonts.sans}`, "Aa"),
  ]).catch(() => {});
  const logo = await new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/icons/icon-192x192.png";
  });
  return { fonts, logo };
}

/**
 * The participant's e-certificate: a live preview and PNG / PDF downloads.
 * Everything is drawn in the browser from the status payload — nothing is
 * uploaded or stored.
 */
export function Certificate({ data }: { data: CertificateData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    (async () => {
      const { fonts, logo } = await prepare();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (cancelled || !canvas || !ctx) return;
      drawCertificate(ctx, data, fonts, logo);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [data]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy("png");
    canvas.toBlob((blob) => {
      if (blob) save(blob, `${fileBase(data)}.png`);
      setBusy(null);
    }, "image/png");
  };

  const downloadPdf = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      pdf.setProperties({ title: `${data.eventTitle} — certificate for ${data.name}`, creator: "PharmaWallah" });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, 297, 210);
      save(pdf.output("blob"), `${fileBase(data)}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-[#16181d]/10 bg-white shadow-[0_24px_48px_-28px_rgba(6,18,36,.45)]">
        <canvas
          ref={canvasRef}
          width={CERT_W}
          height={CERT_H}
          className={cn("block h-auto w-full transition-opacity duration-500", ready ? "opacity-100" : "opacity-0")}
          role="img"
          aria-label={`${data.kind === "winner" ? "Certificate of Achievement" : "Certificate of Participation"} for ${data.name}: score ${data.total}, ${data.accuracy}% accuracy, title ${data.title}.`}
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium text-[#16181d]/60">
            <Spinner /> Preparing your certificate…
          </div>
        )}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => void downloadPdf()} disabled={!ready || busy !== null} className={primaryButtonClass} style={{ background: BRAND_BUTTON }}>
          {busy === "pdf" ? <Spinner /> : <FileText className="h-5 w-5" />} Download PDF
        </button>
        <button type="button" onClick={downloadPng} disabled={!ready || busy !== null} className={secondaryButtonClass}>
          {busy === "png" ? <Spinner /> : <Download className="h-5 w-5" />} Download image
        </button>
      </div>
    </div>
  );
}
