import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Vous êtes assistant au rapporteur du Conseil de la concurrence au Maroc.
Vous répondez en français clair.
Chaque réponse doit mentionner les références juridiques pertinentes.
N'inventez jamais une référence juridique. Si la base ne suffit pas, dites-le explicitement.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m: { role: "user" | "assistant"; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "Je n'ai pas pu générer de réponse.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "Erreur serveur. Vérifiez OPENAI_API_KEY." }, { status: 500 });
  }
}
