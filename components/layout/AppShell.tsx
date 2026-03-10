"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const NAV = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/sales", icon: "🛒", label: "Vendas" },
  { href: "/products", icon: "📦", label: "Produtos" },
  { href: "/clients", icon: "👤", label: "Clientes" },
  { href: "/insights", icon: "💡", label: "Insights" },
  { href: "/ai", icon: "🤖", label: "Assistente IA" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside style={{
      width: 220, minHeight: "100vh", background: "var(--card)",
      borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #f97316, #a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏪</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.3 }}>ComércioIA</div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{session?.user?.name || "Minha Loja"}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10, textDecoration: "none",
              background: active ? "#f9731622" : "transparent",
              color: active ? "#f97316" : "var(--muted)",
              fontWeight: active ? 700 : 500,
              fontSize: 14,
              border: `1px solid ${active ? "#f9731633" : "transparent"}`,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
        <button onClick={() => signOut({ callbackUrl: "/login" })} style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%",
          padding: "10px 12px", borderRadius: 10, background: "transparent",
          border: "1px solid transparent", color: "var(--muted)", fontSize: 14,
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#ef444444"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
        >
          <span>🚪</span> Sair
        </button>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, minHeight: "100vh", padding: 28 }}>
        {children}
      </main>
    </div>
  );
}
