"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lead, Product } from "@/lib/types";
import { LeadsTable } from "@/components/crm/leads/LeadsTable";

export default function CRMLeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [leadsRes, productsRes] = await Promise.all([fetch("/api/leads"), fetch("/api/products")]);
      if (!leadsRes.ok || !productsRes.ok) throw new Error("Una o más APIs respondieron con error");
      const [leadsData, productsData] = await Promise.all([leadsRes.json(), productsRes.json()]);
      setLeads(leadsData);
      setProducts(productsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los leads");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) {
    return (
      <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>
        Error al cargar los leads: {error}
      </div>
    );
  }

  if (!leads || !products) {
    return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando leads…</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Leads</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>Prospectos captados desde el sitio web, WhatsApp, referidos y más.</p>
      </div>
      <LeadsTable leads={leads} products={products} onRefetch={load} />
    </div>
  );
}
