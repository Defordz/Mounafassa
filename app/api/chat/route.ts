import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `Vous êtes assistant au rapporteur du Conseil de la concurrence au Maroc.
Vous répondez en français clair.
Chaque réponse doit mentionner les références juridiques pertinentes.
N'inventez jamais une référence juridique. Si la base ne suffit pas, dites-le explicitement.`;

function isValidMessages(input: unknown): input is ChatMessage[] {
  return (
    Array.isArray(input) &&
    input.every(
      (m) =>
        m &&
        typeof m === "object" &&
        (m as ChatMessage).role &&
        ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string"
    )
  );
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        reply:
          "Configuration manquante: la variable OPENAI_API_KEY n'est pas définie côté serveur (Vercel > Settings > Environment Variables).",
      },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const messages = body?.messages;

    if (!isValidMessages(messages) || messages.length === 0) {
      return NextResponse.json({ reply: "Requête invalide: aucun message utilisateur fourni." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "Je n'ai pas pu générer de réponse.";
    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          reply: `Erreur OpenAI (${error.status ?? "inconnue"}): ${error.message}. Vérifiez la clé API, le projet OpenAI et la facturation.`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { reply: "Erreur serveur inattendue. Vérifiez les logs Vercel (Functions > api/chat)." },
      { status: 500 }
    );
  }
}
