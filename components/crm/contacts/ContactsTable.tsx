"use client";

import { useMemo, useState } from "react";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import type { Company, Contact } from "@/lib/types";

interface ContactsTableProps {
  contacts: Contact[];
  companies: Company[];
  onOpen: (contact: Contact) => void;
  onNew: () => void;
}

export function ContactsTable({ contacts, companies, onOpen, onNew }: ContactsTableProps) {
  const [search, setSearch] = useState("");
  const companyById = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
      const companyName = companyById.get(c.companyId)?.name ?? "";
      return c.name.toLowerCase().includes(q) || companyName.toLowerCase().includes(q);
    });
  }, [contacts, search, companyById]);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ position: "relative", minWidth: 240 }}>
          <Search size={14} className="im-ink-faint" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o empresa…" className="im-input im-focus" style={{ width: "100%", padding: "8px 10px 8px 32px", fontSize: 13 }} />
        </div>
        <button onClick={onNew} className="im-btn im-btn-primary im-focus" style={{ padding: "9px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Nuevo contacto
        </button>
      </div>

      <div className="im-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr className="im-border-b im-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase" }}>
              {["Nombre", "Empresa", "Cargo", "Correo", "Último contacto", "Estado", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} onClick={() => onOpen(c)} className="im-border-b" style={{ cursor: "pointer" }}>
                <td style={{ padding: "12px 16px", fontSize: 13.5, fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }} className="im-ink-soft">{companyById.get(c.companyId)?.name ?? "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }} className="im-ink-soft">{c.role}</td>
                <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="im-mono im-ink-faint">{c.email || "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="im-mono im-ink-faint">{c.lastContact ?? "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span className="im-badge" style={{ background: c.status === "Inactivo" ? "var(--bg-soft)" : "var(--teal-soft)", color: c.status === "Inactivo" ? "var(--ink-faint)" : "var(--teal)" }}>
                    {c.status ?? "Activo"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}><MoreHorizontal size={16} className="im-ink-faint" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="im-ink-faint" style={{ padding: 40, textAlign: "center", fontSize: 13.5 }}>No hay contactos que coincidan con la búsqueda.</div>
        )}
      </div>
    </div>
  );
}
