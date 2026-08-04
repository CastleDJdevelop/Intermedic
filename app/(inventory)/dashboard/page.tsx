import { getDB, totalStock } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function InventoryDashboard() {
  const db = getDB();

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>Inventario · Dashboard</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginBottom: 20 }}>
        Este stock es el mismo dato que consulta el sitio web y el que descuenta el CRM al cerrar
        una venta — una sola fuente de verdad en <code>data/db.json</code>.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {db.products.map((p) => {
          const stock = totalStock(p);
          const low = stock <= p.stockMin;
          return (
            <div key={p.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{p.name}</strong>
                <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{p.sku} · {p.category}</div>
              </div>
              <span style={{ color: low ? "var(--red)" : "var(--teal)", fontWeight: 700 }}>
                {stock} {p.unit}s {low ? "· bajo mínimo" : ""}
              </span>
            </div>
          );
        })}
      </div>

      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginTop: 28 }}>Últimos movimientos</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
        {[...db.movements].reverse().slice(0, 8).map((m) => {
          const product = db.products.find((p) => p.id === m.productId);
          return (
            <div key={m.id} className="card" style={{ padding: 12, fontSize: 13 }}>
              <strong>{m.type}</strong> · {product?.name ?? m.productId} · {m.qty > 0 ? "+" : ""}{m.qty} — {m.ref}
              <span style={{ color: "var(--ink-faint)", marginLeft: 8 }}>{m.date}</span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
