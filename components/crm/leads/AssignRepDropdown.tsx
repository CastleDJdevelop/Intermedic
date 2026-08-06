"use client";

import { useEffect, useState } from "react";
import type { AppUser, Lead } from "@/lib/types";

/**
 * Vendedores reales desde GET /api/users (rol "Vendedor") — no una lista
 * fija en memoria, aunque la instrucción lo permitía como alternativa.
 */
export function AssignRepDropdown({ lead, onAssigned }: { lead: Lead; onAssigned: () => void }) {
  const [reps, setReps] = useState<AppUser[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/users")
      .then((r) => r.json())
      .then((users: AppUser[]) => { if (!cancelled) setReps(users.filter((u) => u.role === "Vendedor")); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const rep = e.target.value || null;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rep }),
      });
      if (res.ok) onAssigned();
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={lead.rep ?? ""}
      onChange={handleChange}
      disabled={saving || lead.converted}
      className="im-input im-focus"
      style={{ fontSize: 12.5, padding: "5px 8px" }}
    >
      <option value="">Sin asignar</option>
      {reps.map((r) => (
        <option key={r.id} value={r.name}>{r.name}</option>
      ))}
    </select>
  );
}
