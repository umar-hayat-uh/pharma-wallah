"use client";

import { useState, useRef, useCallback } from "react";
import { Pill, Upload, X, Loader2, AlertCircle, Table, Download, ShieldAlert } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface DrugInfo {
    brandName: string;
    genericName: string;
    indication: string;
    mechanismOfAction: string;
    dosageChild: string;
    dosageAdult: string;
    dosageElderly: string;
    sideEffects: string;
}

export default function PrescriptionReaderPage() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [drugs, setDrugs] = useState<DrugInfo[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setDrugs(null);
        setError(null);
    };

    const clearImage = () => {
        setSelectedImage(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setDrugs(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async () => {
        if (!selectedImage) return;
        setLoading(true);
        setError(null);
        try {
            const base64 = await convertToBase64(selectedImage);
            const res = await fetch("/api/prescription-reader-v2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64: base64 }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Analysis failed");
            setDrugs(data.drugs);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = useCallback(async () => {
        if (!drugs || drugs.length === 0) return;

        const pdfContent = document.createElement("div");
        pdfContent.style.width = "800px";
        pdfContent.style.padding = "40px";
        pdfContent.style.backgroundColor = "#ffffff";
        pdfContent.style.fontFamily = "'Helvetica', 'Arial', sans-serif";
        pdfContent.style.color = "#1e293b";
        pdfContent.style.position = "absolute";
        pdfContent.style.top = "-9999px";
        pdfContent.style.left = "-9999px";

        pdfContent.innerHTML = `
      <div style="margin-bottom: 30px; text-align: center; border-bottom: 3px solid #4ade80; padding-bottom: 15px;">
        <div style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #2563eb, #4ade80); -webkit-background-clip: text; background-clip: text; color: transparent;">PharmaWallah</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 5px;">AI Prescription Analysis Report</div>
      </div>
      <div style="margin-bottom: 20px;">
        <div style="font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Report Date: ${new Date().toLocaleString()}</span>
          <span>Document ID: PW-${Date.now().toString().slice(-8)}</span>
        </div>
      </div>
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px 0; color: #0f172a;">Extracted Drug Information</h2>
        <p style="font-size: 11px; color: #475569; margin-bottom: 15px;">The following medications were identified from the uploaded prescription. Dosage recommendations are based on standard medical references and should be verified by a healthcare professional.</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 20px;">
        <thead>
          <tr style="background: linear-gradient(135deg, #eff6ff, #f0fdf4);">
            <th style="border: 1px solid #e2e8f0; padding: 8px 6px; text-align: left; font-weight: 700;">Brand</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px 6px; text-align: left; font-weight: 700;">Generic</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px 6px; text-align: left; font-weight: 700;">Indication</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px 6px; text-align: left; font-weight: 700;">MOA</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px 6px; text-align: left; font-weight: 700;">Dosage (Child)</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px 6px; text-align: left; font-weight: 700;">Dosage (Adult)</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px 6px; text-align: left; font-weight: 700;">Dosage (Elderly)</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px 6px; text-align: left; font-weight: 700;">Side Effects</th>
          </tr>
        </thead>
        <tbody>
          ${drugs
                .map(
                    (drug) => `
            <tr>
              <td style="border: 1px solid #e2e8f0; padding: 6px; vertical-align: top; font-weight: 600;">${escapeHtml(drug.brandName)}</td>
              <td style="border: 1px solid #e2e8f0; padding: 6px; vertical-align: top;">${escapeHtml(drug.genericName)}</td>
              <td style="border: 1px solid #e2e8f0; padding: 6px; vertical-align: top;">${escapeHtml(drug.indication)}</td>
              <td style="border: 1px solid #e2e8f0; padding: 6px; vertical-align: top;">${escapeHtml(drug.mechanismOfAction)}</td>
              <td style="border: 1px solid #e2e8f0; padding: 6px; vertical-align: top;">${escapeHtml(drug.dosageChild)}</td>
              <td style="border: 1px solid #e2e8f0; padding: 6px; vertical-align: top;">${escapeHtml(drug.dosageAdult)}</td>
              <td style="border: 1px solid #e2e8f0; padding: 6px; vertical-align: top;">${escapeHtml(drug.dosageElderly)}</td>
              <td style="border: 1px solid #e2e8f0; padding: 6px; vertical-align: top;">${escapeHtml(drug.sideEffects)}</td>
            </tr>
          `
                )
                .join("")}
        </tbody>
      </table>
      <!-- Disclaimer Section inside PDF -->
      <div style="margin-top: 30px; padding: 15px; background-color: #fefce8; border-left: 4px solid #eab308; font-size: 8px; color: #854d0e; text-align: left;">
        <strong>⚠️ EDUCATIONAL DISCLAIMER</strong><br/>
        This report is generated by artificial intelligence for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or prescription. Never disregard professional medical advice or delay in seeking it because of something you have read here. PharmaWallah does not endorse or guarantee the accuracy, completeness, or usefulness of any AI‑generated content.
      </div>
      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 8px; color: #94a3b8; text-align: center;">
        <p>PharmaWallah – Pharmacy eLearning Platform | www.pharmawallah.com</p>
      </div>
    `;

        document.body.appendChild(pdfContent);

        try {
            const canvas = await html2canvas(pdfContent, { scale: 2, backgroundColor: "#ffffff", logging: false });
            document.body.removeChild(pdfContent);

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`prescription-report-${Date.now()}.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
        }
    }, [drugs]);

    const escapeHtml = (str: string) => {
        if (!str) return "";
        return str.replace(/[&<>]/g, (m) => {
            if (m === "&") return "&amp;";
            if (m === "<") return "&lt;";
            if (m === ">") return "&gt;";
            return m;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 pt-10">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 shadow-lg mb-3 sm:mb-4">
                        <Pill className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">Prescription Reader</h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto px-2">
                        Upload an image – AI extracts brand & generic names, dosages (child/adult/elderly), indication, MOA, and side effects.
                    </p>
                </div>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
                    {/* Upload Area */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-blue-600" /> Upload Prescription
                        </h2>

                        <div
                            onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file && file.type.startsWith("image/")) handleFileSelect(file);
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:border-blue-400 transition cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {!previewUrl ? (
                                <>
                                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mx-auto mb-2 sm:mb-3" />
                                    <p className="text-xs sm:text-sm text-gray-500">Click or drag & drop an image</p>
                                    <p className="text-[11px] sm:text-xs text-gray-400 mt-1">JPG, PNG (max 10MB)</p>
                                </>
                            ) : (
                                <div className="relative">
                                    <img src={previewUrl} alt="Prescription" className="max-h-48 sm:max-h-64 mx-auto rounded-lg shadow" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!selectedImage || loading}
                            className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Pill size={18} /> Analyze Prescription</>}
                        </button>
                    </div>

                    {/* Results */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Table className="w-5 h-5 text-green-600" /> Extracted Drug Information
                            </h2>
                            {drugs && drugs.length > 0 && (
                                <button
                                    onClick={generatePDF}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition"
                                >
                                    <Download size={14} /> PDF Report
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex gap-2">
                                <AlertCircle size={18} className="shrink-0" /> {error}
                            </div>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="animate-spin w-8 h-8 text-blue-500 mb-3" />
                                <p className="text-gray-500 text-sm">AI is analyzing the prescription using Gemini 2.5 Flash...</p>
                            </div>
                        )}

                        {drugs && !loading && (
                            <div>
                                {drugs.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No drugs could be extracted. Try a clearer image.</p>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm border-collapse">
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                                        <th className="px-2 py-2 text-left font-semibold text-gray-800 border text-xs">Brand</th>
                                                        <th className="px-2 py-2 text-left font-semibold text-gray-800 border text-xs">Generic</th>
                                                        <th className="px-2 py-2 text-left font-semibold text-gray-800 border text-xs">Indication</th>
                                                        <th className="px-2 py-2 text-left font-semibold text-gray-800 border text-xs">MOA</th>
                                                        <th className="px-2 py-2 text-left font-semibold text-gray-800 border text-xs">Dosage (Child)</th>
                                                        <th className="px-2 py-2 text-left font-semibold text-gray-800 border text-xs">Dosage (Adult)</th>
                                                        <th className="px-2 py-2 text-left font-semibold text-gray-800 border text-xs">Dosage (Elderly)</th>
                                                        <th className="px-2 py-2 text-left font-semibold text-gray-800 border text-xs">Side Effects</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {drugs.map((drug, idx) => (
                                                        <tr key={idx} className="border-b hover:bg-gray-50">
                                                            <td className="px-2 py-2 font-medium text-gray-900 border text-xs">{drug.brandName}</td>
                                                            <td className="px-2 py-2 text-gray-700 border text-xs">{drug.genericName}</td>
                                                            <td className="px-2 py-2 text-gray-700 border text-xs">{drug.indication}</td>
                                                            <td className="px-2 py-2 text-gray-700 border text-xs">{drug.mechanismOfAction}</td>
                                                            <td className="px-2 py-2 text-gray-700 border text-xs">{drug.dosageChild}</td>
                                                            <td className="px-2 py-2 text-gray-700 border text-xs">{drug.dosageAdult}</td>
                                                            <td className="px-2 py-2 text-gray-700 border text-xs">{drug.dosageElderly}</td>
                                                            <td className="px-2 py-2 text-gray-700 border text-xs">{drug.sideEffects}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Educational Disclaimer  */}
                                        <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex gap-3">
                                            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div className="text-xs text-amber-800">
                                                <p className="font-bold mb-1">⚠️ EDUCATIONAL PURPOSE ONLY</p>
                                                <p>
                                                    This tool uses artificial intelligence to assist learning. The information provided is for educational and informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for medical decisions, prescription interpretations, or treatment plans. PharmaWallah is not liable for any actions taken based on this AI‑generated content.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}