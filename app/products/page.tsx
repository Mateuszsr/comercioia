"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", stock: "", minStock: "5" });
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/products").then(r => r.json()).then(p => { setProducts(p); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", price: "", stock: "", minStock: "5" });
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover produto?")) return;
    await fetch("/api/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await load();
  };

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Produtos</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{products.length} produtos cadastrados</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancelar" : "+ Novo Produto"}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Novo Produto</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[["Nome", "name", "text"], ["Preço (R$)", "price", "number"], ["Estoque", "stock", "number"], ["Estoque Mín.", "minStock", "number"]].map(([label, key, type]) => (
                <div key={key} style={{ flex: 1, minWidth: 130 }}>
                  <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={label} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "💾 Salvar Produto"}
              </button>
            </div>
          </div>
        )}

        <div className="card">
          {loading ? <div style={{ color: "var(--muted)", fontSize: 14 }}>Carregando...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {products.length === 0 && <div style={{ color: "var(--muted)", fontSize: 14 }}>Nenhum produto cadastrado ainda.</div>}
              {products.map((p: any) => {
                const low = p.stock <= p.minStock;
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#0d0d16", borderRadius: 10, border: `1px solid ${low ? "#ef444433" : "var(--border)"}` }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f9731622", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                        Estoque: <span style={{ color: low ? "#ef4444" : "#22c55e", fontWeight: 600 }}>{p.stock}</span> un. (mín: {p.minStock})
                        {low && " ⚠️ Baixo!"}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#22c55e", fontFamily: "monospace", marginRight: 12 }}>R${p.price.toFixed(2)}</div>
                    <button onClick={() => handleDelete(p.id)} style={{ background: "#ef444411", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>🗑</button>
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
