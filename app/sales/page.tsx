"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [s, p, c] = await Promise.all([
      fetch("/api/sales?limit=50&days=30").then(r => r.json()),
      fetch("/api/products").then(r => r.json()),
      fetch("/api/clients").then(r => r.json()),
    ]);
    setSales(s); setProducts(p); setClients(c); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addItem = () => setItems(p => [...p, { productId: "", quantity: 1 }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, val: any) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const getTotal = () => items.reduce((sum, item) => {
    const prod = products.find((p: any) => p.id === item.productId);
    return sum + (prod ? prod.price * item.quantity : 0);
  }, 0);

  const handleSave = async () => {
    const validItems = items.filter(i => i.productId);
    if (!validItems.length) return;
    setSaving(true);
    await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient || null, items: validItems }),
    });
    setShowForm(false);
    setItems([{ productId: "", quantity: 1 }]);
    setSelectedClient("");
    await load();
    setSaving(false);
  };

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Vendas</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>Últimos 30 dias</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancelar" : "+ Nova Venda"}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Nova Venda</div>
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>Cliente (opcional)</label>
              <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
                <option value="">Sem cliente</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Itens</div>
              {items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                  <select value={item.productId} onChange={e => updateItem(i, "productId", e.target.value)} style={{ flex: 2 }}>
                    <option value="">Selecione o produto</option>
                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} — R${p.price}</option>)}
                  </select>
                  <input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, "quantity", parseInt(e.target.value))} style={{ width: 70 }} />
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} style={{ background: "#ef444422", border: "1px solid #ef444444", color: "#ef4444", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>✕</button>
                  )}
                </div>
              ))}
              <button className="btn-ghost" onClick={addItem} style={{ fontSize: 13, padding: "8px 14px" }}>+ Item</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Total: <span style={{ color: "#22c55e", fontFamily: "monospace" }}>R${getTotal().toFixed(2)}</span></div>
              <button className="btn-primary" onClick={handleSave} disabled={saving || !items.some(i => i.productId)}>
                {saving ? "Salvando..." : "💾 Registrar Venda"}
              </button>
            </div>
          </div>
        )}

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📋 Histórico ({sales.length} vendas)</div>
          {loading ? <div style={{ color: "var(--muted)", fontSize: 14 }}>Carregando...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sales.map((sale: any) => (
                <div key={sale.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#0d0d16", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#a855f722", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#a855f7", fontSize: 14 }}>
                    {sale.client?.name?.[0] || "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{sale.client?.name || "Cliente avulso"}</div>
                    <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>
                      {sale.items.map((i: any) => `${i.product.name} x${i.quantity}`).join(", ")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#22c55e", fontFamily: "monospace" }}>R${sale.total.toFixed(2)}</div>
                    <div style={{ color: "var(--muted)", fontSize: 11 }}>{new Date(sale.createdAt).toLocaleDateString("pt-BR")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
