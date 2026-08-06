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
        {children}
      </body>
    </html>
  );
}
