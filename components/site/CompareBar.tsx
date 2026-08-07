"use client";

import { X, Scale } from "lucide-react";
import type { Product } from "@/lib/types";
import { catIcon, formatQ, getPriceDisplay } from "./data";
import { ProductVisual } from "./shared";

interface CompareBarProps {
  products: Product[];
  ids: string[];
  clear: () => void;
  remove: (id: string) => void;
  openCompare: () => void;
}

export function CompareBar({ products, ids, clear, remove, openCompare }: CompareBarProps) {
  if (ids.length === 0) return null;
  const items = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 55, display: "flex", justifyContent: "center", padding: 16 }}>
      <div className="im-surface im-shadow-lg im-border" style={{ borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, maxWidth: "94vw", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><Scale size={15} className="im-primary" /> Comparar ({items.length}/3)</span>
        <div style={{ display: "flex", gap: 6 }}>
          {items.map((it) => (
            <div key={it.id} className="im-mono" style={{ fontSize: 11.5, background: "var(--bg-soft)", borderRadius: 8, padding: "5px 8px", display: "flex", alignItems: "center", gap: 6 }}>
              {it.name.slice(0, 18)}…
              <button onClick={() => remove(it.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><X size={11} /></button>
            </div>
          ))}
        </div>
        <button onClick={openCompare} disabled={items.length < 2} className="im-btn im-btn-primary im-focus" style={{ padding: "9px 16px", fontSize: 13 }}>Comparar</button>
        <button onClick={clear} className="im-btn im-btn-ghost im-focus" style={{ padding: "9px 12px", fontSize: 13 }}>Limpiar</button>
      </div>
    </div>
  );
}

export function CompareModal({ products, ids, onClose }: { products: Product[]; ids: string[]; onClose: () => void }) {
  const items = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
  if (!ids.length) return null;
  const allSpecKeys = [...new Set(items.flatMap((i) => (i.specs ?? []).map(([k]) => k)))];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="im-backdrop" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.55)" }} />
      <div className="im-surface im-shadow-lg im-fade-up im-scrollbar-none" style={{ position: "relative", width: "min(820px,100%)", maxHeight: "86vh", overflow: "auto", borderRadius: 18, padding: 28 }}>
        <button onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 18, right: 18, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>
        <h3 className="im-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Comparar productos</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
            <thead>
              <tr>
                <td style={{ width: 140 }} />
                {items.map((it) => (
                  <td key={it.id} style={{ padding: "0 12px 16px", minWidth: 160 }}>
                    <ProductVisual colors={it.images ?? []} icon={catIcon(it.category)} size={0.7} />
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }} className="im-line-clamp-2">{it.name}</div>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="im-border-b">
                <td className="im-ink-faint" style={{ fontSize: 12.5, padding: "10px 0" }}>Precio</td>
                {items.map((it) => {
                  const priceDisplay = getPriceDisplay(it);
                  return (
                    <td key={it.id} className="im-mono" style={{ fontSize: 13, padding: "10px 12px", fontWeight: 600 }}>
                      {it.price ? (
                        <>
                          {priceDisplay.isOnSale && (
                            <div style={{ fontSize: 11, color: "var(--ink-soft)", textDecoration: "line-through", marginBottom: 2 }}>{formatQ(priceDisplay.originalPrice!)}</div>
                          )}
                          <div style={{ color: priceDisplay.isOnSale ? "var(--red, #d65959)" : "inherit" }}>{formatQ(priceDisplay.displayPrice!)}</div>
                        </>
                      ) : (
                        "Cotizar"
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr className="im-border-b">
                <td className="im-ink-faint" style={{ fontSize: 12.5, padding: "10px 0" }}>Marca</td>
                {items.map((it) => <td key={it.id} style={{ fontSize: 13, padding: "10px 12px" }}>{it.brand}</td>)}
              </tr>
              <tr className="im-border-b">
                <td className="im-ink-faint" style={{ fontSize: 12.5, padding: "10px 0" }}>Uso</td>
                {items.map((it) => <td key={it.id} style={{ fontSize: 13, padding: "10px 12px" }}>{it.usage}</td>)}
              </tr>
              {allSpecKeys.map((k) => (
                <tr key={k} className="im-border-b">
                  <td className="im-ink-faint" style={{ fontSize: 12.5, padding: "10px 0" }}>{k}</td>
                  {items.map((it) => {
                    const found = (it.specs ?? []).find(([sk]) => sk === k);
                    return <td key={it.id} style={{ fontSize: 13, padding: "10px 12px" }}>{found ? found[1] : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
