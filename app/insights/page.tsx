"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

function InsightCard({ icon, title, body, color = "#f97316", badge }: any) {
  return (
    <div style={{ background: "var(--card)", border: `1px solid ${color}33`, borderRadius: 14, padding: 18, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
        </div>
        {badge && <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{badge}</span>}
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>{body}</div>
    </div>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/insights").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <AppShell><div style={{ color: "var(--muted)", fontSize: 14 }}>Carregando insights...</div></AppShell>;

  const topDay = data.salesByDay.reduce((max: any, d: any) => d.value > (max?.value || 0) ? d : max, null);
  const worstDay = data.salesByDay.reduce((min: any, d: any) => d.value < (min?.value ?? 999) ? d : min, null);

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Insights</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>Padrões detectados automaticamente nos últimos 30 dias</p>
        </div>

        {data.topProducts[0] && (
          <InsightCard icon="🏆" title="Produto mais vendido" color="#f97316" badge="Top #1"
            body={`${data.topProducts[0].name} liderou com ${data.topProducts[0].qty} unidades e R$${data.topProducts[0].revenue.toFixed(2)} em receita. Garanta estoque sempre disponível.`} />
        )}
        {data.topClients[0] && (
          <InsightCard icon="👑" title="Cliente mais fiel" color="#a855f7" badge="Fidelidade"
            body={`${data.topClients[0].name} visitou ${data.topClients[0].visits}x. Considere criar um programa de fidelidade ou oferecer desconto exclusivo para retê-lo.`} />
        )}
        {topDay && topDay.value > 0 && (
          <InsightCard icon="📅" title="Dia de pico" color="#3b82f6" badge="Atenção"
            body={`${topDay.name} concentra o maior volume de vendas (${topDay.value} pedidos). Garanta equipe completa, estoque reforçado e preparo extra nesse dia.`} />
        )}
        {worstDay && (
          <InsightCard icon="📉" title="Dia mais fraco" color="#64748b" badge="Oportunidade"
            body={`${worstDay.name} é seu dia com menos movimento (${worstDay.value} pedidos). Considere criar promoções ou combos especiais para atrair clientes nesse dia.`} />
        )}
        <InsightCard icon="⏰" title="Horário de pico" color="#22c55e" badge="Pico"
          body={`A faixa das ${data.peakHour}h–${data.peakHour + 1}h concentra o maior número de pedidos. Priorize atendimento, preparo e equipe completa nesse horário.`} />
        {data.topCombos.length > 0 && (
          <InsightCard icon="🔗" title="Combos sugeridos pela IA" color="#fb923c" badge="Combo 🔥"
            body={
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {data.topCombos.map((c: any) => (
                  <li key={c.combo}><strong>{c.combo}</strong> — comprados juntos {c.count}x. Crie um combo com desconto!</li>
                ))}
              </ul>
            } />
        )}
        {data.lowStock.length > 0 && (
          <InsightCard icon="📦" title="Produtos com estoque baixo" color="#ef4444" badge="Urgente"
            body={
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {data.lowStock.map((p: any) => (
                  <li key={p.id}><strong>{p.name}</strong>: {p.stock} unidades restantes (mínimo: {p.minStock}). Reponha o quanto antes!</li>
                ))}
              </ul>
            } />
        )}

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📊 Desempenho por produto (30d)</div>
          {data.topProducts.map((p: any, i: number) => (
            <div key={p.name} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ color: "var(--muted)" }}>{p.qty}x · R${p.revenue.toFixed(2)}</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${(p.qty / data.topProducts[0].qty) * 100}%`, background: `linear-gradient(to right, #f97316, #a855f7)`, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
