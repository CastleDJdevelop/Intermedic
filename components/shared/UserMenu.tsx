"use client";

import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";

interface Me {
  id: string;
  username: string;
  name: string;
  role: "Administrador" | "Vendedor";
}

/**
 * Muestra el usuario autenticado (nombre + rol) y un botón para cerrar
 * sesión. Se usa en el Topbar de CRM y de Inventario. Si por alguna razón
 * no hay sesión (no debería pasar, middleware.ts ya protege la página),
 * no renderiza nada.
 */
export function UserMenu() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  if (!me) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
        <div className="im-btn-icon" style={{ width: 28, height: 28, pointerEvents: "none" }}>
          <User size={13} />
        </div>
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontWeight: 700 }}>{me.name}</div>
          <div className="im-ink-soft" style={{ fontSize: 11 }}>{me.role}</div>
        </div>
      </div>
      <button onClick={logout} className="im-btn-icon im-focus" style={{ width: 30, height: 30 }} aria-label="Cerrar sesión" title="Cerrar sesión">
        <LogOut size={14} />
      </button>
    </div>
  );
}
