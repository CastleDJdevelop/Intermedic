"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/lib/types";

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"Administrador" | "Vendedor">("Vendedor");
  const [newUserPassword, setNewUserPassword] = useState("");

  useEffect(() => {
    // Verificar que el usuario sea Administrador
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error("No autenticado");
        return r.json();
      })
      .then((me) => {
        if (me.user?.role !== "Administrador") {
          router.push("/crm/dashboard?denied=1");
          return;
        }
        // Cargar usuarios
        return fetch("/api/users");
      })
      .then((r) => {
        if (r && !r.ok) throw new Error("Error al cargar usuarios");
        return r ? r.json() : null;
      })
      .then((data) => {
        if (data) {
          setUsers(data.filter((u: AppUser) => ({ id: u.id, username: u.username, name: u.name, role: u.role })));
        }
      })
      .catch((e) => setError(e.message));
  }, [router]);

  if (error) return <div style={{ padding: 24, color: "#d65959" }}>Error: {error}</div>;
  if (!users) return <div style={{ padding: 24 }}>Cargando usuarios…</div>;

  const roleColors: Record<string, string> = {
    "Administrador": "#0057D9",
    "Vendedor": "#00B39E",
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newUserPassword) return;
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          name: newName || newUsername,
          role: newRole,
          password: newUserPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear usuario");
      }
      // Recargar usuarios
      const usersRes = await fetch("/api/users");
      const data = await usersRes.json();
      setUsers(data);
      // Limpiar formulario
      setNewUsername("");
      setNewName("");
      setNewRole("Vendedor");
      setNewUserPassword("");
      setShowNewUserForm(false);
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : "Desconocido"}`);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, margin: 0 }}>Usuarios</h1>
        <button
          onClick={() => setShowNewUserForm(true)}
          style={{
            padding: "8px 16px",
            background: "#0057D9",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          + Nuevo usuario
        </button>
      </div>

      {showNewUserForm && (
        <div style={{ marginBottom: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8, background: "#f9f9f9" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Crear nuevo usuario</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Usuario</label>
              <input
                type="text"
                placeholder="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 4, border: "1px solid #ddd", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Nombre</label>
              <input
                type="text"
                placeholder="Nombre completo"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 4, border: "1px solid #ddd", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 4, border: "1px solid #ddd", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Rol</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "Administrador" | "Vendedor")}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 4, border: "1px solid #ddd", fontSize: 13, boxSizing: "border-box" }}
              >
                <option value="Vendedor">Vendedor</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleCreateUser}
              disabled={!newUsername || !newUserPassword}
              style={{
                padding: "8px 16px",
                background: "#00A854",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                opacity: !newUsername || !newUserPassword ? 0.5 : 1,
              }}
            >
              Crear
            </button>
            <button
              onClick={() => setShowNewUserForm(false)}
              style={{
                padding: "8px 16px",
                background: "#f0f0f0",
                color: "#333",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
                          method: "POST",
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
