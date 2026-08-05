"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface TopbarProps {
  dark: boolean;
  setDark: (v: boolean) => void;
  setMobileOpen: (v: boolean) => void;
}

export function Topbar({ dark, setDark, setMobileOpen }: TopbarProps) {
  return (
    <div className="im-border-b im-surface" style={{ position: "sticky", top: 0, zIndex: 30, height: 64, display: "flex", alignItems: "center", gap: 14, padding: "0 22px" }}>
      <button onClick={() => setMobileOpen(true)} id="crm-menu-btn" className="im-btn-icon im-focus" style={{ width: 34, height: 34, display: "none" }} aria-label="Abrir menú">
        <Menu size={16} />
      </button>
      <div style={{ marginLeft: "auto" }}>
        <ThemeToggle dark={dark} setDark={setDark} />
      </div>
      <style>{`@media (max-width: 900px) { #crm-menu-btn { display: flex !important; } }`}</style>
    </div>
  );
}
