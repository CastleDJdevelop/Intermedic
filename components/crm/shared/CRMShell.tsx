"use client";

import { useState } from "react";
import "@/components/site/site.css";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * Layout compartido de toda la plataforma interna del CRM (sidebar fija +
 * topbar). Reutiliza el mismo sistema de estilos del sitio (.im-*, site.css)
 * en vez de crear una segunda hoja de estilos paralela.
 */
export function CRMShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`im-root${dark ? " im-dark" : ""}`} style={{ display: "flex" }}>
      <Sidebar dark={dark} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="crm-main" style={{ flex: 1, minWidth: 0, marginLeft: 232 }}>
        <Topbar dark={dark} setDark={setDark} setMobileOpen={setMobileOpen} />
        <div style={{ padding: "24px 26px 60px" }}>{children}</div>
      </div>
      <style>{`@media (max-width: 900px) { .crm-main { margin-left: 0 !important; } }`}</style>
    </div>
  );
}
