import { getDB, totalStock } from "@/lib/db";
import QuoteForm from "@/components/QuoteForm";

export const dynamic = "force-dynamic";

export default function SitePage() {
  const db = getDB();
  const product = db.products[0]; // demo: se muestra el primer producto destacado
  const stock = totalStock(product);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 20px" }}>
      <p style={{ fontSize: 13, color: "var(--ink-faint)" }}>
        Versión mínima de demostración. El diseño completo del catálogo está en{" "}
        <code>reference/intermedic-prototipo.jsx</code> — Claude Code debe portar esas pantallas
        aquí conectándolas a <code>/api/products</code> en lugar del arreglo <code>PRODUCTS</code> local.
      </p>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>{product.name}</h1>
      <p style={{ color: "var(--ink-soft)" }}>{product.description}</p>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>Disponibilidad (dato real de Inventario)</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>
          {stock > product.stockMin ? `${stock} ${product.unit}s en stock` : "Pocas unidades — consultar"}
        </div>
      </div>

      <QuoteForm product={product} />
    </main>
  );
}
