import { fmt, fmtConc, fmtUg, type ComputedChain, type ParsedDose } from "./_math";
import type { ProtocolMeta } from "./_report";

/*
 * The A4 bench protocol PDF, kept from the original page (same layout, same
 * figures). Two deliberate changes:
 *  - jsPDF is a dependency, so the CDN <script> fallback is gone — it could
 *    never run on the web and would have been network I/O inside the offline app.
 *  - "C₀" is written "C0": jsPDF's built-in Helvetica has no subscript zero and
 *    printed a garbage glyph.
 * The page hides the button in the Android app, whose WebView ignores blob
 * downloads (same rule as the kit's Download card).
 */
export async function downloadProtocolPdf(
  meta: ProtocolMeta,
  p: ParsedDose,
  chain: ComputedChain,
  tubeCount: number,
  withinTolerance: boolean,
): Promise<void> {
  const mod = await import("jspdf");
  const JsPDF = mod.jsPDF;
  const { drugName, animalSubject } = meta;
  const { nAdult, nDissolve, nTarget, nDeliver, c0 } = p;

  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const todayStr = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  // Top banner — brandBlue.
  doc.setFillColor(28, 123, 217);
  doc.rect(15, 12, 180, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("SERIAL DILUTION & ANIMAL DOSE PROTOCOL", 20, 21);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Generated: ${todayStr} | Pharmacology Bench Sheet`, 20, 26);

  // Metadata card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 34, 180, 26, 2, 2, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Drug / Compound:", 20, 40);
  doc.text("Animal Subject:", 110, 40);
  doc.text("Starting Solid:", 20, 46);
  doc.text("Stock Solution:", 110, 46);
  doc.text("Target Dose:", 20, 52);
  doc.text("Syringe Volume:", 110, 52);

  doc.setFont("helvetica", "normal");
  doc.text(`${drugName || "Unspecified"}`, 52, 40);
  doc.text(`${animalSubject || "Lab Animal"}`, 140, 40);
  doc.text(`${fmt(nAdult)} mg`, 52, 46);
  doc.text(`${fmt(nDissolve)} ml (C0 = ${fmtConc(c0)} mg/ml)`, 140, 46);
  doc.text(`${fmt(nTarget)} mg (${fmtUg(nTarget)})`, 52, 52);
  doc.text(`${fmt(nDeliver)} ml`, 140, 52);

  // Steps table header
  let y = 66;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(28, 123, 217);
  doc.text("Stepwise Bench Instructions", 15, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 180, 7.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Check", 18, y + 5);
  doc.text("Tube / Step", 32, y + 5);
  doc.text("Aliquot", 65, y + 5);
  doc.text("Diluent", 92, y + 5);
  doc.text("Total Vol", 120, y + 5);
  doc.text("Concentration", 148, y + 5);
  doc.text("Ratio", 175, y + 5);
  y += 7.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  chain.rows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 180, 7.5, "F");
    }
    doc.setTextColor(15, 23, 42);
    doc.text("[  ]", 18, y + 5);

    if (r.kind === "stock") {
      doc.text("Stock (Tube 0)", 32, y + 5);
      doc.text("—", 65, y + 5);
      doc.text(`${fmt(nDissolve)} ml`, 92, y + 5);
      doc.text(`${fmt(nDissolve)} ml`, 120, y + 5);
      doc.text(`${fmtConc(c0)} mg/ml`, 148, y + 5);
      doc.text("1:1", 175, y + 5);
    } else {
      doc.text(`Tube ${r.stepNumber}`, 32, y + 5);
      doc.text(`${fmt(r.aliquot)} ml`, 65, y + 5);
      doc.text(`${fmt(r.addDiluent)} ml`, 92, y + 5);
      doc.text(`${fmt(r.newTotalVol)} ml`, 120, y + 5);
      doc.text(`${fmtConc(r.conc)} mg/ml`, 148, y + 5);
      doc.text(`1:${fmt(r.dilutionFactor, 1)}×`, 175, y + 5);
    }
    y += 7.5;
  });

  // Injection callout
  y += 5;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(15, y, 180, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105);
  doc.text("[  ] Final Administration (Syringe Draw)", 20, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`• Draw exactly ${fmt(nDeliver)} ml from Tube ${tubeCount} using a sterile precision syringe.`, 20, y + 11.5);
  doc.text(
    `• Delivered Dose: ${fmt(chain.doseDelivered, 5)} mg (${fmtUg(chain.doseDelivered)}) | Target: ${fmt(nTarget)} mg (${fmtUg(nTarget)})`,
    20,
    y + 16.5,
  );
  doc.text(
    `• Dose Match: ${chain.doseError >= 0 ? "+" : ""}${fmt(chain.doseError, 2)}% ${
      withinTolerance ? "(Within ±5% Tolerance)" : "(Review Volumes)"
    }`,
    120,
    y + 16.5,
  );

  // Signatures
  y += 32;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, 90, y);
  doc.line(105, y, 180, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Researcher / Student Signature & Date", 15, y + 4.5);
  doc.text("Lab Instructor / Witness Sign-off", 105, y + 4.5);

  const fileName = `${(drugName || "serial-dilution").toLowerCase().replace(/[^a-z0-9]/g, "-")}-protocol.pdf`;
  doc.save(fileName);
}
