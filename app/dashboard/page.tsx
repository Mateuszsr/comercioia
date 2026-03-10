"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

function KpiCard({ icon, label, value, sub, color = "#f97316", trend }: any) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ fontSize: 12, color: trend >= 0 ? "#22c55e" : "#ef4444", marginTop: 6 }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs semana anterior
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <AppShell>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--muted)", fontSize: 14 }}>
        Carregando dados...
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Dashboard</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>Visão geral dos últimos 30 dias</p>
        </div>

        {/* KPIs */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <KpiCard icon="💰" label="Faturamento (30d)" value={`R$${data.revenue30.toFixed(2)}`} color="#22c55e" trend={data.revenueTrend} />
          <KpiCard icon="🧾" label="Vendas (30d)" value={data.totalSales30} sub={`${data.totalSales7} essa semana`} color="#3b82f6" />
          <KpiCard icon="🏆" label="Produto Top" value={data.topProducts[0]?.name || "-"} sub={`${data.topProducts[0]?.qty || 0} unidades`} color="#f97316" />
          <KpiCard icon="👑" label="Cliente Top" value={data.topClients[0]?.name || "-"} sub={`${data.topClients[0]?.visits || 0} visitas`} color="#a855f7" />
        </div>

        {/* Charts */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div className="card" style={{ flex: 2, minWidth: 280 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📈 Faturamento — últimos 7 dias</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={data.salesLast7}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#grad)" name="Receita (R$)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📅 Vendas por dia da semana</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Vendas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>⚠️ Alertas automáticos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.lowStock.length > 0 ? data.lowStock.map((p: any) => (
              <div key={p.id} style={{ background: "#ef444411", border: "1px solid #ef444433", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
                🔴 <strong>{p.name}</strong> — estoque baixo! {p.stock} unidades (mínimo: {p.minStock})
              </div>
            )) : (
              <div style={{ background: "#22c55e11", border: "1px solid #22c55e33", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
                ✅ Todos os estoques estão OK
              </div>
            )}
            {data.topCombos[0] && (
              <div style={{ background: "#f9731611", border: "1px solid #f9731633", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
                💡 Combo detectado: <strong>{data.topCombos[0].combo}</strong> foram comprados juntos {data.topCombos[0].count}x. Crie um combo com desconto!
              </div>
            )}
            <div style={{ background: "#3b82f611", border: "1px solid #3b82f633", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
              ⏰ Horário de pico: <strong>{data.peakHour}h–{data.peakHour + 1}h</strong>. Garanta equipe completa nesse horário.
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div className="card" style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🏆 Top Produtos</div>
            {data.topProducts.map((p: any, i: number) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? "#f9731622" : "#1e1e2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: i === 0 ? "#f97316" : "var(--muted)" }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ height: 5, background: "#1e1e2e", borderRadius: 4, marginTop: 4 }}>
                    <div style={{ height: "100%", width: `${(p.qty / data.topProducts[0].qty) * 100}%`, background: "linear-gradient(to right, #f97316, #a855f7)", borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "monospace" }}>{p.qty}x</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>👑 Top Clientes</div>
            {data.topClients.map((c: any, i: number) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#a855f722", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#a855f7" }}>{c.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ height: 5, background: "#1e1e2e", borderRadius: 4, marginTop: 4 }}>
                    <div style={{ height: "100%", width: `${(c.visits / data.topClients[0].visits) * 100}%`, background: "linear-gradient(to right, #a855f7, #3b82f6)", borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{c.visits} visitas</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
