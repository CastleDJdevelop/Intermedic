"use client";

import { useState } from "react";
import { X, Building2, Pencil } from "lucide-react";
import type { Company, Contact, Deal } from "@/lib/types";
import { RepSelect } from "./RepSelect";

function formatQ(n: number) {
  return `Q ${n.toLocaleString("es-GT")}`;
}

const STAGE_COLOR: Record<string, string> = {
  "Prospección": "var(--ink-faint)", "Calificación": "var(--primary)", "Propuesta enviada": "var(--amber)",
  "Negociación": "#7C5CFF", "Ganado": "var(--teal)", "Perdido": "var(--red)",
};

interface CompanyDetailProps {
  company: Company;
  contacts: Contact[];
  deals: Deal[];
  onClose: () => void;
  onUpdated: () => void;
}

export function CompanyDetail({ company, contacts, deals, onClose, onUpdated }: CompanyDetailProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(company.name);
  const [sector, setSector] = useState(company.sector);
  const [city, setCity] = useState(company.city);
  const [rep, setRep] = useState(company.rep);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyContacts = contacts.filter((c) => c.companyId === company.id);
  const companyDeals = deals.filter((d) => d.companyId === company.id);
  const openValue = companyDeals.filter((d) => d.stage !== "Ganado" && d.stage !== "Perdido").reduce((s, d) => s + d.value, 0);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sector, city, rep }),
      });
      if (!res.ok) throw new Error("No se pudo guardar la empresa");
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
      <div className="im-surface im-shadow-lg im-scrollbar-none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(460px,100%)", overflowY: "auto", padding: 26 }}>
        <button onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>

        <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Building2 size={21} className="im-primary" />
        </div>

        {editing ? (
          <div style={{ marginBottom: 18 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 15, fontWeight: 700, marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input value={sector} onChange={(e) => setSector(e.target.value)} className="im-input im-focus" style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} placeholder="Sector" />
              <input value={city} onChange={(e) => setCity(e.target.value)} className="im-input im-focus" style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} placeholder="Ciudad" />
            </div>
            <RepSelect value={rep} onChange={setRep} style={{ width: "100%", padding: "8px 10px", fontSize: 13, marginBottom: 10 }} />
            {error && <div style={{ color: "var(--red, #d65959)", fontSize: 12, marginBottom: 8 }}>{error}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} disabled={saving} className="im-btn im-btn-primary im-focus" style={{ padding: "8px 14px", fontSize: 12.5 }}>{saving ? "Guardando…" : "Guardar"}</button>
              <button onClick={() => setEditing(false)} className="im-btn im-btn-ghost im-focus" style={{ padding: "8px 14px", fontSize: 12.5 }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <h3 className="im-display" style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>{company.name}</h3>
              <button onClick={() => setEditing(true)} className="im-btn-icon im-focus" style={{ width: 28, height: 28 }} aria-label="Editar"><Pencil size={13} /></button>
            </div>
            <div className="im-ink-soft" style={{ fontSize: 13, marginBottom: 10 }}>{company.sector} · {company.city || "—"}</div>
            <div className="im-ink-faint" style={{ fontSize: 13, marginBottom: 20 }}>Vendedor: {company.rep || "Sin asignar"}</div>
          </>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
          <div className="im-card" style={{ padding: 14 }}><div className="im-ink-faint" style={{ fontSize: 11.5 }}>Valor en pipeline</div><div className="im-mono" style={{ fontSize: 16, fontWeight: 700 }}>{formatQ(openValue)}</div></div>
          <div className="im-card" style={{ padding: 14 }}><div className="im-ink-faint" style={{ fontSize: 11.5 }}>Negocios</div><div className="im-mono" style={{ fontSize: 16, fontWeight: 700 }}>{companyDeals.length}</div></div>
        </div>

        <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>Contactos ({companyContacts.length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          {companyContacts.length === 0 && <div className="im-ink-faint" style={{ fontSize: 13 }}>Sin contactos registrados.</div>}
          {companyContacts.map((c) => (
            <div key={c.id} style={{ fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{c.name}</span> <span className="im-ink-faint">· {c.role}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>Negocios</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {companyDeals.length === 0 && <div className="im-ink-faint" style={{ fontSize: 13 }}>Sin negocios registrados.</div>}
          {companyDeals.map((d) => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
              <span style={{ maxWidth: 260 }} className="im-line-clamp-2">{d.title}</span>
              <span className="im-badge" style={{ background: "var(--bg-soft)", color: STAGE_COLOR[d.stage] }}>{d.stage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
