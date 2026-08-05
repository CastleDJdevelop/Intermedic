"use client";

import { useState } from "react";
import type { Lead } from "@/lib/types";

export function ConvertLeadButton({ lead, onConverted }: { lead: Lead; onConverted: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const confirmed = window.confirm(
      `¿Convertir "${lead.companyName}" en Empresa + Contacto + Negocio?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "No se pudo convertir el lead");
      onConverted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  if (lead.converted) {
    return <span style={{ color: "var(--teal)", fontWeight: 600, fontSize: 12.5, whiteSpace: "nowrap" }}>Convertido ✓</span>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button
        onClick={handleClick}
        disabled={loading || lead.status === "Descartado"}
        className="im-btn im-btn-outline im-focus"
        style={{ padding: "6px 12px", fontSize: 12 }}
      >
        {loading ? "Convirtiendo…" : "Convertir"}
      </button>
      {error && <span style={{ color: "var(--red, #d65959)", fontSize: 11, maxWidth: 160, textAlign: "right" }}>{error}</span>}
    </div>
  );
}
