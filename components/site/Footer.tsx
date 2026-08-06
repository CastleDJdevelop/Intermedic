"use client";

import { Activity } from "lucide-react";
import { CATEGORIES } from "./data";

export function Footer() {
  const cols = [
    { title: "Productos", items: CATEGORIES.slice(0, 5).map((c) => c.name) },
    { title: "Empresa", items: ["Nosotros", "Casos de éxito", "Blog", "Trabaja con nosotros"] },
    { title: "Soporte", items: ["Centro de ayuda", "Garantías", "Preguntas frecuentes", "Contacto"] },
  ];
  return (
    <footer className="im-border-t" style={{ background: "var(--bg-soft)", paddingTop: 52 }}>
      <div className="im-container im-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(3, 1fr)", gap: 32, paddingBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, var(--primary), var(--teal))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={15} color="#fff" />
            </div>
            <span className="im-display" style={{ fontSize: 17, fontWeight: 700 }}>INTERMEDIC</span>
          </div>
          <p className="im-ink-soft" style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 280, marginBottom: 18 }}>
            Distribución y venta de equipo médico, hospitalario y de laboratorio para instituciones y profesionales de la salud en Guatemala.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input placeholder="Su correo electrónico" className="im-input im-focus" style={{ flex: 1, padding: "10px 12px", fontSize: 13 }} />
            <button className="im-btn im-btn-primary im-focus" style={{ padding: "0 16px", fontSize: 13 }}>Suscribir</button>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".03em" }}>{c.title}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {c.items.map((it) => (
                <li key={it}><a href="#" className="im-ink-soft im-focus" style={{ fontSize: 13.5, textDecoration: "none" }}>{it}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="im-border-t" style={{ padding: "18px 0" }}>
        <div className="im-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span className="im-ink-faint" style={{ fontSize: 12.5 }}>© 2026 Intermedic, Guatemala. Todos los derechos reservados.</span>
          <div style={{ display: "flex", gap: 18 }}>
            <a href="#" className="im-ink-faint im-focus" style={{ fontSize: 12.5, textDecoration: "none" }}>Privacidad</a>
            <a href="#" className="im-ink-faint im-focus" style={{ fontSize: 12.5, textDecoration: "none" }}>Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
