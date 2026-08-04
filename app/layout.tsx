import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intermedic — Plataforma",
  description: "Sitio web, CRM e Inventario conectados sobre una misma base de datos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="demo-bar">
          <span className="demo-bar-label">Demo de conexión entre módulos:</span>
          <a href="/">Sitio web (catálogo)</a>
          <a href="/leads">CRM · Leads</a>
          <a href="/pipeline">CRM · Pipeline</a>
          <a href="/dashboard">Inventario · Dashboard</a>
        </div>
        {children}
      </body>
    </html>
  );
}
