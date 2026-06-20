import { NextRequest, NextResponse } from 'next/server';

// POST /api/scan-colonies
// Body: { imageBase64: string, mediaType?: string }
// Returns: { colonyCount: number, confidence: 'high'|'medium'|'low', confidencePercent: number, reasoning: string }
//
// Uses Google's Gemini API (generateContent) server-side so the API key never reaches the browser.
// Requires GEMINI_API_KEY in your environment. Get one at https://aistudio.google.com/apikey
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export async function POST(request: NextRequest) {
    try {
        const { imageBase64, mediaType } = await request.json();

        if (!imageBase64 || typeof imageBase64 !== 'string') {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Server is missing GEMINI_API_KEY. Add it to your environment variables.' },
                { status: 500 }
            );
        }

        const prompt = `You are an expert microbiologist analyzing a photo of a petri dish / culture plate for CFU (colony forming unit) enumeration.

Carefully count the number of distinct, countable bacterial or fungal colonies visible on the plate. Treat overlapping or merged colonies as your best estimate of distinct units, and ignore dust, condensation, scratches, glare, or reflections on the plate or lid.

Respond with ONLY raw JSON, no markdown formatting, no code fences, no preamble or explanation outside the JSON, in EXACTLY this shape:
{"colonyCount": <integer>, "confidence": "high" | "medium" | "low", "confidencePercent": <integer 0-100>, "reasoning": "<one short sentence on image quality, overlap, or edge effects affecting count reliability>"}

Guidance for confidence:
- "high" (80-100%): colonies are clearly separated, plate is in focus, good lighting, no significant glare/overlap.
- "medium" (50-79%): some overlap, mild blur/glare, or crowded areas that required estimation.
- "low" (0-49%): heavy overlap/confluent growth, poor focus or lighting, partial plate visible, or the image is otherwise hard to interpret.

If no petri dish or culture plate is visible in the image, respond with exactly:
{"colonyCount": 0, "confidence": "low", "confidencePercent": 0, "reasoning": "No petri dish or culture plate detected in the image."}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                inline_data: {
                                    mime_type: mediaType || 'image/jpeg',
                                    data: imageBase64,
                                },
                            },
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    // Ask Gemini to return strict JSON directly, no markdown fences needed
                    response_mime_type: 'application/json',
                    temperature: 0.2,
                },
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini API error:', errText);
            return NextResponse.json({ error: 'The image analysis service is unavailable right now.' }, { status: 502 });
        }

        const data = await response.json();

        // If Gemini blocked the response (safety filters, etc.) candidates will be empty
        if (!data.candidates || data.candidates.length === 0) {
            const blockReason = data.promptFeedback?.blockReason;
            console.error('Gemini returned no candidates. Block reason:', blockReason);
            return NextResponse.json({ error: 'The image could not be analyzed.' }, { status: 502 });
        }

        const rawText: string = data.candidates[0]?.content?.parts?.[0]?.text ?? '';
        const cleaned = rawText.replace(/```json|```/g, '').trim();

        let parsed: any;
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            console.error('Could not parse model response as JSON:', rawText);
            return NextResponse.json({ error: 'Could not interpret the analysis result.' }, { status: 502 });
        }

        if (typeof parsed.colonyCount !== 'number' || typeof parsed.confidence !== 'string') {
            return NextResponse.json({ error: 'Analysis result was in an unexpected format.' }, { status: 502 });
        }

        return NextResponse.json({
            colonyCount: Math.round(parsed.colonyCount),
            confidence: parsed.confidence,
            confidencePercent: typeof parsed.confidencePercent === 'number' ? parsed.confidencePercent : null,
            reasoning: parsed.reasoning ?? '',
        });
    } catch (err) {
        console.error('scan-colonies route error:', err);
        return NextResponse.json({ error: 'Unexpected server error while analyzing the image.' }, { status: 500 });
    }
}