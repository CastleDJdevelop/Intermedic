"use client";

import { useCallback, useEffect, useState } from "react";
import type { Company, Contact, Product, Quote } from "@/lib/types";
import { QuotesTable } from "@/components/crm/quotes/QuotesTable";
import { CreateQuoteModal } from "@/components/crm/quotes/CreateQuoteModal";

interface QuotesData {
  quotes: Quote[];
  companies: Company[];
  contacts: Contact[];
  products: Product[];
}

export default function CRMQuotesPage() {
  const [data, setData] = useState<QuotesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [quotesRes, companiesRes, contactsRes, productsRes] = await Promise.all([
        fetch("/api/quotes"), fetch("/api/companies"), fetch("/api/contacts"), fetch("/api/products"),
      ]);
      if (!quotesRes.ok || !companiesRes.ok || !contactsRes.ok || !productsRes.ok) throw new Error("Una o más APIs respondieron con error");
      const [quotes, companies, contacts, products] = await Promise.all([quotesRes.json(), companiesRes.json(), contactsRes.json(), productsRes.json()]);
      setData({ quotes, companies, contacts, products });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las cotizaciones");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error al cargar las cotizaciones: {error}</div>;
  if (!data) return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando cotizaciones…</div>;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Cotizaciones</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>Propuestas enviadas a clientes y su estado actual.</p>
      </div>

      <QuotesTable quotes={data.quotes} products={data.products} onNew={() => setCreating(true)} />

      {creating && (
        <CreateQuoteModal companies={data.companies} contacts={data.contacts} products={data.products} onClose={() => setCreating(false)} onCreated={load} />
      )}
    </div>
  );
}
