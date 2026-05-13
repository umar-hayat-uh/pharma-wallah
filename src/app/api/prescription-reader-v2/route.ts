import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 60;

const MODEL_NAME = 'gemini-2.5-flash';

function getPrescriptionPrompt(): string {
    return `You are a clinical pharmacist. Analyze the uploaded prescription image. Extract every drug clearly mentioned.

Return a **valid JSON array** of objects with the following keys. Do NOT include any extra text, markdown formatting, or explanation outside the JSON.

Keys:
- brandName (string – the name written on the prescription, e.g., "Augmentin")
- genericName (string – the active ingredient(s), e.g., "Amoxicillin/Clavulanate")
- indication (string – primary therapeutic use)
- mechanismOfAction (string – brief, one sentence)
- dosageChild (string – typical children's dosage, or "Not specified" if not visible)
- dosageAdult (string – typical adult dosage)
- dosageElderly (string – elderly adjustment or "Same as adult")
- sideEffects (string – common adverse effects, comma separated)

If a dosage is not written on the prescription, provide the standard recommended dosage based on medical knowledge.
If the drug is written as a brand name, convert it to its generic equivalent for the genericName field.
For genericName, use the internationally recognized non‑proprietary name (e.g., "Paracetamol" for "Panadol").

Example output:
[
  {
    "brandName": "Augmentin",
    "genericName": "Amoxicillin/Clavulanate",
    "indication": "Bacterial infections",
    "mechanismOfAction": "Inhibits cell wall synthesis",
    "dosageChild": "25-50 mg/kg/day divided q8h",
    "dosageAdult": "500 mg q8h",
    "dosageElderly": "Same as adult, adjust for renal function",
    "sideEffects": "Diarrhea, rash, nausea"
  }
]

Only include drugs that are legible. Output ONLY the JSON array.`;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageBase64 } = body;

        if (!imageBase64 || typeof imageBase64 !== 'string') {
            return new Response(JSON.stringify({ error: 'Missing image data' }), { status: 400 });
        }

        const result = await streamText({
            model: google(MODEL_NAME),
            system: 'You are a clinical pharmacist returning JSON only.',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: getPrescriptionPrompt() },
                        { type: 'image', image: imageBase64 },
                    ],
                },
            ],
            temperature: 0.2,
            maxOutputTokens: 4096,
        });

        let fullText = '';
        for await (const chunk of result.textStream) {
            fullText += chunk;
        }

        // Fixed regex: [\s\S] matches any character including newlines (ES2017 compatible)
        const jsonMatch = fullText.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (!jsonMatch) {
            throw new Error('AI response did not contain a valid JSON array');
        }
        const drugs = JSON.parse(jsonMatch[0]);

        return new Response(JSON.stringify({ success: true, drugs }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Prescription reader error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Failed to analyze prescription' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}