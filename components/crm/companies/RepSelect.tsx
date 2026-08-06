"use client";

import { useEffect, useState } from "react";
import type { AppUser } from "@/lib/types";

/** Select reutilizable de vendedores reales (rol "Vendedor"), desde GET /api/users. */
export function RepSelect({ value, onChange, className, style }: { value: string; onChange: (v: string) => void; className?: string; style?: React.CSSProperties }) {
  const [reps, setReps] = useState<AppUser[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/users")
      .then((r) => r.json())
      .then((users: AppUser[]) => { if (!cancelled) setReps(users.filter((u) => u.role === "Vendedor")); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className ?? "im-input im-focus"} style={style}>
      <option value="">Sin asignar</option>
      {reps.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
    </select>
  );
}
