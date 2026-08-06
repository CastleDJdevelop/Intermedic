"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Layers, ArrowLeftRight, Warehouse as WarehouseIcon, Truck, BarChart3, Activity, X,
} from "lucide-react";
import type { Warehouse } from "@/lib/types";
import { useWarehouseFilter } from "./InventoryContext";

const WAREHOUSE_NAMES: Warehouse[] = ["Bodega Central", "Sucursal Zona 10", "Sucursal Quetzaltenango", "Sucursal Escuintla"];

const NAV = [
  { href: "/inventario/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventario/productos", label: "Productos", icon: Package },
  { href: "/inventario/categorias", label: "Categorías", icon: Layers },
  { href: "/inventario/movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/inventario/bodegas", label: "Bodegas", icon: WarehouseIcon },
  { href: "/inventario/proveedores", label: "Proveedores", icon: Truck },
  { href: "/inventario/reportes", label: "Reportes", icon: BarChart3 },
];

interface SidebarProps {
  dark: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export function Sidebar({ dark, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { warehouseFilter, setWarehouseFilter } = useWarehouseFilter();
  const bg = dark ? "#060D16" : "#0B1B2B";
  const inkSoft = dark ? "#7C8FA1" : "#C7D3DE";

  return (
    <>
      <aside
        id="inv-sidebar"
        className="im-scrollbar-none"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 236, background: bg, padding: "20px 14px",
          display: "flex", flexDirection: "column", zIndex: 50, overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 22 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, var(--primary), var(--teal))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Activity size={15} color="#fff" strokeWidth={2.25} />
          </div>
          <div>
            <div className="im-display" style={{ color: "#fff", fontSize: 15, fontWeight: 700, lineHeight: 1 }}>INTERMEDIC</div>
            <div style={{ color: inkSoft, fontSize: 10.5, marginTop: 2 }}>Inventario</div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="im-focus" id="inv-sidebar-close" style={{ marginLeft: "auto", background: "none", border: "none", color: inkSoft, cursor: "pointer", display: "none" }} aria-label="Cerrar menú">
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "0 8px", marginBottom: 16 }}>
          <div style={{ color: inkSoft, fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Bodega activa</div>
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value as Warehouse | "Todas")}
            className="im-focus"
            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 12.5, padding: "7px 8px" }}
          >
            <option value="Todas">Todas las bodegas</option>
            {WAREHOUSE_NAMES.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
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
        <div onClick={() => setMobileOpen(false)} id="inv-sidebar-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 45, display: "none" }} />
      )}

      <style>{`
        @media (max-width: 900px) {
          #inv-sidebar { transform: translateX(${mobileOpen ? "0" : "-100%"}); transition: transform .25s ease; }
          #inv-sidebar-close { display: flex !important; }
          #inv-sidebar-backdrop { display: block !important; }
        }
      `}</style>
    </>
  );
}
