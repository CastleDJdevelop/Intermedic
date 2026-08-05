"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { Product } from "@/lib/types";
import "./site.css";
import { CATEGORIES } from "./data";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Home } from "./Home";
import { CatalogPage, type CatalogFilters } from "./Catalog";
import { ProductDetail } from "./ProductDetail";
import { QuoteModal } from "./QuoteModal";
import { CompareBar, CompareModal } from "./CompareBar";

/**
 * Composición principal del sitio público — portada de IntermedicApp en
 * reference/intermedic-prototipo.jsx. `products` viene de data/db.json a
 * través de app/(site)/page.tsx (server component) — no hay un segundo
 * arreglo PRODUCTS local.
 */
export function SiteApp({ products }: { products: Product[] }) {
  const [dark, setDark] = useState(false);
  const [view, setView] = useState<"home" | "catalog">("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quoteFor, setQuoteFor] = useState<Product | null | undefined>(undefined);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [filters, setFilters] = useState<CatalogFilters>({ category: [], brand: [], usage: [], availability: [] });
  const [sort, setSort] = useState("relevance");
  const [gridView, setGridView] = useState<"grid" | "list">("grid");

  const goHome = () => { setView("home"); setMobileMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goCatalog = (catName?: string | null) => {
    setView("catalog"); setMobileMenu(false);
    if (catName) setFilters((f) => ({ ...f, category: [catName] }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goCatalogByCatId = (catId: string) => {
    const c = CATEGORIES.find((c) => c.id === catId);
    goCatalog(c ? c.name : null);
  };
  const scrollHome = (id: string) => {
    if (view !== "home") { setView("home"); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60); }
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const handleHeroSearch = (q: string) => { setCatalogSearch(q); goCatalog(null); setFilters({ category: [], brand: [], usage: [], availability: [] }); };

  const toggleFav = (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const toggleCompare = (id: string) => setCompareList((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));
  const toggleFilter = (group: keyof CatalogFilters, value: string) => setFilters((f) => ({ ...f, [group]: f[group].includes(value) ? f[group].filter((v) => v !== value) : [...f[group], value] }));
  const clearFilters = () => setFilters({ category: [], brand: [], usage: [], availability: [] });

  const openProduct = (p: Product) => setSelectedProduct(p);
  const openQuote = (p: Product | null) => setQuoteFor(p);

  return (
    <div className={`im-root${dark ? " im-dark" : ""}`}>
      <Header
        dark={dark}
        setDark={setDark}
        view={view}
        goHome={goHome}
        goCatalog={() => goCatalog(null)}
        scrollHome={scrollHome}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
        openQuote={openQuote}
        favCount={favorites.length}
      />

      {view === "home" ? (
        <Home
          products={products}
          search={search}
          setSearch={setSearch}
          onSearchSubmit={handleHeroSearch}
          openProduct={openProduct}
          openQuote={openQuote}
          goCatalog={() => goCatalog(null)}
          goCatalogByCatId={goCatalogByCatId}
          favorites={favorites}
          toggleFav={toggleFav}
          compareList={compareList}
          toggleCompare={toggleCompare}
        />
      ) : (
        <CatalogPage
          allProducts={products}
          search={catalogSearch}
          setSearch={setCatalogSearch}
          filters={filters}
          toggleFilter={toggleFilter}
          clearFilters={clearFilters}
          sort={sort}
          setSort={setSort}
          gridView={gridView}
          setGridView={setGridView}
          onOpen={openProduct}
          favorites={favorites}
          toggleFav={toggleFav}
          compareList={compareList}
          toggleCompare={toggleCompare}
        />
      )}

      <Footer />

      <a
        href="#"
        onClick={(e) => { e.preventDefault(); openQuote(null); }}
        className="im-focus"
        style={{ position: "fixed", bottom: compareList.length ? 96 : 24, right: 24, zIndex: 50, width: 54, height: 54, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(37,211,102,0.4)", transition: "bottom .2s ease" }}
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={24} color="#fff" fill="#fff" />
      </a>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isFav={favorites.includes(selectedProduct.id)}
          toggleFav={toggleFav}
          openQuote={openQuote}
          onOpenRelated={(p) => setSelectedProduct(p)}
          related={products.filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 3)}
        />
      )}

      <QuoteModal product={quoteFor} onClose={() => setQuoteFor(undefined)} />

      <CompareBar products={products} ids={compareList} clear={() => setCompareList([])} remove={(id) => setCompareList((c) => c.filter((x) => x !== id))} openCompare={() => setCompareOpen(true)} />
      {compareOpen && <CompareModal products={products} ids={compareList} onClose={() => setCompareOpen(false)} />}
    </div>
  );
}
