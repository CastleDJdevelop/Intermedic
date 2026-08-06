"use client";

import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatQ } from "@/components/site/data";

export interface QuoteLineDraft {
  productId: string;
  qty: number;
}

function estimatedUnitPrice(product: Product | undefined): number {
  if (!product) return 0;
  return product.price ?? product.costProm * 1.3;
}

interface QuoteItemsEditorProps {
  products: Product[];
  items: QuoteLineDraft[];
  onChange: (items: QuoteLineDraft[]) => void;
}

/**
 * Selector de productos reales (por id, nunca por texto) reutilizado por
 * Pipeline (crear cotización desde un Deal) y por Cotizaciones (crear desde cero).
 * El total mostrado aquí es un estimado cliente — el total real y definitivo
 * lo calcula lib/db.ts#createQuote en el servidor.
 */
export function QuoteItemsEditor({ products, items, onChange }: QuoteItemsEditorProps) {
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const total = items.reduce((sum, it) => sum + it.qty * estimatedUnitPrice(productById.get(it.productId)), 0);

  function addLine() {
    onChange([...items, { productId: products[0]?.id ?? "", qty: 1 }]);
  }
  function updateLine(index: number, patch: Partial<QuoteLineDraft>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function removeLine(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
        {items.map((it, i) => {
          const product = productById.get(it.productId);
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={it.productId}
                onChange={(e) => updateLine(i, { productId: e.target.value })}
                className="im-input im-focus"
                style={{ flex: 1, padding: "8px 10px", fontSize: 13 }}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={it.qty}
                onChange={(e) => updateLine(i, { qty: Math.max(1, Number(e.target.value)) })}
                className="im-input im-focus"
                style={{ width: 70, padding: "8px 10px", fontSize: 13 }}
              />
              <span className="im-mono im-ink-faint" style={{ fontSize: 12, width: 90, textAlign: "right" }}>
                {product ? formatQ(Math.round(it.qty * estimatedUnitPrice(product))) : "—"}
              </span>
              <button type="button" onClick={() => removeLine(i)} className="im-btn-icon im-focus" style={{ width: 28, height: 28 }} aria-label="Quitar">
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={addLine} className="im-btn im-btn-outline im-focus" style={{ padding: "6px 12px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
        <Plus size={13} /> Agregar producto
      </button>
      <div style={{ marginTop: 12, textAlign: "right", fontSize: 13.5 }}>
        Total estimado: <span className="im-mono" style={{ fontWeight: 700 }}>{formatQ(Math.round(total))}</span>
      </div>
    </div>
  );
}
