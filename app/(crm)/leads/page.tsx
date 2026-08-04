import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function LeadsPage() {
  const db = getDB();
  const leads = [...db.leads].reverse();

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>CRM · Leads</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginBottom: 20 }}>
        Cada solicitud de cotización enviada desde el sitio web aparece aquí automáticamente,
        con el origen marcado como "Sitio web".
      </p>

      {leads.length === 0 ? (
        <div className="card">Aún no hay leads. Ve al <a href="/">sitio web</a> y envía una solicitud de cotización para probar la conexión.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {leads.map((l) => (
            <div key={l.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{l.companyName}</strong> — {l.contactName}
                <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{l.email || "sin correo"} · {l.createdAt}</div>
              </div>
              <span style={{ background: "var(--primary-soft)", color: "var(--primary)", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                {l.source}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
