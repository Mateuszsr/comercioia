"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/clients").then(r => r.json()).then(c => { setClients(c); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", phone: "", email: "" });
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover cliente?")) return;
    await fetch("/api/clients", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await load();
  };

  const COLORS = ["#f97316", "#a855f7", "#3b82f6", "#22c55e", "#ef4444"];

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Clientes</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{clients.length} clientes cadastrados</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancelar" : "+ Novo Cliente"}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Novo Cliente</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[["Nome *", "name", "text"], ["Telefone", "phone", "tel"], ["Email", "email", "email"]].map(([label, key, type]) => (
                <div key={key} style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={label} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "💾 Salvar Cliente"}
              </button>
            </div>
          </div>
        )}

        <div className="card">
          {loading ? <div style={{ color: "var(--muted)", fontSize: 14 }}>Carregando...</div> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {clients.length === 0 && <div style={{ color: "var(--muted)", fontSize: 14 }}>Nenhum cliente cadastrado ainda.</div>}
              {clients.map((c: any, i: number) => {
                const color = COLORS[i % COLORS.length];
                return (
                  <div key={c.id} style={{ background: "#0d0d16", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color }}>
                        {c.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{c._count.sales} compras</div>
                      </div>
                    </div>
                    {c.phone && <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>📞 {c.phone}</div>}
                    {c.email && <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>✉️ {c.email}</div>}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button onClick={() => handleDelete(c.id)} style={{ background: "#ef444411", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 8, padding: "5px 10px", fontSize: 11 }}>Remover</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
