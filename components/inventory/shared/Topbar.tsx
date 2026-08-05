"use client";

import { Menu } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { ThemeToggle } from "./ThemeToggle";

interface TopbarProps {
  dark: boolean;
  setDark: (v: boolean) => void;
  setMobileOpen: (v: boolean) => void;
}

export function Topbar({ dark, setDark, setMobileOpen }: TopbarProps) {
  return (
    <header
      className="im-surface im-border-b"
      style={{
        position: "sticky", top: 0, zIndex: 30, display: "flex", alignItems: "center", gap: 14,
        padding: "12px 20px", borderBottomWidth: 1,
      }}
    >
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        className="im-btn-icon im-focus"
        id="inv-topbar-menu"
        style={{ display: "none" }}
      >
        <Menu size={17} />
      </button>

      <GlobalSearch />

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <ThemeToggle dark={dark} setDark={setDark} />
      </div>

      <style>{`
        @media (max-width: 900px) {
          #inv-topbar-menu { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
