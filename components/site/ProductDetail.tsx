"use client";

import { useState } from "react";
import { X, Heart, Truck, Package, FileText, Download } from "lucide-react";
import type { Product } from "@/lib/types";
import { stockStatus } from "@/lib/stock";
import { catIcon, formatQ, getPriceDisplay } from "./data";
import { ProductVisual } from "./shared";

function badgeClass(badge: Product["badge"]) {
  if (badge === "Nuevo") return "im-badge-new";
  if (badge === "Promoción") return "im-badge-promo";
  return "im-badge-featured";
}

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  isFav: boolean;
  toggleFav: (id: string) => void;
  openQuote: (p: Product) => void;
  related: Product[];
  onOpenRelated: (p: Product) => void;
}

export function ProductDetail({ product, onClose, isFav, toggleFav, openQuote, related, onOpenRelated }: ProductDetailProps) {
  const [tab, setTab] = useState<"desc" | "specs" | "docs">("desc");
  const Icon = catIcon(product.category);
  const status = stockStatus(product);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div className="im-backdrop" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.5)" }} />
      <div className="im-slideover im-surface im-shadow-lg im-scrollbar-none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(560px, 100%)", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span className="im-ink-faint" style={{ fontSize: 13 }}>{product.category}</span>
          <button onClick={onClose} className="im-btn-icon im-focus" style={{ width: 32, height: 32 }} aria-label="Cerrar"><X size={15} /></button>
        </div>

        <ProductVisual colors={product.images ?? []} icon={Icon} size={1.3} />

        <div style={{ display: "flex", gap: 8, margin: "18px 0 8px", flexWrap: "wrap" }}>
          {product.badge && <span className={`im-badge ${badgeClass(product.badge)}`}>{product.badge}</span>}
          <span className="im-ink-faint" style={{ fontSize: 12.5 }}>{product.brand} · {product.usage}</span>
        </div>
        <h2 className="im-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{product.name}</h2>
        <div className="im-ink-faint im-mono" style={{ fontSize: 12, marginBottom: 10 }}>SKU {product.sku}</div>
        <div style={{ marginBottom: 20 }}>
          {product.price ? (
            <>
              {getPriceDisplay(product).isOnSale && (
                <div className="im-mono" style={{ fontSize: 14, color: "var(--ink-soft)", textDecoration: "line-through", marginBottom: 4 }}>{formatQ(getPriceDisplay(product).originalPrice!)}</div>
              )}
              <div className="im-mono" style={{ fontSize: 20, fontWeight: 700, color: getPriceDisplay(product).isOnSale ? "var(--red, #d65959)" : "inherit" }}>{formatQ(getPriceDisplay(product).displayPrice!)}</div>
            </>
          ) : (
            <div className="im-mono" style={{ fontSize: 20, fontWeight: 700 }}>Precio bajo cotización</div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <button onClick={() => openQuote(product)} className="im-btn im-btn-primary im-focus" style={{ flex: 1, padding: "12px", fontSize: 14 }}>Solicitar cotización</button>
          <button onClick={() => toggleFav(product.id)} className={`im-btn im-btn-outline im-focus ${isFav ? "active" : ""}`} style={{ padding: "12px 16px" }}><Heart size={15} fill={isFav ? "currentColor" : "none"} /></button>
        </div>

        <div className="im-border-b" style={{ display: "flex", gap: 20, marginBottom: 18 }}>
          {([["desc", "Descripción"], ["specs", "Especificaciones"], ["docs", "Documentos"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="im-focus" style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0 12px", fontSize: 13.5, fontWeight: 600, color: tab === k ? "var(--primary)" : "var(--ink-faint)", borderBottom: tab === k ? "2px solid var(--primary)" : "2px solid transparent" }}>{l}</button>
          ))}
        </div>

        {tab === "desc" && (
          <div>
            <p className="im-ink-soft" style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{product.description}</p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {product.delivery && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Truck size={15} className="im-primary" /><span style={{ fontSize: 13 }}>{product.delivery}</span></div>}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Package size={15} className="im-primary" /><span style={{ fontSize: 13 }}>{status === "out" ? "Agotado" : status === "low" ? "Pocas unidades" : "En stock"}</span></div>
            </div>
          </div>
        )}
        {tab === "specs" && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {(product.specs ?? []).map(([k, v]) => (
                <tr key={k} className="im-border-b">
                  <td className="im-ink-faint" style={{ padding: "10px 0", fontSize: 13, width: "42%" }}>{k}</td>
                  <td style={{ padding: "10px 0", fontSize: 13, fontWeight: 500 }}>{v}</td>
                </tr>
              ))}
              {(!product.specs || product.specs.length === 0) && (
                <tr><td className="im-ink-faint" style={{ padding: "10px 0", fontSize: 13 }}>Sin especificaciones registradas.</td></tr>
              )}
            </tbody>
          </table>
        )}
        {tab === "docs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Ficha técnica (PDF)", "Manual de usuario (PDF)"].map((d) => (
              <div key={d} className="im-card" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}><FileText size={16} className="im-ink-faint" /><span style={{ fontSize: 13.5 }}>{d}</span></div>
                <Download size={15} className="im-ink-faint" />
              </div>
            ))}
            <span className="im-ink-faint" style={{ fontSize: 12, marginTop: 4 }}>Disponible al solicitar cotización.</span>
          </div>
        )}

        {related.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 14 }}>Productos relacionados</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {related.map((r) => {
                const [c0, c1] = r.images ?? ["#0057D9", "#00B39E"];
                return (
                  <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }} onClick={() => onOpenRelated(r)}>
                    <div style={{ width: 46, height: 46, borderRadius: 9, background: `linear-gradient(135deg, ${c0}, ${c1})`, flexShrink: 0 }} />
                    <div style={{ fontSize: 13, fontWeight: 500 }} className="im-line-clamp-2">{r.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
