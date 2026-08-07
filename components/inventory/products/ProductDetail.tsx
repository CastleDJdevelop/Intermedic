"use client";

import { useEffect, useState } from "react";
import { X, Pencil, Warehouse as WarehouseIcon } from "lucide-react";
import type { Product, Movement, Warehouse } from "@/lib/types";
import { totalStock, stockStatus } from "@/lib/stock";
import { computeKardex } from "@/lib/kardex";

const WAREHOUSE_NAMES: Warehouse[] = ["Bodega Central", "Sucursal Zona 10", "Sucursal Quetzaltenango", "Sucursal Escuintla"];
const TYPE_COLOR: Record<string, string> = { Entrada: "var(--teal)", Salida: "var(--red, #d65959)", Transferencia: "var(--primary)", Ajuste: "var(--amber)" };

function formatQ(n: number) {
  return `Q ${n.toLocaleString("es-GT", { maximumFractionDigits: 2 })}`;
}

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onUpdated: () => void;
}

export function ProductDetail({ product, onClose, onUpdated }: ProductDetailProps) {
  const [tab, setTab] = useState<"info" | "stock" | "kardex">("info");
  const [movements, setMovements] = useState<Movement[] | null>(null);

  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(product.price != null ? String(product.price) : "");
  const [salePrice, setSalePrice] = useState(product.salePrice != null ? String(product.salePrice) : "");
  const [costProm, setCostProm] = useState(String(product.costProm));
  const [stockMin, setStockMin] = useState(String(product.stockMin));
  const [stockMax, setStockMax] = useState(String(product.stockMax));
  const [published, setPublished] = useState(product.published !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/movements")
      .then((r) => r.json())
      .then((data: Movement[]) => { if (!cancelled) setMovements(data.filter((m) => m.productId === product.id)); })
      .catch(() => { if (!cancelled) setMovements([]); });
    return () => { cancelled = true; };
  }, [product.id]);

  const stock = totalStock(product);
  const status = stockStatus(product);
  const kardex = movements ? computeKardex(movements) : [];
  // Misma regla que el Sitio (app/(site)/page.tsx): sin el campo, se considera publicado.
  const isPublishedNow = product.published !== false;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: price === "" ? null : Number(price),
          salePrice: salePrice === "" ? null : Number(salePrice),
          costProm: Number(costProm),
          stockMin: Number(stockMin),
          stockMax: Number(stockMax),
          published,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "No se pudo guardar el producto");
      setEditing(false);
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  const TABS: [typeof tab, string][] = [["info", "Información"], ["stock", "Stock por bodega"], ["kardex", "Kardex"]];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.5)" }} />
      <div className="im-surface im-shadow-lg im-scrollbar-none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(620px,100%)", overflowY: "auto", padding: 26 }}>
        <button onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>

        <div className="im-ink-faint" style={{ fontSize: 12.5, marginBottom: 6 }}>{product.category} · {product.brand}</div>
        <h2 className="im-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, paddingRight: 30 }}>{product.name}</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <span className="im-badge" style={{ background: status === "in" ? "var(--teal-soft)" : "var(--red-soft)", color: status === "in" ? "var(--teal)" : "var(--red, #d65959)" }}>
            {status === "in" ? "Stock saludable" : status === "low" ? "Bajo mínimo" : "Agotado"}
          </span>
          {product.serialized && <span className="im-badge" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>Serializado</span>}
          <span className="im-badge" style={{ background: isPublishedNow ? "var(--teal-soft)" : "var(--bg-soft)", color: isPublishedNow ? "var(--teal)" : "var(--ink-faint)" }}>
            {isPublishedNow ? "Publicado en el sitio" : "No publicado"}
          </span>
        </div>

        {editing ? (
          <div className="im-card" style={{ padding: 16, marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="im-ink-soft" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 5, display: "block" }}>Precio regular (Q)</label>
                <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "8px 10px", fontSize: 13 }} placeholder="Sin precio público" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="im-ink-soft" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 5, display: "block" }}>Precio de oferta (Q)</label>
                <input type="number" min="0" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "8px 10px", fontSize: 13 }} placeholder="Dejar vacío para quitar oferta" />
                <div className="im-ink-faint" style={{ fontSize: 10.5, marginTop: 3 }}>Debe ser menor que el precio regular.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="im-ink-soft" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 5, display: "block" }}>Costo promedio (Q)</label>
                <input required type="number" min="0" step="0.01" value={costProm} onChange={(e) => setCostProm(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "8px 10px", fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="im-ink-soft" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 5, display: "block" }}>Stock mínimo</label>
                <input required type="number" min="0" value={stockMin} onChange={(e) => setStockMin(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "8px 10px", fontSize: 13 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="im-ink-soft" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 5, display: "block" }}>Stock máximo</label>
                <input required type="number" min="0" value={stockMax} onChange={(e) => setStockMax(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "8px 10px", fontSize: 13 }} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="im-ink-soft" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 5, display: "block" }}>Publicación en el sitio</label>
              <div style={{ display: "flex", gap: 4, background: "var(--bg-soft)", borderRadius: 8, padding: 3 }}>
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setPublished(v)}
                    className="im-focus"
                    style={{
                      flex: 1, padding: "7px 10px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer",
                      background: published === v ? "var(--surface)" : "none",
                      color: published === v ? "var(--primary)" : "var(--ink-faint)",
                    }}
                  >
                    {v ? "Publicado" : "No publicado"}
                  </button>
                ))}
              </div>
              <div className="im-ink-faint" style={{ fontSize: 11, marginTop: 5 }}>
                Si no está publicado, el producto sigue en Inventario pero deja de aparecer en el catálogo público.
              </div>
            </div>
            {error && <div style={{ color: "var(--red, #d65959)", fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={save} disabled={saving} className="im-btn im-btn-primary im-focus" style={{ padding: "8px 14px", fontSize: 12.5 }}>{saving ? "Guardando…" : "Guardar"}</button>
              <button type="button" onClick={() => setEditing(false)} className="im-btn im-btn-ghost im-focus" style={{ padding: "8px 14px", fontSize: 12.5 }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div className="im-card" style={{ padding: 14 }}><div className="im-ink-faint" style={{ fontSize: 11 }}>Stock total</div><div className="im-mono" style={{ fontSize: 17, fontWeight: 700 }}>{stock} {product.unit}{stock !== 1 ? "s" : ""}</div></div>
              <div className="im-card" style={{ padding: 14 }}><div className="im-ink-faint" style={{ fontSize: 11 }}>Costo promedio</div><div className="im-mono" style={{ fontSize: 17, fontWeight: 700 }}>{formatQ(product.costProm)}</div></div>
              <div className="im-card" style={{ padding: 14 }}><div className="im-ink-faint" style={{ fontSize: 11 }}>Valor en inventario</div><div className="im-mono" style={{ fontSize: 17, fontWeight: 700 }}>{formatQ(stock * product.costProm)}</div></div>
            </div>
            <button onClick={() => setEditing(true)} className="im-btn im-btn-outline im-focus" style={{ padding: "8px 14px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <Pencil size={13} /> Editar precio / costo / mínimos / publicación
            </button>
          </>
        )}

        <div className="im-border-b" style={{ display: "flex", gap: 18, marginBottom: 18 }}>
          {TABS.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="im-focus" style={{ background: "none", border: "none", padding: "0 0 10px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", color: tab === k ? "var(--primary)" : "var(--ink-faint)", borderBottom: tab === k ? "2px solid var(--primary)" : "2px solid transparent" }}>{l}</button>
          ))}
        </div>

        {tab === "info" && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["SKU", product.sku],
                ["Código de barras", product.barcode],
                ["Marca", product.brand],
                ["Unidad de medida", product.unit],
                ["Proveedor", product.supplier],
                ["Último costo", formatQ(product.ultimoCosto)],
                ["Precio público", product.price != null ? formatQ(product.price) : "Sin precio público"],
                ["Stock mínimo", `${product.stockMin} ${product.unit}s`],
                ["Stock máximo", `${product.stockMax} ${product.unit}s`],
                ["Publicación", isPublishedNow ? "Publicado en el sitio" : "No publicado"],
              ].map(([k, v]) => (
                <tr key={k} className="im-border-b"><td className="im-ink-faint" style={{ padding: "10px 0", fontSize: 13, width: "45%" }}>{k}</td><td style={{ padding: "10px 0", fontSize: 13, fontWeight: 500 }}>{v}</td></tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "stock" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {WAREHOUSE_NAMES.map((w) => {
              const qty = product.warehouses[w] ?? 0;
              return (
                <div key={w} className="im-card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <WarehouseIcon size={16} className="im-ink-faint" />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{w}</div>
                  <span className="im-mono" style={{ fontSize: 14, fontWeight: 700 }}>{qty} {product.unit}{qty !== 1 ? "s" : ""}</span>
                </div>
              );
            })}
          </div>
        )}

        {tab === "kardex" && (
          <div style={{ overflowX: "auto" }}>
            {movements === null ? (
              <div className="im-ink-faint" style={{ fontSize: 13, padding: 12 }}>Cargando kardex…</div>
            ) : kardex.length === 0 ? (
              <div className="im-ink-faint" style={{ fontSize: 13, padding: 12 }}>Sin movimientos registrados para este producto.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr className="im-border-b" style={{ fontSize: 10.5, textTransform: "uppercase" }}>
                    {["Fecha", "Tipo", "Ref.", "Entrada", "Salida", "Saldo", "Costo unit.", "Valor saldo"].map((h) => (
                      <th key={h} className="im-ink-faint" style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kardex.map((r) => (
                    <tr key={r.id} className="im-border-b">
                      <td className="im-mono im-ink-faint" style={{ padding: "8px 10px", fontSize: 11.5 }}>{r.date}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span className="im-badge" style={{ background: "var(--bg-soft)", color: TYPE_COLOR[r.type] }}>{r.type}</span>
                      </td>
                      <td className="im-ink-soft" style={{ padding: "8px 10px", fontSize: 11.5, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.ref}</td>
                      <td className="im-mono" style={{ padding: "8px 10px", fontSize: 12, color: "var(--teal)" }}>{r.qtyIn || "—"}</td>
                      <td className="im-mono" style={{ padding: "8px 10px", fontSize: 12, color: "var(--red, #d65959)" }}>{r.qtyOut || "—"}</td>
                      <td className="im-mono" style={{ padding: "8px 10px", fontSize: 12, fontWeight: 700 }}>{r.balance}</td>
                      <td className="im-mono im-ink-soft" style={{ padding: "8px 10px", fontSize: 11.5 }}>{formatQ(r.costUnit)}</td>
                      <td className="im-mono" style={{ padding: "8px 10px", fontSize: 11.5, fontWeight: 600 }}>{formatQ(r.valueBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
