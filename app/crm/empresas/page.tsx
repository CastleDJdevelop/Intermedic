"use client";

import { useCallback, useEffect, useState } from "react";
import type { Company, Contact, Deal } from "@/lib/types";
import { CompaniesGrid } from "@/components/crm/companies/CompaniesGrid";
import { CompanyDetail } from "@/components/crm/companies/CompanyDetail";
import { CreateCompanyModal } from "@/components/crm/companies/CreateCompanyModal";

interface CompaniesData {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
}

export default function CRMCompaniesPage() {
  const [data, setData] = useState<CompaniesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [companiesRes, contactsRes, dealsRes] = await Promise.all([
        fetch("/api/companies"), fetch("/api/contacts"), fetch("/api/deals"),
      ]);
      if (!companiesRes.ok || !contactsRes.ok || !dealsRes.ok) throw new Error("Una o más APIs respondieron con error");
      const [companies, contacts, deals] = await Promise.all([companiesRes.json(), contactsRes.json(), dealsRes.json()]);
      setData({ companies, contacts, deals });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las empresas");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error al cargar las empresas: {error}</div>;
  if (!data) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando empresas…</div>;

  const selected = data.companies.find((c) => c.id === selectedId);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Empresas</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>Instituciones y clientes con los que trabaja Intermedic.</p>
      </div>

      <CompaniesGrid companies={data.companies} contacts={data.contacts} deals={data.deals} onOpen={(c) => setSelectedId(c.id)} onNew={() => setCreating(true)} />

      {selected && (
        <CompanyDetail company={selected} contacts={data.contacts} deals={data.deals} onClose={() => setSelectedId(null)} onUpdated={load} />
      )}
      {creating && <CreateCompanyModal onClose={() => setCreating(false)} onCreated={load} />}
    </div>
  );
}
