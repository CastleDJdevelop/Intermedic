"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Menu, X, Moon, Sun, Heart, Activity } from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORIES } from "./data";

function useOutsideClose(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

interface HeaderProps {
  dark: boolean;
  setDark: (v: boolean) => void;
  view: "home" | "catalog";
  goHome: () => void;
  goCatalog: () => void;
  scrollHome: (id: string) => void;
  mobileMenu: boolean;
  setMobileMenu: (v: boolean) => void;
  openQuote: (p: Product | null) => void;
  favCount: number;
}

export function Header({ dark, setDark, view, goHome, goCatalog, scrollHome, mobileMenu, setMobileMenu, openQuote, favCount }: HeaderProps) {
  return (
    <header className="im-nav-glass im-border-b" style={{ position: "sticky", top: 0, zIndex: 40 }}>
      <div className="im-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        <button onClick={goHome} className="im-focus" style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, var(--primary), var(--teal))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={18} color="#fff" strokeWidth={2.25} />
          </div>
          <span className="im-display" style={{ fontSize: 19, fontWeight: 700 }}>INTERMEDIC</span>
        </button>

        <nav className="im-ink-soft" style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 14.5, fontWeight: 500 }} aria-label="Navegación principal">
          <button onClick={goHome} className="im-focus" style={{ background: "none", border: "none", cursor: "pointer", color: view === "home" ? "var(--ink)" : "inherit" }}>Inicio</button>
          <button onClick={goCatalog} className="im-focus" style={{ background: "none", border: "none", cursor: "pointer", color: view === "catalog" ? "var(--ink)" : "inherit" }}>Catálogo</button>
          <button onClick={() => scrollHome("sectores")} className="im-focus im-hide-sm" style={{ background: "none", border: "none", cursor: "pointer" }}>Sectores</button>
          <button onClick={() => scrollHome("servicios")} className="im-focus im-hide-sm" style={{ background: "none", border: "none", cursor: "pointer" }}>Servicios</button>
          <button onClick={() => scrollHome("contacto")} className="im-focus im-hide-sm" style={{ background: "none", border: "none", cursor: "pointer" }}>Contacto</button>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setDark(!dark)} aria-label="Cambiar tema" className="im-btn-icon im-focus" style={{ width: 36, height: 36 }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={goCatalog} aria-label="Favoritos" className="im-btn-icon im-focus im-hide-sm" style={{ width: 36, height: 36, position: "relative" }}>
            <Heart size={16} />
            {favCount > 0 && <span className="im-mono" style={{ position: "absolute", top: -4, right: -4, background: "var(--primary)", color: "#fff", fontSize: 10, borderRadius: 999, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{favCount}</span>}
          </button>
          <button onClick={() => openQuote(null)} className="im-btn im-btn-primary im-focus im-hide-sm" style={{ padding: "9px 18px", fontSize: 14 }}>Cotizar</button>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="im-btn-icon im-focus" style={{ width: 36, height: 36, display: "none" }} aria-label="Menú">
            {mobileMenu ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}

interface SmartSearchProps {
  products: Product[];
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  variant?: "hero" | "header";
}

export function SmartSearch({ products, value, onChange, onSubmit, variant = "hero" }: SmartSearchProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, () => setOpen(false));

  const matches = useMemo(() => {
    if (!value.trim()) return { products: [] as Product[], cats: [] as typeof CATEGORIES };
    const q = value.toLowerCase();
    const prods = products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)).slice(0, 5);
    const cats = CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 3);
    return { products: prods, cats };
  }, [value, products]);

  const big = variant === "hero";

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(value); setOpen(false); }} style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={big ? 19 : 16} className="im-ink-faint" style={{ position: "absolute", left: big ? 18 : 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={big ? 'Busque por producto, categoría o marca — ej. "monitor", "autoclave", "Philips"' : "Buscar en el catálogo…"}
            className="im-input im-focus"
            style={{ width: "100%", padding: big ? "16px 16px 16px 50px" : "10px 14px 10px 40px", fontSize: big ? 15.5 : 14 }}
            aria-label="Buscar productos"
          />
        </div>
        <button type="submit" className="im-btn im-btn-primary im-focus" style={{ padding: big ? "0 26px" : "0 18px", fontSize: 14.5 }}>
          Buscar
        </button>
      </form>

      {open && value.trim() && (matches.products.length > 0 || matches.cats.length > 0) && (
        <div className="im-surface im-border im-shadow-lg" style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, borderRadius: 14, padding: 8, zIndex: 50, maxHeight: 380, overflowY: "auto" }}>
          {matches.cats.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <div className="im-ink-faint im-mono" style={{ fontSize: 11, padding: "6px 10px", textTransform: "uppercase", letterSpacing: ".05em" }}>Categorías</div>
              {matches.cats.map((c) => (
                <button key={c.id} onClick={() => { onSubmit(c.name); setOpen(false); }} className="im-focus" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", background: "none", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
                  <c.icon size={15} className="im-primary" />
                  <span style={{ fontSize: 14 }}>{c.name}</span>
                </button>
              ))}
            </div>
          )}
          {matches.products.length > 0 && (
            <div>
              <div className="im-ink-faint im-mono" style={{ fontSize: 11, padding: "6px 10px", textTransform: "uppercase", letterSpacing: ".05em" }}>Productos</div>
              {matches.products.map((p) => (
                <button key={p.id} onClick={() => { onSubmit(p.name); setOpen(false); }} className="im-focus" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", background: "none", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: `linear-gradient(135deg, ${(p.images ?? ["#0057D9", "#00B39E"])[0]}, ${(p.images ?? ["#0057D9", "#00B39E"])[1]})`, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div className="im-ink-faint" style={{ fontSize: 12 }}>{p.category} · {p.brand}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
