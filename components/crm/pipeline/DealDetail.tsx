"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Deal, Product, Quote } from "@/lib/types";
import { QuoteItemsEditor, type QuoteLineDraft } from "@/components/crm/quotes/QuoteItemsEditor";
import { formatQ, STAGE_COLOR } from "./constants";

interface DealDetailProps {
  deal: Deal;
  companyName: string;
  contactName: string;
  linkedQuote: Quote | undefined;
  products: Product[];
  onClose: () => void;
  onChanged: () => void;
}

export function DealDetail({ deal, companyName, contactName, linkedQuote, products, onClose, onChanged }: DealDetailProps) {
  const [items, setItems] = useState<QuoteLineDraft[]>([{ productId: products[0]?.id ?? "", qty: 1 }]);
  const [creating, setCreating] = useState(false);
  const [markingWon, setMarkingWon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createQuote() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: deal.companyId,
          contactId: deal.contactId,
          items: items.filter((it) => it.productId),
          rep: deal.rep,
          dealId: deal.id,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "No se pudo crear la cotización");
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCreating(false);
    }
  }

  async function markWon() {
    if (!linkedQuote) {
      const proceed = window.confirm(
        "Este negocio no tiene una cotización vinculada — se marcará como Ganado pero NO se descontará inventario.\n\n¿Continuar?"
      );
      if (!proceed) return;
    }
    setMarkingWon(true);
    setError(null);
    try {
      const res = await fetch(`/api/deals/${deal.id}/win`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warehouse: "Bodega Central" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "No se pudo marcar como ganado");
      onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setMarkingWon(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.5)" }} />
      <div className="im-surface im-shadow-lg im-fade-up" style={{ position: "relative", width: "min(500px,100%)", maxHeight: "88vh", overflowY: "auto", borderRadius: 16, padding: 26 }}>
        <button onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>
        <span className="im-badge" style={{ background: "var(--bg-soft)", color: STAGE_COLOR[deal.stage] }}>{deal.stage}</span>
        <h3 className="im-display" style={{ fontSize: 19, fontWeight: 700, margin: "12px 0 4px" }}>{deal.title}</h3>
        <div className="im-ink-soft" style={{ fontSize: 13, marginBottom: 18 }}>{companyName} · {contactName}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
          <div><div className="im-ink-faint" style={{ fontSize: 11.5 }}>Valor</div><div className="im-mono" style={{ fontSize: 16, fontWeight: 700 }}>{formatQ(deal.value)}</div></div>
          <div><div className="im-ink-faint" style={{ fontSize: 11.5 }}>Cierre estimado</div><div style={{ fontSize: 14, fontWeight: 600 }}>{deal.closeDate}</div></div>
          <div><div className="im-ink-faint" style={{ fontSize: 11.5 }}>Vendedor</div><div style={{ fontSize: 14, fontWeight: 600 }}>{deal.rep || "Sin asignar"}</div></div>
          <div><div className="im-ink-faint" style={{ fontSize: 11.5 }}>Cotización</div><div style={{ fontSize: 14, fontWeight: 600 }}>{linkedQuote ? `${formatQ(linkedQuote.total)} · ${linkedQuote.status}` : "Sin cotización"}</div></div>
        </div>

        {!linkedQuote && deal.stage !== "Ganado" && (
          <div className="im-border-t" style={{ paddingTop: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>Crear cotización</div>
            <QuoteItemsEditor products={products} items={items} onChange={setItems} />
            <button onClick={createQuote} disabled={creating} className="im-btn im-btn-outline im-focus" style={{ marginTop: 10, padding: "9px 16px", fontSize: 13 }}>
              {creating ? "Creando…" : "Crear cotización y vincular"}
            </button>
          </div>
        )}

        {error && <div style={{ color: "var(--red, #d65959)", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}

        {deal.stage !== "Ganado" && deal.stage !== "Perdido" && (
          <button onClick={markWon} disabled={markingWon} className="im-btn im-btn-primary im-focus" style={{ width: "100%", padding: 11, fontSize: 13.5 }}>
            {markingWon ? "Procesando…" : "Marcar como Ganado"}
          </button>
        )}
      </div>
    </div>
  );
}
