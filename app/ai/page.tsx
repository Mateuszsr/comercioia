"use client";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

const SUGGESTIONS = [
  "Qual meu produto mais rentável?",
  "Quem devo fidelizar?",
  "Quando devo fazer promoção?",
  "Quais produtos vendo juntos?",
  "Como aumentar meu faturamento?",
  "Quando repor estoque?",
];

export default function AIPage() {
  const [insights, setInsights] = useState<any>(null);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Olá! 👋 Sou seu assistente de negócios inteligente.\n\nPosso analisar seus dados de vendas, clientes, estoque e horários para te ajudar a tomar decisões melhores.\n\nMe faça uma pergunta sobre seu negócio!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/insights").then(r => r.json()).then(setInsights);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, context: insights }),
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: "assistant", text: data.text || "Erro ao processar." }]);
    setLoading(false);
  };

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "calc(100vh - 100px)" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>🤖 Assistente IA</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>Alimentado por Claude · Analisa seus dados em tempo real</p>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 10, flexShrink: 0, alignSelf: "flex-end" }}>🤖</div>
              )}
              <div style={{
                maxWidth: "75%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.role === "user" ? "linear-gradient(135deg, #f97316, #fb923c)" : "#1a1a26",
                border: m.role === "assistant" ? "1px solid var(--border)" : "none",
                fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
              }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
              <div style={{ display: "flex", gap: 5, padding: "12px 16px", background: "#1a1a26", borderRadius: 16, border: "1px solid var(--border)" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316", animation: `bounce 0.8s ${i * 0.15}s infinite alternate` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} disabled={loading} style={{
              background: "transparent", border: "1px solid var(--border)", borderRadius: 8,
              color: "var(--muted)", padding: "6px 12px", fontSize: 12, transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as any).style.borderColor = "#f97316"; (e.currentTarget as any).style.color = "#f97316"; }}
              onMouseLeave={e => { (e.currentTarget as any).style.borderColor = "var(--border)"; (e.currentTarget as any).style.color = "var(--muted)"; }}
            >{s}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ex: Qual foi meu melhor produto essa semana?"
            disabled={loading}
          />
          <button className="btn-primary" onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: "10px 20px", whiteSpace: "nowrap" }}>
            Enviar
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce { from { opacity: 0.3; transform: translateY(0) } to { opacity: 1; transform: translateY(-4px) } }`}</style>
    </AppShell>
  );
}
