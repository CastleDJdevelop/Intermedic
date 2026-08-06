"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "@/components/site/site.css";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/crm/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo iniciar sesión");
      }
      router.push(next);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="im-root" style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="im-surface im-shadow-lg" style={{ width: "min(400px, 100%)", borderRadius: 18, padding: 32 }}>
        <div className="im-mono im-ink-soft" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Intermedic · Plataforma interna</div>
        <h1 className="im-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 22 }}>Iniciar sesión</h1>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            autoFocus
            required
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="im-input im-focus"
            style={{ padding: "12px 14px", fontSize: 14 }}
          />
          <input
            required
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="im-input im-focus"
            style={{ padding: "12px 14px", fontSize: 14 }}
          />
          {error && <span style={{ color: "var(--red, #d65959)", fontSize: 12.5 }}>{error}</span>}
          <button type="submit" disabled={loading} className="im-btn im-btn-primary im-focus" style={{ padding: 13, fontSize: 14.5, marginTop: 6 }}>
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
