"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, Grid3x3, List, SlidersHorizontal, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { stockStatus } from "@/lib/stock";
import { SmartSearch } from "./Header";
import { ProductCard } from "./ProductCard";

export interface CatalogFilters {
  category: string[];
  brand: string[];
  usage: string[];
  availability: string[];
}

function FilterGroup({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="im-border-b" style={{ padding: "16px 0" }}>
      <button onClick={() => setCollapsed(!collapsed)} className="im-focus" style={{ display: "flex", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", marginBottom: collapsed ? 0 : 12 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</span>
        <ChevronDown size={15} className="im-ink-faint" style={{ transform: collapsed ? "rotate(-90deg)" : "none", transition: "transform .2s" }} />
      </button>
      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <label key={opt} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", fontSize: 13.5 }}>
                <span onClick={() => onToggle(opt)} className={`im-checkbox ${checked ? "checked" : ""}`}>{checked && <Check size={11} color="#fff" strokeWidth={3} />}</span>
                <span className="im-ink-soft" style={{ color: checked ? "var(--ink)" : undefined }}>{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CatalogPageProps {
  allProducts: Product[];
  search: string;
  setSearch: (v: string) => void;
  filters: CatalogFilters;
  toggleFilter: (group: keyof CatalogFilters, value: string) => void;
  clearFilters: () => void;
  sort: string;
  setSort: (v: string) => void;
  gridView: "grid" | "list";
  setGridView: (v: "grid" | "list") => void;
  onOpen: (p: Product) => void;
  favorites: string[];
  toggleFav: (id: string) => void;
  compareList: string[];
  toggleCompare: (id: string) => void;
}

export function CatalogPage({ allProducts, search, setSearch, filters, toggleFilter, clearFilters, sort, setSort, gridView, setGridView, onOpen, favorites, toggleFav, compareList, toggleCompare }: CatalogPageProps) {
  const filtered = useMemo(() => {
    let list = allProducts.filter((p) => {
      const q = search.toLowerCase();
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      const matchesCat = filters.category.length === 0 || filters.category.includes(p.category);
      const matchesBrand = filters.brand.length === 0 || filters.brand.includes(p.brand);
      const matchesUsage = filters.usage.length === 0 || (p.usage && filters.usage.includes(p.usage));
      const status = stockStatus(p);
      const availLabel = status === "in" ? "En stock" : "Pocas unidades";
      const matchesAvail = filters.availability.length === 0 || filters.availability.includes(availLabel);
      return matchesQ && matchesCat && matchesBrand && matchesUsage && matchesAvail;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999));
    if (sort === "price-desc") list = [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [allProducts, search, filters, sort]);

  const activeFilterCount = filters.category.length + filters.brand.length + filters.usage.length + filters.availability.length;

  return (
    <div className="im-container im-fade-up" style={{ padding: "32px 24px 64px" }}>
      <div className="im-ink-faint" style={{ fontSize: 13, marginBottom: 8 }}>Inicio / <span className="im-ink">Catálogo</span></div>
      <h1 className="im-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Catálogo de productos</h1>
      <div style={{ marginBottom: 24 }}>
        <SmartSearch products={allProducts} value={search} onChange={setSearch} onSubmit={setSearch} variant="header" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32 }} className="im-catalog-grid">
        <aside>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><SlidersHorizontal size={14} /> Filtros</span>
            {activeFilterCount > 0 && <button onClick={clearFilters} className="im-primary im-focus" style={{ fontSize: 12.5, background: "none", border: "none", cursor: "pointer" }}>Limpiar ({activeFilterCount})</button>}
          </div>
          <FilterGroup title="Categoría" options={[...new Set(allProducts.map((p) => p.category))]} selected={filters.category} onToggle={(v) => toggleFilter("category", v)} />
          <FilterGroup title="Marca" options={[...new Set(allProducts.map((p) => p.brand))]} selected={filters.brand} onToggle={(v) => toggleFilter("brand", v)} />
          <FilterGroup title="Uso" options={["Nuevo", "Reacondicionado"]} selected={filters.usage} onToggle={(v) => toggleFilter("usage", v)} />
          <FilterGroup title="Disponibilidad" options={["En stock", "Pocas unidades"]} selected={filters.availability} onToggle={(v) => toggleFilter("availability", v)} />
        </aside>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
            <span className="im-ink-soft" style={{ fontSize: 13.5 }}>{filtered.length} producto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="im-input im-focus" style={{ padding: "8px 10px", fontSize: 13 }}>
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name">Nombre (A–Z)</option>
              </select>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setGridView("grid")} className={`im-btn-icon im-focus ${gridView === "grid" ? "active" : ""}`} style={{ width: 34, height: 34 }} aria-label="Vista de cuadrícula"><Grid3x3 size={14} /></button>
                <button onClick={() => setGridView("list")} className={`im-btn-icon im-focus ${gridView === "list" ? "active" : ""}`} style={{ width: 34, height: 34 }} aria-label="Vista de lista"><List size={14} /></button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="im-card" style={{ padding: 60, textAlign: "center" }}>
              <Search size={28} className="im-ink-faint" style={{ marginBottom: 14 }} />
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Sin resultados</div>
              <div className="im-ink-soft" style={{ fontSize: 13.5 }}>Ajuste su búsqueda o quite algunos filtros.</div>
            </div>
          ) : (
            <div style={gridView === "grid" ? { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 } : { display: "flex", flexDirection: "column", gap: 12 }} className={gridView === "grid" ? "im-cat-prod-grid" : ""}>
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} onOpen={onOpen} isFav={favorites.includes(p.id)} toggleFav={toggleFav} isCompare={compareList.includes(p.id)} toggleCompare={toggleCompare} listView={gridView === "list"} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
