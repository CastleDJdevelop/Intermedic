"use client";

import { useCallback, useEffect, useState } from "react";
import type { Company, Contact, Deal, Quote } from "@/lib/types";
import { ContactsTable } from "@/components/crm/contacts/ContactsTable";
import { ContactDetail } from "@/components/crm/contacts/ContactDetail";
import { CreateContactModal } from "@/components/crm/contacts/CreateContactModal";

interface ContactsData {
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  quotes: Quote[];
}

export default function CRMContactsPage() {
  const [data, setData] = useState<ContactsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [contactsRes, companiesRes, dealsRes, quotesRes] = await Promise.all([
        fetch("/api/contacts"), fetch("/api/companies"), fetch("/api/deals"), fetch("/api/quotes"),
      ]);
      if (!contactsRes.ok || !companiesRes.ok || !dealsRes.ok || !quotesRes.ok) throw new Error("Una o más APIs respondieron con error");
      const [contacts, companies, deals, quotes] = await Promise.all([contactsRes.json(), companiesRes.json(), dealsRes.json(), quotesRes.json()]);
      setData({ contacts, companies, deals, quotes });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los contactos");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error al cargar los contactos: {error}</div>;
  if (!data) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando contactos…</div>;

  const selected = data.contacts.find((c) => c.id === selectedId);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Contactos</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>Personas de contacto en cada empresa cliente.</p>
      </div>

      <ContactsTable contacts={data.contacts} companies={data.companies} onOpen={(c) => setSelectedId(c.id)} onNew={() => setCreating(true)} />

      {selected && (
        <ContactDetail
          contact={selected}
          company={data.companies.find((c) => c.id === selected.companyId)}
          deals={data.deals}
          quotes={data.quotes}
          onClose={() => setSelectedId(null)}
          onUpdated={load}
        />
      )}
      {creating && <CreateContactModal companies={data.companies} onClose={() => setCreating(false)} onCreated={load} />}
    </div>
  );
}
