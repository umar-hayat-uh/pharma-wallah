"use client";

// src/components/course/PdfDownloadButton.tsx
// Same logic as before, now shared by every subject instead of duplicated.

import { useCallback, useState } from "react";
import { Printer, Loader2 } from "lucide-react";

interface Props {
  printRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  headerLabel: string;   // e.g. "PHARMAWALLAH · PHARMACEUTICAL BIOCHEMISTRY"
  footerLabel: string;   // e.g. "Carbohydrates · pharmawallah.com"
  gradientClass: string; // tailwind classes for the button
  variant?: "full" | "icon";
}

export default function PdfDownloadButton({ printRef, fileName, headerLabel, footerLabel, gradientClass, variant = "full" }: Props) {
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPdf = useCallback(async () => {
    if (!printRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const el = printRef.current;
      const prevHeight = el.style.height;
      el.style.height = "auto";
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff", windowWidth: 900 });
      el.style.height = prevHeight;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentW = pageW - margin * 2;
      const headerSpace = 12;
      const usableH = pageH - margin * 2 - headerSpace;
      const scaledW = contentW;
      const scaledH = (canvas.height / canvas.width) * scaledW;
      const totalPages = Math.ceil(scaledH / usableH);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        pdf.setFillColor(37, 99, 235);
        pdf.rect(0, 0, pageW, 10, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text(headerLabel.toUpperCase(), margin, 6.5);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Page ${page + 1} of ${totalPages}`, pageW - margin, 6.5, { align: "right" });

        pdf.setDrawColor(229, 231, 235);
        pdf.line(margin, pageH - 8, pageW - margin, pageH - 8);
        pdf.setTextColor(156, 163, 175);
        pdf.setFontSize(6.5);
        pdf.setFont("helvetica", "normal");
        pdf.text(footerLabel, pageW / 2, pageH - 4, { align: "center" });

        const srcY = (page * usableH * canvas.height) / scaledH;
        const slicePxH = Math.min((usableH * canvas.height) / scaledH, canvas.height - srcY);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = slicePxH;
        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, slicePxH, 0, 0, canvas.width, slicePxH);
        const drawH = (slicePxH / canvas.height) * scaledH;
        pdf.addImage(sliceCanvas.toDataURL("image/jpeg", 0.95), "JPEG", margin, margin + headerSpace, scaledW, drawH);
      }
      pdf.save(`${fileName}.pdf`);
    } catch {
      alert("PDF generation failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }, [printRef, pdfLoading, fileName, headerLabel, footerLabel]);

  if (variant === "icon") {
    return (
      <button onClick={handleDownloadPdf} disabled={pdfLoading}
        className="p-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50">
        {pdfLoading ? <Loader2 size={15} className="animate-spin" /> : <Printer size={15} />}
      </button>
    );
  }

  return (
    <button onClick={handleDownloadPdf} disabled={pdfLoading}
      className={`flex items-center gap-2.5 px-6 sm:px-8 py-3.5 bg-gradient-to-r ${gradientClass} text-white rounded-2xl font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0`}>
      {pdfLoading ? <><Loader2 size={17} className="animate-spin" /> Generating PDF…</> : <><Printer size={17} /> Download as PDF</>}
    </button>
  );
}