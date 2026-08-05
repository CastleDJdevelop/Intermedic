"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import type { MovementType, Product, Warehouse } from "@/lib/types";

const WAREHOUSE_NAMES: Warehouse[] = ["Bodega Central", "Sucursal Zona 10", "Sucursal Quetzaltenango", "Sucursal Escuintla"];

const MOVE_META: Record<MovementType, { title: string; desc: string; needsCost: boolean; needsFrom: boolean; needsTo: boolean; hasSign: boolean }> = {
  Entrada: { title: "Nueva entrada", desc: "Registra el ingreso de mercadería a una bodega.", needsCost: true, needsFrom: false, needsTo: true, hasSign: false },
  Salida: { title: "Nueva salida", desc: "Registra la salida de mercadería por venta, consumo o merma.", needsCost: false, needsFrom: true, needsTo: false, hasSign: false },
  Transferencia: { title: "Nueva transferencia", desc: "Mueve existencias entre bodegas.", needsCost: false, needsFrom: true, needsTo: true, hasSign: false },
  Ajuste: { title: "Nuevo ajuste", desc: "Corrige existencias por conteo físico, daño u otra causa.", needsCost: false, needsFrom: true, needsTo: true, hasSign: true },
};

interface MovementModalProps {
  type: MovementType;
  products: Product[];
  onClose: () => void;
  onCreated: () => void;
}

export function MovementModal({ type, products, onClose, onCreated }: MovementModalProps) {
  const meta = MOVE_META[type];
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [qty, setQty] = useState("");
  const [from, setFrom] = useState<Warehouse>(WAREHOUSE_NAMES[0]);
  const [to, setTo] = useState<Warehouse>(WAREHOUSE_NAMES[1] ?? WAREHOUSE_NAMES[0]);
  const [cost, setCost] = useState("");
  const [ref, setRef] = useState("");
  const [sign, setSign] = useState<"positivo" | "negativo">("positivo");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const product = products.find((p) => p.id === productId);
  const needsFromNow = type === "Ajuste" ? sign === "negativo" : meta.needsFrom;
  const needsToNow = type === "Ajuste" ? sign === "positivo" : meta.needsTo;
  const available = product && needsFromNow ? (product.warehouses[from] ?? 0) : null;
  const qtyNum = Number(qty);
  const exceeds = available !== null && qtyNum > available;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !qty || qtyNum <= 0) return;
    setSaving(true);
    setError(null);
    try {
      let signedQty = Math.abs(qtyNum);
      if (type === "Salida" || (type === "Ajuste" && sign === "negativo")) signedQty = -signedQty;

      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          productId,
          qty: signedQty,
          from: needsFromNow ? from : null,
          to: needsToNow ? to : null,
          cost: meta.needsCost && cost ? Number(cost) : null,
          ref,
        }),
      });
      const resBody = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resBody.error ?? "No se pudo registrar el movimiento");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.55)" }} />
      <form onSubmit={submit} className="im-surface im-shadow-lg im-fade-up im-scrollbar-none" style={{ position: "relative", width: "min(460px,100%)", maxHeight: "88vh", overflowY: "auto", borderRadius: 16, padding: 26 }}>
        <button type="button" onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>
        <h3 className="im-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, paddingRight: 30 }}>{meta.title}</h3>
        <p className="im-ink-soft" style={{ fontSize: 12.5, marginBottom: 18 }}>{meta.desc}</p>

        <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Producto</label>
        <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, marginBottom: 14 }}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
        </select>

        {meta.hasSign && (
          <div style={{ marginBottom: 14 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Tipo de ajuste</label>
            <div style={{ display: "flex", gap: 4, background: "var(--bg-soft)", borderRadius: 8, padding: 3 }}>
              {(["positivo", "negativo"] as const).map((v) => (
                <button key={v} type="button" onClick={() => setSign(v)} className="im-focus" style={{ flex: 1, padding: "7px 10px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer", background: sign === v ? "var(--surface)" : "none", color: sign === v ? "var(--primary)" : "var(--ink-faint)" }}>
                  {v === "positivo" ? "Suma (+)" : "Resta (−)"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Cantidad ({product?.unit ?? "unidad"})</label>
            <input required type="number" min="1" step="1" value={qty} onChange={(e) => setQty(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} />
          </div>
          {meta.needsCost && (
            <div style={{ flex: 1 }}>
              <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Costo unitario (Q)</label>
              <input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder={product ? String(product.ultimoCosto) : ""} />
            </div>
          )}
        </div>

        {needsFromNow && (
          <div style={{ marginBottom: 14 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>{type === "Transferencia" ? "Bodega origen" : "Bodega"}</label>
            <select value={from} onChange={(e) => setFrom(e.target.value as Warehouse)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>
              {WAREHOUSE_NAMES.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
            {available !== null && <div className="im-ink-faint" style={{ fontSize: 11.5, marginTop: 5 }}>Disponible: {available} {product?.unit}s</div>}
          </div>
        )}

        {needsToNow && (
          <div style={{ marginBottom: 14 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Bodega destino</label>
            <select value={to} onChange={(e) => setTo(e.target.value as Warehouse)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>
              {WAREHOUSE_NAMES.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        )}

        <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Referencia / motivo</label>
        <input value={ref} onChange={(e) => setRef(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, marginBottom: 14 }} placeholder="Ej. Orden de compra, venta, motivo del ajuste…" />

        {exceeds && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--red, #d65959)", marginBottom: 10 }}>
            <AlertTriangle size={13} /> La cantidad excede el disponible en esa bodega ({available}).
          </div>
        )}
        {error && <div style={{ color: "var(--red, #d65959)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

        <button type="submit" disabled={saving} className="im-btn im-btn-primary im-focus" style={{ width: "100%", padding: 12, fontSize: 13.5 }}>
          {saving ? "Registrando…" : `Registrar ${type.toLowerCase()}`}
        </button>
      </form>
    </div>
  );
}
