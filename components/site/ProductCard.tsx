"use client";

import { Heart, Scale, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { stockStatus } from "@/lib/stock";
import { catIcon, formatQ } from "./data";
import { ProductVisual, StockBadge, SectionHeading } from "./shared";

function badgeClass(badge: Product["badge"]) {
  if (badge === "Nuevo") return "im-badge-new";
  if (badge === "Promoción") return "im-badge-promo";
  return "im-badge-featured";
}

interface ProductCardProps {
  p: Product;
  onOpen: (p: Product) => void;
  isFav: boolean;
  toggleFav: (id: string) => void;
  isCompare: boolean;
  toggleCompare: (id: string) => void;
  listView?: boolean;
}

export function ProductCard({ p, onOpen, isFav, toggleFav, isCompare, toggleCompare, listView }: ProductCardProps) {
  const Icon = catIcon(p.category);
  const status = stockStatus(p);

  if (listView) {
    return (
      <div className="im-card" style={{ display: "flex", gap: 18, padding: 16, alignItems: "center" }}>
        <div style={{ width: 108, flexShrink: 0 }}>
          <ProductVisual colors={p.images ?? []} icon={Icon} size={0.75} />
        </div>
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onOpen(p)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            {p.badge && <span className={`im-badge ${badgeClass(p.badge)}`}>{p.badge}</span>}
            <span className="im-ink-faint" style={{ fontSize: 12 }}>{p.category} · {p.brand}</span>
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
          <div className="im-ink-faint" style={{ fontSize: 12.5 }}>{p.usage} <StockBadge status={status} /></div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="im-mono" style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{p.price ? formatQ(p.price) : "Cotizar"}</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button onClick={() => toggleFav(p.id)} className={`im-btn-icon im-focus ${isFav ? "active" : ""}`} style={{ width: 32, height: 32 }} aria-label="Favorito"><Heart size={14} fill={isFav ? "currentColor" : "none"} /></button>
            <button onClick={() => toggleCompare(p.id)} className={`im-btn-icon im-focus ${isCompare ? "active" : ""}`} style={{ width: 32, height: 32 }} aria-label="Comparar"><Scale size={14} /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="im-card" style={{ padding: 14, display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", cursor: "pointer" }} onClick={() => onOpen(p)}>
        <ProductVisual colors={p.images ?? []} icon={Icon} />
        {p.badge && <span className={`im-badge ${badgeClass(p.badge)}`} style={{ position: "absolute", top: 10, left: 10 }}>{p.badge}</span>}
        <button onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }} className={`im-btn-icon im-focus ${isFav ? "active" : ""}`} style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30 }} aria-label="Favorito">
          <Heart size={13} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      <div style={{ paddingTop: 14, cursor: "pointer", flex: 1 }} onClick={() => onOpen(p)}>
        <div className="im-ink-faint" style={{ fontSize: 11.5, marginBottom: 4 }}>{p.category} · {p.brand}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.35, marginBottom: 6, minHeight: 38 }} className="im-line-clamp-2">{p.name}</div>
        <div className="im-ink-faint" style={{ fontSize: 11.5, marginBottom: 10 }}>{p.usage} <StockBadge status={status} /></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
        <span className="im-mono" style={{ fontSize: 14.5, fontWeight: 600 }}>{p.price ? formatQ(p.price) : "Cotizar"}</span>
        <button onClick={() => toggleCompare(p.id)} className={`im-btn-icon im-focus ${isCompare ? "active" : ""}`} style={{ width: 30, height: 30 }} aria-label="Comparar"><Scale size={13} /></button>
      </div>
    </div>
  );
}

interface ProductRowProps {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  desc?: React.ReactNode;
  products: Product[];
  onSeeAll: () => void;
  onOpen: (p: Product) => void;
  favorites: string[];
  toggleFav: (id: string) => void;
  compareList: string[];
  toggleCompare: (id: string) => void;
}

export function ProductRow({ title, eyebrow, desc, products, onSeeAll, onOpen, favorites, toggleFav, compareList, toggleCompare }: ProductRowProps) {
  return (
    <section className="im-container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26, gap: 20 }}>
        <SectionHeading eyebrow={eyebrow} title={title} desc={desc} />
        <button onClick={onSeeAll} className="im-btn im-btn-outline im-focus" style={{ padding: "10px 18px", fontSize: 13.5, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
          Ver todo <ArrowRight size={14} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="im-prod-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            p={p}
            onOpen={onOpen}
            isFav={favorites.includes(p.id)}
            toggleFav={toggleFav}
            isCompare={compareList.includes(p.id)}
            toggleCompare={toggleCompare}
          />
        ))}
      </div>
    </section>
  );
}
