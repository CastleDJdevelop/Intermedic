"use client";

import { useMemo, useState } from "react";
import { Building2, MapPin, Plus, Search } from "lucide-react";
import type { Company, Contact, Deal } from "@/lib/types";

function formatQ(n: number) {
  return `Q ${n.toLocaleString("es-GT")}`;
}

interface CompaniesGridProps {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  onOpen: (company: Company) => void;
  onNew: () => void;
}

export function CompaniesGrid({ companies, contacts, deals, onOpen, onNew }: CompaniesGridProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
  }, [companies, search]);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ position: "relative", minWidth: 240 }}>
          <Search size={14} className="im-ink-faint" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, sector o ciudad…" className="im-input im-focus" style={{ width: "100%", padding: "8px 10px 8px 32px", fontSize: 13 }} />
        </div>
        <button onClick={onNew} className="im-btn im-btn-primary im-focus" style={{ padding: "9px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Nueva empresa
        </button>
      </div>

      <div className="im-companies-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {filtered.map((c) => {
          const companyContacts = contacts.filter((ct) => ct.companyId === c.id);
          const companyDeals = deals.filter((d) => d.companyId === c.id);
          const openValue = companyDeals.filter((d) => d.stage !== "Ganado" && d.stage !== "Perdido").reduce((s, d) => s + d.value, 0);
          return (
            <div key={c.id} onClick={() => onOpen(c)} className="im-card" style={{ padding: 18, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={17} className="im-primary" />
                </div>
                <span className="im-badge" style={{ background: "var(--bg-soft)", color: "var(--ink-soft)" }}>{c.sector}</span>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
              <div className="im-ink-faint" style={{ fontSize: 12, marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {c.city || "—"}</div>
              <div className="im-border-t" style={{ paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                <span className="im-ink-soft">{companyContacts.length} contacto{companyContacts.length !== 1 ? "s" : ""}</span>
                <span className="im-mono" style={{ fontWeight: 600 }}>{formatQ(openValue)}</span>
              </div>
              <div className="im-ink-faint" style={{ fontSize: 12, marginTop: 10 }}>{c.rep || "Sin asignar"}</div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="im-card" style={{ padding: 40, textAlign: "center", gridColumn: "1 / -1" }}>
            <div className="im-ink-faint" style={{ fontSize: 13.5 }}>No hay empresas que coincidan con la búsqueda.</div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 900px) { .im-companies-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .im-companies-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
