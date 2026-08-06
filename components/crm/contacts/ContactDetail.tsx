"use client";

import { useState } from "react";
import { X, Mail, Phone, Pencil } from "lucide-react";
import type { Company, Contact, Deal, Quote } from "@/lib/types";

function formatQ(n: number) {
  return `Q ${n.toLocaleString("es-GT")}`;
}

interface ContactDetailProps {
  contact: Contact;
  company: Company | undefined;
  deals: Deal[];
  quotes: Quote[];
  onClose: () => void;
  onUpdated: () => void;
}

export function ContactDetail({ contact, company, deals, quotes, onClose, onUpdated }: ContactDetailProps) {
  const [tab, setTab] = useState<"info" | "historial">("historial");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(contact.name);
  const [role, setRole] = useState(contact.role);
  const [email, setEmail] = useState(contact.email);
  const [phone, setPhone] = useState(contact.phone);
  const [status, setStatus] = useState<Contact["status"]>(contact.status ?? "Activo");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const relatedDeals = deals.filter((d) => d.contactId === contact.id);
  const relatedQuotes = quotes.filter((q) => q.contactId === contact.id);
  const history = [
    ...relatedDeals.map((d) => ({ date: d.closeDate, label: `Negocio: ${d.title}`, sub: d.stage })),
    ...relatedQuotes.map((q) => ({ date: q.createdAt, label: `Cotización ${q.id}`, sub: `${formatQ(q.total)} · ${q.status}` })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, email, phone, status }),
      });
      if (!res.ok) throw new Error("No se pudo guardar el contacto");
      setEditing(false);
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.5)" }} />
      <div className="im-surface im-shadow-lg im-scrollbar-none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(480px,100%)", overflowY: "auto", padding: 26 }}>
        <button onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>

        {editing ? (
          <div style={{ marginBottom: 18 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 15, fontWeight: 700, marginBottom: 10 }} />
            <input value={role} onChange={(e) => setRole(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "8px 10px", fontSize: 13, marginBottom: 10 }} placeholder="Cargo" />
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="im-input im-focus" style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} placeholder="Correo" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="im-input im-focus" style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} placeholder="Teléfono" />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value as Contact["status"])} className="im-input im-focus" style={{ width: "100%", padding: "8px 10px", fontSize: 13, marginBottom: 10 }}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            {error && <div style={{ color: "var(--red, #d65959)", fontSize: 12, marginBottom: 8 }}>{error}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} disabled={saving} className="im-btn im-btn-primary im-focus" style={{ padding: "8px 14px", fontSize: 12.5 }}>{saving ? "Guardando…" : "Guardar"}</button>
              <button onClick={() => setEditing(false)} className="im-btn im-btn-ghost im-focus" style={{ padding: "8px 14px", fontSize: 12.5 }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 className="im-display" style={{ fontSize: 19, fontWeight: 700, margin: "14px 0 2px" }}>{contact.name}</h3>
                <div className="im-ink-soft" style={{ fontSize: 13, marginBottom: 4 }}>{contact.role} · {company?.name ?? "—"}</div>
              </div>
              <button onClick={() => setEditing(true)} className="im-btn-icon im-focus" style={{ width: 28, height: 28, marginTop: 14 }} aria-label="Editar"><Pencil size={13} /></button>
            </div>
            <span className="im-badge" style={{ background: contact.status === "Inactivo" ? "var(--bg-soft)" : "var(--teal-soft)", color: contact.status === "Inactivo" ? "var(--ink-faint)" : "var(--teal)" }}>
              {contact.status ?? "Activo"}
            </span>

            <div style={{ display: "flex", gap: 10, margin: "18px 0" }}>
              <a href={`mailto:${contact.email}`} className="im-btn im-btn-outline im-focus" style={{ flex: 1, padding: 10, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none" }}><Mail size={14} /> Correo</a>
              <a href={`tel:${contact.phone}`} className="im-btn im-btn-outline im-focus" style={{ flex: 1, padding: 10, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none" }}><Phone size={14} /> Llamar</a>
            </div>
          </>
        )}

        <div className="im-border-b" style={{ display: "flex", gap: 18, marginBottom: 16 }}>
          {([["historial", "Historial"], ["info", "Información"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="im-focus" style={{ background: "none", border: "none", padding: "0 0 10px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: tab === k ? "var(--primary)" : "var(--ink-faint)", borderBottom: tab === k ? "2px solid var(--primary)" : "2px solid transparent" }}>{l}</button>
          ))}
        </div>

        {tab === "info" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["Correo", contact.email || "—"], ["Teléfono", contact.phone || "—"], ["Empresa", company?.name ?? "—"], ["Último contacto", contact.lastContact ?? "—"]].map(([k, v]) => (
              <div key={k} className="im-border-b" style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, fontSize: 13 }}><span className="im-ink-faint">{k}</span><span style={{ fontWeight: 500 }}>{v}</span></div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {history.length === 0 ? (
              <div className="im-ink-faint" style={{ fontSize: 13 }}>Sin actividad registrada todavía (negocios o cotizaciones).</div>
            ) : history.map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <div>
                  <div style={{ fontWeight: 600 }} className="im-line-clamp-2">{h.label}</div>
                  <div className="im-ink-faint" style={{ fontSize: 12 }}>{h.sub}</div>
                </div>
                <span className="im-mono im-ink-faint" style={{ fontSize: 11.5, flexShrink: 0 }}>{h.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
