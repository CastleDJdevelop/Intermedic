"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

export default function QuoteForm({ product }: { product: Product }) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [qty, setQty] = useState(1);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, contactName, email, productId: product.id, qty }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
  }

  if (sent) {
    return (
      <div className="card" style={{ background: "var(--teal-soft)", borderColor: "var(--teal)" }}>
        <strong style={{ color: "var(--teal)" }}>Solicitud enviada.</strong>
        <p style={{ margin: "6px 0 0", fontSize: 13.5 }}>
          Se creó un lead en el CRM con esta solicitud —{" "}
          <a href="/leads" style={{ color: "var(--primary)" }}>ve el módulo de Leads</a> para confirmarlo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <strong>Solicitar cotización — {product.name}</strong>
      <input required placeholder="Institución / empresa" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      <input required placeholder="Nombre de contacto" value={contactName} onChange={(e) => setContactName(e.target.value)} />
      <input type="email" placeholder="Correo (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
      <button className="btn-primary" disabled={loading} type="submit">
        {loading ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
