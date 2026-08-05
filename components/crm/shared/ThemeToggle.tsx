"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Mismo control visual que el del sitio (Header.tsx), pero como componente
 * propio del CRM — no se tocó components/site/Header.tsx para no modificar
 * código ya aprobado de la Fase 1.
 */
export function ThemeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button onClick={() => setDark(!dark)} aria-label="Cambiar tema" className="im-btn-icon im-focus" style={{ width: 34, height: 34 }}>
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
