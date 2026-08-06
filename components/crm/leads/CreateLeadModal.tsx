"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { LeadSource } from "@/lib/types";
import { RepSelect } from "@/components/crm/companies/RepSelect";

const SOURCES: LeadSource[] = ["Sitio web", "WhatsApp", "Referido", "Llamada entrante", "Feria / evento"];

/**
 * Lead registrado manualmente desde el CRM (ej. llamada entrante), no desde
 * el Sitio. Usa el mismo POST /api/leads que la conexión Sitio→CRM (que no
 * se modificó), solo que aquí se envía un `source` explícito.
 */
export function CreateLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<LeadSource>("Llamada entrante");
  const [rep, setRep] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, contactName, email: email || undefined, phone: phone || undefined, source, rep: rep || null, note: note || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "No se pudo crear el lead");
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
      <form onSubmit={submit} className="im-surface im-shadow-lg im-fade-up" style={{ position: "relative", width: "min(440px,100%)", borderRadius: 16, padding: 26 }}>
        <button type="button" onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>
        <h3 className="im-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, paddingRight: 30 }}>Nuevo lead</h3>

        <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Empresa o nombre del prospecto</label>
        <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, marginBottom: 14 }} placeholder="Ej. Hospital San Marcos" />

        <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Persona de contacto</label>
        <input required value={contactName} onChange={(e) => setContactName(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, marginBottom: 14 }} placeholder="Ej. Dr. Federico Ruano" />

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="im-input im-focus" style={{ flex: 1, padding: "9px 12px", fontSize: 13.5 }} placeholder="Correo (opcional)" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="im-input im-focus" style={{ flex: 1, padding: "9px 12px", fontSize: 13.5 }} placeholder="Teléfono (opcional)" />
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Origen</label>
            <select value={source} onChange={(e) => setSource(e.target.value as LeadSource)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Vendedor (opcional)</label>
            <RepSelect value={rep} onChange={setRep} style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} />
          </div>
        </div>

        <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Nota (opcional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, resize: "vertical", fontFamily: "inherit", marginBottom: 6 }} />

        {error && <div style={{ color: "var(--red, #d65959)", fontSize: 12.5, marginTop: 8 }}>{error}</div>}

        <button type="submit" disabled={saving} className="im-btn im-btn-primary im-focus" style={{ width: "100%", padding: 12, fontSize: 13.5, marginTop: 14 }}>
          {saving ? "Creando…" : "Crear lead"}
        </button>
      </form>
    </div>
  );
}
