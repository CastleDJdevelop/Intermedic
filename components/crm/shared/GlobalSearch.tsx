"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Company, Contact, Lead, Quote } from "@/lib/types";

function useOutsideClose(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

interface SearchResult {
  kind: "Empresa" | "Contacto" | "Lead" | "Cotización";
  label: string;
  sub: string;
  href: string;
}

/**
 * Buscador global del prototipo (Topbar → GlobalSearch), con datos reales:
 * carga companies/contacts/leads/quotes desde las APIs existentes al montar
 * y filtra en memoria mientras el usuario escribe. No es una fuente nueva de
 * datos — es la misma que ya consume cada página del CRM.
 */
export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/companies").then((r) => r.json()),
      fetch("/api/contacts").then((r) => r.json()),
      fetch("/api/leads").then((r) => r.json()),
      fetch("/api/quotes").then((r) => r.json()),
    ])
      .then(([companiesData, contactsData, leadsData, quotesData]) => {
        if (cancelled) return;
        setCompanies(companiesData);
        setContacts(contactsData);
        setLeads(leadsData);
        setQuotes(quotesData);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useOutsideClose(ref, () => setOpen(false));

  const companyNameById = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies]);

  const results = useMemo<SearchResult[]>(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    const out: SearchResult[] = [];

    for (const c of companies) {
      if (c.name.toLowerCase().includes(s)) {
        out.push({ kind: "Empresa", label: c.name, sub: c.sector, href: "/crm/empresas" });
      }
    }
    for (const c of contacts) {
      const companyName = companyNameById.get(c.companyId) ?? "";
      if (c.name.toLowerCase().includes(s) || companyName.toLowerCase().includes(s)) {
        out.push({ kind: "Contacto", label: c.name, sub: companyName, href: "/crm/contactos" });
      }
    }
    for (const l of leads) {
      if (l.companyName.toLowerCase().includes(s) || l.contactName.toLowerCase().includes(s)) {
        out.push({ kind: "Lead", label: l.companyName, sub: `${l.contactName} · ${l.status}`, href: "/crm/leads" });
      }
    }
    for (const qt of quotes) {
      if (qt.id.toLowerCase().includes(s) || qt.companyName.toLowerCase().includes(s)) {
        out.push({ kind: "Cotización", label: qt.id, sub: qt.companyName, href: "/crm/cotizaciones" });
      }
    }
    return out.slice(0, 8);
  }, [q, companies, contacts, leads, quotes, companyNameById]);

  function goTo(r: SearchResult) {
    router.push(r.href);
    setOpen(false);
    setQ("");
  }

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, maxWidth: 380 }}>
      <Search size={15} className="im-ink-faint" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar leads, empresas, contactos, cotizaciones…"
        className="im-input im-focus"
        style={{ width: "100%", padding: "9px 12px 9px 34px", fontSize: 13.5 }}
      />
      {open && q.trim() && (
        <div className="im-surface im-border im-shadow-lg im-scrollbar-none" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, borderRadius: 10, padding: 6, zIndex: 60, maxHeight: 320, overflowY: "auto" }}>
          {results.length === 0 ? (
            <div className="im-ink-faint" style={{ padding: 10, fontSize: 12.5 }}>Sin resultados para &quot;{q}&quot;</div>
          ) : results.map((r, i) => (
            <button
              key={i}
              onClick={() => goTo(r)}
              className="im-focus"
              style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "9px 10px", background: "none", border: "none", borderRadius: 7, cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontSize: 13 }}>{r.label} <span className="im-ink-faint" style={{ fontSize: 11.5 }}>· {r.sub}</span></span>
              <span className="im-mono im-ink-faint" style={{ fontSize: 10.5, flexShrink: 0, marginLeft: 8 }}>{r.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
