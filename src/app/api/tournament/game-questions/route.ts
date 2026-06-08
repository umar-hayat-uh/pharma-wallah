import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// Temporary built‑in question bank – you can replace this with your own later
const BUILT_IN_MCQS = [
    { question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0 },
    { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 },
    { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], answer: 2 },
    { question: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Ribonucleic Acid", "Deoxyribose Nucleic Acid", "Dinitrogen Acid"], answer: 0 },
    { question: "Which organ produces insulin?", options: ["Liver", "Pancreas", "Kidney", "Heart"], answer: 1 },
    { question: "What is the normal pH of blood?", options: ["7.0", "7.2", "7.4", "7.6"], answer: 2 },
    { question: "Which vitamin is produced when skin is exposed to sunlight?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], answer: 3 },
    { question: "What is the main function of hemoglobin?", options: ["Fight infection", "Carry oxygen", "Digest food", "Regulate temperature"], answer: 1 },
    { question: "Which of the following is an antibiotic?", options: ["Aspirin", "Penicillin", "Paracetamol", "Ibuprofen"], answer: 1 },
    { question: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Skin", "Brain"], answer: 2 },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const game = searchParams.get("game");

    if (!code || !game) {
        return NextResponse.json({ error: "Missing code or game type" }, { status: 400 });
    }

    const supabase = await createServiceSupabaseClient();

    // Validate code and check attempts
    const { data: entry, error: entryError } = await supabase
        .from("entry_codes")
        .select("*")
        .eq("code", code)
        .single();

    if (entryError || !entry) {
        return NextResponse.json({ error: "Invalid entry code" }, { status: 401 });
    }

    const { count, error: countError } = await supabase
        .from("tournament_scores")
        .select("*", { count: "exact", head: true })
        .eq("entry_code", code);

    if (countError) {
        return NextResponse.json({ error: "Failed to verify attempts" }, { status: 500 });
    }

    const allowedAttempts = (entry.max_retries || 0) + 1;
    if (count !== null && count >= allowedAttempts) {
        return NextResponse.json({ error: "No attempts left for this code" }, { status: 403 });
    }

    let questions: any[] = [];

    if (game === "mcq") {
        // Pick 10 random questions from the built‑in bank
        const shuffled = [...BUILT_IN_MCQS].sort(() => Math.random() - 0.5);
        questions = shuffled.slice(0, 10);
    } else {
        return NextResponse.json({ error: `${game} is not yet implemented` }, { status: 501 });
    }

    return NextResponse.json({
        questions,
        code,
        game,
        attemptNumber: (count || 0) + 1,
    });
}