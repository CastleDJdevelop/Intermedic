"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { Company, Contact, Product } from "@/lib/types";
import { QuoteItemsEditor, type QuoteLineDraft } from "./QuoteItemsEditor";
import { RepSelect } from "@/components/crm/companies/RepSelect";

interface CreateQuoteModalProps {
  companies: Company[];
  contacts: Contact[];
  products: Product[];
  onClose: () => void;
  onCreated: () => void;
}

export function CreateQuoteModal({ companies, contacts, products, onClose, onCreated }: CreateQuoteModalProps) {
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [contactId, setContactId] = useState("");
  const [rep, setRep] = useState("");
  const [items, setItems] = useState<QuoteLineDraft[]>([{ productId: products[0]?.id ?? "", qty: 1 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyContacts = useMemo(() => contacts.filter((c) => c.companyId === companyId), [contacts, companyId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId || items.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, contactId: contactId || undefined, items, rep: rep || null }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "No se pudo crear la cotización");
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.55)" }} />
      <form onSubmit={submit} className="im-surface im-shadow-lg im-fade-up im-scrollbar-none" style={{ position: "relative", width: "min(520px,100%)", maxHeight: "88vh", overflowY: "auto", borderRadius: 16, padding: 26 }}>
        <button type="button" onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>
        <h3 className="im-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, paddingRight: 30 }}>Nueva cotización</h3>

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Empresa</label>
            <select required value={companyId} onChange={(e) => { setCompanyId(e.target.value); setContactId(""); }} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Contacto</label>
            <select value={contactId} onChange={(e) => setContactId(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>
              <option value="">Sin contacto</option>
              {companyContacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Vendedor</label>
        <RepSelect value={rep} onChange={setRep} style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, marginBottom: 16 }} />

        <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Productos</label>
        <QuoteItemsEditor products={products} items={items} onChange={setItems} />

        {error && <div style={{ color: "var(--red, #d65959)", fontSize: 12.5, marginTop: 12 }}>{error}</div>}

        <button type="submit" disabled={saving} className="im-btn im-btn-primary im-focus" style={{ width: "100%", padding: 12, fontSize: 13.5, marginTop: 16 }}>
          {saving ? "Creando…" : "Crear cotización"}
        </button>
      </form>
    </div>
  );
}
