"use client";

import { FormEvent, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages: Msg[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const reply = typeof data?.reply === "string" ? data.reply : "Erreur de réponse.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Erreur réseau. Vérifiez la connexion ou réessayez dans quelques secondes.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="hero">
        <h1>Assistant juridique — Conseil de la concurrence</h1>
        <p>
          Posez vos questions sur la réglementation de la concurrence au Maroc. Les réponses incluent des références
          juridiques.
        </p>
      </header>

      <section className="chatBox">
        <div className="messages">
          {messages.length === 0 ? (
            <p className="muted">Exemple: « Quelles pratiques anticoncurrentielles sont interdites au Maroc ? »</p>
          ) : (
            messages.map((m, i) => (
              <article key={i} className={`msg ${m.role}`}>
                <strong>{m.role === "user" ? "Vous" : "Assistant"}</strong>
                <p>{m.content}</p>
              </article>
            ))
          )}
          {loading && <p className="muted">L’assistant réfléchit…</p>}
        </div>

        <form onSubmit={ask} className="composer">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre question"
            aria-label="Question"
          />
          <button type="submit" disabled={loading}>
            Envoyer
          </button>
        </form>
      </section>

      <footer className="disclaimer">
        Information générale uniquement. Cette réponse ne remplace pas un avis juridique personnalisé.
      </footer>
    </main>
  );
}
