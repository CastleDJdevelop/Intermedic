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
          <a href="/crm/dashboard">CRM · Dashboard</a>
          <a href="/crm/leads">CRM · Leads</a>
          <a href="/crm/pipeline">CRM · Pipeline</a>
          <a href="/crm/empresas">CRM · Empresas</a>
          <a href="/crm/contactos">CRM · Contactos</a>
          <a href="/crm/cotizaciones">CRM · Cotizaciones</a>
          <a href="/crm/tareas">CRM · Tareas</a>
          <a href="/crm/reportes">CRM · Reportes</a>
          <a href="/dashboard">Inventario · Dashboard</a>
        </div>
        {children}
      </body>
    </html>
  );
}
