"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Company, Contact, Deal, DealStage, Product, Quote } from "@/lib/types";
import { PipelineBoard } from "@/components/crm/pipeline/PipelineBoard";
import { DealDetail } from "@/components/crm/pipeline/DealDetail";

interface PipelineData {
  deals: Deal[];
  companies: Company[];
  contacts: Contact[];
  products: Product[];
  quotes: Quote[];
}

export default function CRMPipelinePage() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [dealsRes, companiesRes, contactsRes, productsRes, quotesRes] = await Promise.all([
        fetch("/api/deals"), fetch("/api/companies"), fetch("/api/contacts"), fetch("/api/products"), fetch("/api/quotes"),
      ]);
      if (![dealsRes, companiesRes, contactsRes, productsRes, quotesRes].every((r) => r.ok)) {
        throw new Error("Una o más APIs respondieron con error");
      }
      const [deals, companies, contacts, products, quotes] = await Promise.all([
        dealsRes.json(), companiesRes.json(), contactsRes.json(), productsRes.json(), quotesRes.json(),
      ]);
      setData({ deals, companies, contacts, products, quotes });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el pipeline");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const companyNameById = useMemo(() => new Map((data?.companies ?? []).map((c) => [c.id, c.name])), [data]);
  const contactNameById = useMemo(() => new Map((data?.contacts ?? []).map((c) => [c.id, c.name])), [data]);
  const quoteById = useMemo(() => new Map((data?.quotes ?? []).map((q) => [q.id, q])), [data]);
  const selectedDeal = data?.deals.find((d) => d.id === selectedDealId);

  async function moveStage(dealId: string, stage: DealStage) {
    if (stage === "Ganado") {
      const res = await fetch(`/api/deals/${dealId}/win`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warehouse: "Bodega Central" }),
      });
      if (res.ok) load();
      return;
    }
    const res = await fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (res.ok) load();
  }

  if (error) {
    return <div className="im-card" style={{ padding: 24, color: "var(--red, #d65959)" }}>Error al cargar el pipeline: {error}</div>;
  }
  if (!data) {
    return <div className="im-ink-faint" style={{ fontSize: 14, padding: 24 }}>Cargando pipeline…</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 className="im-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Pipeline</h1>
        <p className="im-ink-soft" style={{ fontSize: 13.5 }}>Arrastre las tarjetas para mover un negocio de etapa. Solo "Ganado" descuenta inventario.</p>
      </div>

      <PipelineBoard deals={data.deals} companyNameById={companyNameById} onOpenDeal={(d) => setSelectedDealId(d.id)} onMoveStage={moveStage} />

      {selectedDeal && (
        <DealDetail
          deal={selectedDeal}
          companyName={companyNameById.get(selectedDeal.companyId) ?? "—"}
          contactName={selectedDeal.contactId ? contactNameById.get(selectedDeal.contactId) ?? "—" : "—"}
          linkedQuote={selectedDeal.quoteId ? quoteById.get(selectedDeal.quoteId) : undefined}
          products={data.products}
          onClose={() => setSelectedDealId(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
