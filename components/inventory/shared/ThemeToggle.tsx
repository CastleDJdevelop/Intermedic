"use client";

import { Moon, Sun } from "lucide-react";

/** Mismo control visual que el del Sitio/CRM; copia propia para no acoplar módulos. */
export function ThemeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button onClick={() => setDark(!dark)} aria-label="Cambiar tema" className="im-btn-icon im-focus" style={{ width: 34, height: 34 }}>
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
