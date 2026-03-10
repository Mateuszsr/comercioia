"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STORE_TYPES = [
  { value: "generic", label: "🏪 Comércio Geral" },
  { value: "restaurant", label: "🍕 Restaurante / Pizzaria" },
  { value: "market", label: "🛒 Mercadinho / Varejo" },
  { value: "salon", label: "💄 Salão de Beleza" },
  { value: "tech", label: "📱 Assistência Técnica" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", type: "generic" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao cadastrar");
      setLoading(false);
    } else {
      router.push("/login?registered=1");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #f97316, #a855f7)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🏪</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>ComércioIA</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Crie sua conta grátis</p>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>Nome do seu negócio</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Pizzaria do João" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>Tipo de negócio</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {STORE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="seu@email.com" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>Senha</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 6 caracteres" />
          </div>

          {error && <div style={{ background: "#ef444422", border: "1px solid #ef444444", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444" }}>{error}</div>}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "12px 20px", fontSize: 15 }}>
            {loading ? "Cadastrando..." : "Criar conta grátis"}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
            Já tem conta?{" "}
            <Link href="/login" style={{ color: "#f97316", textDecoration: "none", fontWeight: 600 }}>Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
