"use client";

import { useEffect, useState } from "react";
import type { Reservation, Deal, Product } from "@/lib/types";

export default function ReservasPage() {
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/reservations"),
      fetch("/api/deals"),
      fetch("/api/products"),
    ])
      .then(async (res) => {
        if (res.some((r) => !r.ok)) throw new Error("Error al cargar datos");
        return Promise.all(res.map((r) => r.json()));
      })
      .then(([reservationsData, dealsData, productsData]) => {
        setReservations(reservationsData);
        setDeals(dealsData);
        setProducts(productsData);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div style={{ padding: 24, color: "#d65959" }}>Error: {error}</div>;
  if (!reservations || !deals || !products) return <div style={{ padding: 24 }}>Cargando reservas…</div>;

  const getProductName = (productId: string) => products.find((p) => p.id === productId)?.name || productId;
  const getDealTitle = (dealId: string) => deals.find((d) => d.id === dealId)?.title || dealId;

  const statusColors: Record<string, string> = {
    "Reservada": "#0057D9",
    "Confirmada": "#00B39E",
    "En preparación": "#C9600A",
    "Despachada": "#7B61FF",
    "Entregada": "#00A854",
    "Cancelada": "#d65959",
  };

  return (
    <div>
      <h1 style={{ fontSize: 23, fontWeight: 700, marginBottom: 22 }}>Reservas</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Listado ({reservations.length})</h2>
          {reservations.length === 0 ? (
            <div style={{ color: "#999", fontSize: 14 }}>Sin reservas registradas</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reservations.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  style={{
                    padding: 12,
                    border: selectedId === r.id ? "2px solid #0057D9" : "1px solid #ddd",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: selectedId === r.id ? "#f0f7ff" : "#fff",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{getDealTitle(r.dealId)}</div>
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
                    {r.items.length} artículos · {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: 4,
                      background: statusColors[r.status] || "#999",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {r.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedId && (
          <div>
            {(() => {
              const r = reservations.find((x) => x.id === selectedId);
              if (!r) return null;
              return (
                <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8, background: "#f9f9f9" }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Detalles</h2>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <strong>Deal:</strong> {getDealTitle(r.dealId)}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <strong>Estado:</strong> {r.status}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <strong>Creado:</strong> {new Date(r.createdAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 12 }}>
                    <strong>Reservado hasta:</strong> {new Date(r.reservedUntil).toLocaleDateString()}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Artículos</h3>
                    {r.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: 13, marginBottom: 6, padding: 8, background: "#fff", borderRadius: 4 }}>
                        <div>{getProductName(item.productId)}</div>
                        <div style={{ color: "#666" }}>
                          {item.qty} x Q{item.unitPrice.toLocaleString("es-GT")} = Q{(item.qty * item.unitPrice).toLocaleString("es-GT")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {r.notes && (
                    <div style={{ fontSize: 13, marginBottom: 12, padding: 8, background: "#fff", borderRadius: 4 }}>
                      <strong>Notas:</strong> {r.notes}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    {r.status !== "Cancelada" && (
                      <>
                        {r.status === "Reservada" && (
                          <button
                            onClick={() => {
                              fetch(`/api/reservations/${r.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "Confirmada" }),
                              })
                                .then((res) => res.json())
                                .then((updated) => {
                                  setReservations(
                                    reservations.map((x) => (x.id === r.id ? updated : x))
                                  );
                                });
                            }}
                            style={{
                              padding: "8px 12px",
                              background: "#00B39E",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: 13,
                            }}
                          >
                            Confirmar
                          </button>
                        )}
                        <button
                          onClick={() => {
                            fetch(`/api/reservations/${r.id}`, { method: "DELETE" })
                              .then((res) => res.json())
                              .then(() => {
                                setReservations(
                                  reservations.map((x) => (x.id === r.id ? { ...x, status: "Cancelada" } : x))
                                );
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
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
