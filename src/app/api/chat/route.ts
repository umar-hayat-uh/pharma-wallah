import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Pharmawallah AI Assistant, a knowledgeable and friendly pharmacy tutor.
You help pharmacy students, healthcare professionals, and anyone interested in pharmaceutical sciences.

Provide accurate, clear, and educational answers about:
- Drug mechanisms of action (MOA)
- Drug classifications and therapeutic uses
- Pharmacokinetics and pharmacodynamics
- Clinical pharmacy and patient care
- Pharmaceutical calculations
- Study tips and exam preparation (GPAT, NIPER, etc.)
- Pharmacy career guidance

Guidelines:
- If a question is outside pharmacy/healthcare, politely steer the conversation back.
- Always prioritise safety: if a question involves medical advice for a specific patient, recommend consulting a qualified healthcare provider.
- Keep answers concise but informative.
- Use bullet points or short paragraphs for readability.
- Use markdown formatting where it improves clarity (bold key terms, use lists for classifications, etc.).`;

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error. API key missing." },
        { status: 500 },
      );
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required." },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Build Gemini-compatible history from all messages except the last one.
    // Rules: must start with "user", must alternate user/model, skip leading assistant messages.
    const history: { role: "user" | "model"; parts: { text: string }[] }[] = [];

    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      const role = msg.role === "user" ? "user" : "model";

      // Skip leading assistant/model messages — Gemini history must start with user
      if (history.length === 0 && role !== "user") continue;

      // Skip consecutive same-role messages (Gemini requires strict alternation)
      if (history.length > 0 && history[history.length - 1].role === role)
        continue;

      history.push({ role, parts: [{ text: msg.content }] });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const latestMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(latestMessage);
    const text = result.response.text();

    return NextResponse.json({ message: text });
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get response from AI. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
