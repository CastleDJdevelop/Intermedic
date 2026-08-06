"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, UserPlus, Columns3, Building2, Users, FileText, CheckSquare, BarChart3, Activity, X, BookmarkPlus, Receipt, Settings,
} from "lucide-react";

const NAV = [
  { href: "/crm/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm/leads", label: "Leads", icon: UserPlus },
  { href: "/crm/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/crm/empresas", label: "Empresas", icon: Building2 },
  { href: "/crm/contactos", label: "Contactos", icon: Users },
  { href: "/crm/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/crm/tareas", label: "Tareas", icon: CheckSquare },
  { href: "/crm/reservas", label: "Reservas", icon: BookmarkPlus },
  { href: "/crm/facturas", label: "Facturas", icon: Receipt },
  { href: "/crm/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/crm/usuarios", label: "Usuarios", icon: Settings },
];

interface SidebarProps {
  dark: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export function Sidebar({ dark, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const bg = dark ? "#060D16" : "#0B1B2B";
  const inkSoft = dark ? "#7C8FA1" : "#C7D3DE";

  return (
    <>
      <aside
        id="crm-sidebar"
        className="im-scrollbar-none"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 232, background: bg, padding: "20px 14px",
          display: "flex", flexDirection: "column", zIndex: 50, overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 26 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, var(--primary), var(--teal))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Activity size={15} color="#fff" strokeWidth={2.25} />
          </div>
          <div>
            <div className="im-display" style={{ color: "#fff", fontSize: 15, fontWeight: 700, lineHeight: 1 }}>INTERMEDIC</div>
            <div style={{ color: inkSoft, fontSize: 10.5, marginTop: 2 }}>CRM</div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="im-focus" id="crm-sidebar-close" style={{ marginLeft: "auto", background: "none", border: "none", color: inkSoft, cursor: "pointer", display: "none" }} aria-label="Cerrar menú">
            <X size={16} />
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className="im-focus"
                style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 9,
                  fontSize: 13.5, fontWeight: 500, textDecoration: "none",
                  color: active ? "#fff" : inkSoft,
                  background: active ? "var(--primary)" : "transparent",
                }}
              >
                <n.icon size={16} /> {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} id="crm-sidebar-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 45, display: "none" }} />
      )}

      <style>{`
        @media (max-width: 900px) {
          #crm-sidebar { transform: translateX(${mobileOpen ? "0" : "-100%"}); transition: transform .25s ease; }
          #crm-sidebar-close { display: flex !important; }
          #crm-sidebar-backdrop { display: block !important; }
        }
      `}</style>
    </>
  );
}
