import { getDB } from "@/lib/db";
import MarkWonButton from "@/components/MarkWonButton";

export const dynamic = "force-dynamic";

export default function PipelinePage() {
  const db = getDB();

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>CRM · Pipeline</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginBottom: 20 }}>
        Al marcar un negocio como "Ganado" se generan automáticamente las salidas de inventario
        de los productos cotizados, y el stock se descuenta de verdad.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {db.deals.map((d) => {
          const company = db.companies.find((c) => c.id === d.companyId);
          return (
            <div key={d.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{d.title}</strong>
                <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{company?.name} · Q {d.value.toLocaleString("es-GT")} · {d.rep}</div>
              </div>
              {d.stage === "Ganado" ? (
                <span style={{ color: "var(--teal)", fontWeight: 700, fontSize: 13 }}>Ganado ✓</span>
              ) : (
                <MarkWonButton dealId={d.id} />
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 18 }}>
        Nota: en la data semilla, el negocio de ejemplo no tiene una cotización asociada
        (<code>quoteId</code>), así que el botón cambiará la etapa pero no descontará stock hasta
        que Claude Code conecte "Crear cotización desde negocio" en el Pipeline real.
      </p>
    </main>
  );
}
