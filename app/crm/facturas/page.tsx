"use client";

import { useEffect, useState } from "react";
import type { Invoice, Deal } from "@/lib/types";

export default function FacturasPage() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/invoices"), fetch("/api/deals")])
      .then(async (res) => {
        if (res.some((r) => !r.ok)) throw new Error("Error al cargar datos");
        return Promise.all(res.map((r) => r.json()));
      })
      .then(([invoicesData, dealsData]) => {
        setInvoices(invoicesData);
        setDeals(dealsData);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div style={{ padding: 24, color: "#d65959" }}>Error: {error}</div>;
  if (!invoices || !deals) return <div style={{ padding: 24 }}>Cargando facturas…</div>;

  const getDealTitle = (dealId: string | undefined) =>
    dealId ? deals.find((d) => d.id === dealId)?.title || dealId : "—";

  const statusColors: Record<string, string> = {
    "Borrador": "#999",
    "Emitida": "#0057D9",
    "Pagada": "#00A854",
    "Anulada": "#d65959",
  };

  function formatQ(n: number) {
    return `Q${n.toLocaleString("es-GT", { maximumFractionDigits: 0 })}`;
  }

  return (
    <div>
      <h1 style={{ fontSize: 23, fontWeight: 700, marginBottom: 22 }}>Facturas</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Listado ({invoices.length})</h2>
          {invoices.length === 0 ? (
            <div style={{ color: "#999", fontSize: 14 }}>Sin facturas registradas</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedId(inv.id)}
                  style={{
                    padding: 12,
                    border: selectedId === inv.id ? "2px solid #0057D9" : "1px solid #ddd",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: selectedId === inv.id ? "#f0f7ff" : "#fff",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{inv.number}</div>
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
                    {inv.companyName} · {formatQ(inv.total)}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: 4,
                      background: statusColors[inv.status] || "#999",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {inv.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedId && (
          <div>
            {(() => {
              const inv = invoices.find((x) => x.id === selectedId);
              if (!inv) return null;
              return (
                <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8, background: "#f9f9f9" }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Detalles</h2>

                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <strong>Número:</strong> {inv.number}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <strong>Cliente:</strong> {inv.companyName}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <strong>Contacto:</strong> {inv.contactName}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <strong>Deal:</strong> {getDealTitle(inv.dealId)}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <strong>Estado:</strong> {inv.status}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <strong>Emitida:</strong> {new Date(inv.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 12 }}>
                    <strong>Vence:</strong> {new Date(inv.dueDate).toLocaleDateString()}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Artículos</h3>
                    {inv.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: 13, marginBottom: 6, padding: 8, background: "#fff", borderRadius: 4 }}>
                        <div>{item.description}</div>
                        <div style={{ color: "#666" }}>
                          {item.qty} x {formatQ(item.unitPrice)} = {formatQ(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 16, padding: 12, background: "#fff", borderRadius: 4 }}>
                    <div style={{ fontSize: 13, marginBottom: 6 }}>
                      <strong>Subtotal:</strong> {formatQ(inv.subtotal)}
                    </div>
                    <div style={{ fontSize: 13, marginBottom: 6 }}>
                      <strong>IVA (12%):</strong> {formatQ(inv.tax)}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0057D9" }}>
                      Total: {formatQ(inv.total)}
                    </div>
                  </div>

                  {inv.status !== "Anulada" && inv.status !== "Pagada" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      {inv.status === "Emitida" && (
                        <button
                          onClick={() => {
                            fetch(`/api/invoices/${inv.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "Pagada" }),
                            })
                              .then((res) => res.json())
                              .then((updated) => {
                                setInvoices(invoices.map((x) => (x.id === inv.id ? updated : x)));
                              });
                          }}
                          style={{
                            padding: "8px 12px",
                            background: "#00A854",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          Marcar Pagada
                        </button>
                      )}
                      <button
                        onClick={() => {
                          fetch(`/api/invoices/${inv.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: "Anulada" }),
                          })
                            .then((res) => res.json())
                            .then((updated) => {
                              setInvoices(invoices.map((x) => (x.id === inv.id ? updated : x)));
                            });
                        }}
                        style={{
                          padding: "8px 12px",
                          background: "#d65959",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        Anular
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
