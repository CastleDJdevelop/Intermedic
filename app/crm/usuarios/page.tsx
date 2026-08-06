"use client";

import { useEffect, useState } from "react";
import type { AppUser } from "@/lib/types";

export default function UsuariosPage() {
  const [users, setUsers] = useState<AppUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar usuarios");
        return r.json();
      })
      .then((data) => {
        setUsers(data.filter((u: AppUser) => ({ id: u.id, username: u.username, name: u.name, role: u.role })));
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div style={{ padding: 24, color: "#d65959" }}>Error: {error}</div>;
  if (!users) return <div style={{ padding: 24 }}>Cargando usuarios…</div>;

  const roleColors: Record<string, string> = {
    "Administrador": "#0057D9",
    "Vendedor": "#00B39E",
  };

  return (
    <div>
      <h1 style={{ fontSize: 23, fontWeight: 700, marginBottom: 22 }}>Usuarios</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Listado ({users.length})</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => setSelectedId(u.id)}
                style={{
                  padding: 12,
                  border: selectedId === u.id ? "2px solid #0057D9" : "1px solid #ddd",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: selectedId === u.id ? "#f0f7ff" : "#fff",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{u.name}</div>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>@{u.username}</div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: roleColors[u.role] || "#999",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {u.role}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedId && (
          <div>
            {(() => {
              const u = users.find((x) => x.id === selectedId);
              if (!u) return null;
              return (
                <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8, background: "#f9f9f9" }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Detalles</h2>

                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <strong>Nombre:</strong> {u.name}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <strong>Usuario:</strong> {u.username}
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 12 }}>
                    <strong>Rol:</strong> {u.role}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      placeholder="Dejar vacío para no cambiar"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 4,
                        border: "1px solid #ddd",
                        fontSize: 13,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {newPassword && (
                    <button
                      onClick={() => {
                        if (!newPassword) return;
                        fetch(`/api/users/${u.id}/password`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ newPassword }),
                        })
                          .then((res) => {
                            if (!res.ok) throw new Error("Error al actualizar contraseña");
                            setNewPassword("");
                            alert("Contraseña actualizada");
                          })
                          .catch((e) => alert(`Error: ${e.message}`));
                      }}
                      style={{
                        padding: "8px 12px",
                        background: "#00A854",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Actualizar contraseña
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, padding: 16, background: "#f0f7ff", borderRadius: 8 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Permisos por rol</h2>
        <div style={{ fontSize: 13 }}>
          <strong>Administrador:</strong> acceso completo a CRM, Inventario, Usuarios, configuración.
        </div>
        <div style={{ fontSize: 13, marginTop: 6 }}>
          <strong>Vendedor:</strong> acceso a CRM (leads, deals, cotizaciones), puede registrar salidas de inventario.
        </div>
      </div>
    </div>
  );
}
