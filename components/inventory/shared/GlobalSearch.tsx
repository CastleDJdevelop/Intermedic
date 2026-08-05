"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Product } from "@/lib/types";

function useOutsideClose(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

interface SearchResult {
  kind: "Producto" | "Proveedor";
  label: string;
  sub: string;
  href: string;
}

/**
 * Busca sobre los mismos productos reales de GET /api/products. Los
 * "proveedores" no son una entidad todavía — se derivan de product.supplier
 * (nombres únicos), no de un arreglo mock aparte.
 */
export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => { if (!cancelled) setProducts(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useOutsideClose(ref, () => setOpen(false));

  const suppliers = useMemo(() => [...new Set(products.map((p) => p.supplier).filter(Boolean))], [products]);

  const results = useMemo<SearchResult[]>(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    const out: SearchResult[] = [];
    for (const p of products) {
      if (p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || p.barcode.includes(s)) {
        out.push({ kind: "Producto", label: p.name, sub: p.sku, href: "/inventario/productos" });
      }
    }
    for (const sup of suppliers) {
      if (sup.toLowerCase().includes(s)) {
        out.push({ kind: "Proveedor", label: sup, sub: "Proveedor", href: "/inventario/proveedores" });
      }
    }
    return out.slice(0, 8);
  }, [q, products, suppliers]);

  function goTo(r: SearchResult) {
    router.push(r.href);
    setOpen(false);
    setQ("");
  }

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, maxWidth: 380 }}>
      <Search size={15} className="im-ink-faint" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar por producto, SKU, código de barras…"
        className="im-input im-focus"
        style={{ width: "100%", padding: "9px 12px 9px 34px", fontSize: 13.5 }}
      />
      {open && q.trim() && (
        <div className="im-surface im-border im-shadow-lg im-scrollbar-none" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, borderRadius: 10, padding: 6, zIndex: 60, maxHeight: 320, overflowY: "auto" }}>
          {results.length === 0 ? (
            <div className="im-ink-faint" style={{ padding: 10, fontSize: 12.5 }}>Sin resultados para &quot;{q}&quot;</div>
          ) : results.map((r, i) => (
            <button
              key={i}
              onClick={() => goTo(r)}
              className="im-focus"
              style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "9px 10px", background: "none", border: "none", borderRadius: 7, cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontSize: 13 }}>{r.label} <span className="im-ink-faint" style={{ fontSize: 11.5 }}>· {r.sub}</span></span>
              <span className="im-mono im-ink-faint" style={{ fontSize: 10.5, flexShrink: 0, marginLeft: 8 }}>{r.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
