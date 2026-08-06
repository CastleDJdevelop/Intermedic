"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MarkWonButton({ dealId }: { dealId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function markWon() {
    setLoading(true);
    const res = await fetch(`/api/deals/${dealId}/win`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ warehouse: "Bodega Central" }) });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      router.refresh();
    }
  }

  if (done) return <span style={{ color: "var(--teal)", fontWeight: 600, fontSize: 13 }}>Ganado — stock descontado ✓</span>;

  return (
    <button className="btn-primary" onClick={markWon} disabled={loading} style={{ padding: "8px 14px", fontSize: 13 }}>
      {loading ? "Procesando…" : "Marcar como ganado"}
    </button>
  );
}
