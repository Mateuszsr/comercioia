"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #f97316, #a855f7)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🏪</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>ComércioIA</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Acesse sua conta</p>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          {error && <div style={{ background: "#ef444422", border: "1px solid #ef444444", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444" }}>{error}</div>}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "12px 20px", fontSize: 15 }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
            Não tem conta?{" "}
            <Link href="/register" style={{ color: "#f97316", textDecoration: "none", fontWeight: 600 }}>Cadastre-se grátis</Link>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
            🔑 Demo: <code style={{ color: "#f97316" }}>demo@comercioia.com</code> / <code style={{ color: "#f97316" }}>demo123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
