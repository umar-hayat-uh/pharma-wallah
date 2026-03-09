import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Pharmacy‑specific system prompt
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

If a question is outside pharmacy/healthcare, politely steer the conversation back.
Always prioritise safety: if a question involves medical advice for a specific patient, recommend consulting a qualified healthcare provider.
Keep answers concise but informative. Use bullet points or short paragraphs for readability.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Build history for Gemini (must start with user and alternate)
    const history = [];
    let lastRole: string | null = null;

    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      const role = msg.role === "user" ? "user" : "model";

      if (role === lastRole) continue;
      if (history.length === 0 && role !== "user") continue;

      history.push({
        role,
        parts: [{ text: msg.content }],
      });
      lastRole = role;
    }

    // ✅ Use the stable, free‑tier‑friendly gemini-2.5-flash model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const latestMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(latestMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response from AI. Please try again." },
      { status: 500 }
    );
  }
}