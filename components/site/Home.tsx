"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, HeartPulse, Quote, ChevronDown } from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORIES, SECTORS, SERVICES, TESTIMONIALS, BLOG_POSTS, FAQS, BRANDS } from "./data";
import { Eyebrow, SectionHeading, TickDivider } from "./shared";
import { ProductRow } from "./ProductCard";
import { SmartSearch } from "./Header";

function Hero({ products, search, setSearch, onSearchSubmit }: { products: Product[]; search: string; setSearch: (v: string) => void; onSearchSubmit: (q: string) => void }) {
  return (
    <section className="im-container" style={{ paddingTop: 56, paddingBottom: 40 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center" }} className="im-hero-grid">
        <div className="im-fade-up">
          <Eyebrow>Distribuidor de equipo médico · Guatemala</Eyebrow>
          <h1 className="im-display" style={{ fontSize: "clamp(34px,4.6vw,54px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 20 }}>
            Equipamos la precisión<br />detrás de cada diagnóstico.
          </h1>
          <p className="im-ink-soft" style={{ fontSize: 17.5, lineHeight: 1.65, maxWidth: 480, marginBottom: 32 }}>
            Equipo médico, hospitalario y de laboratorio para hospitales, clínicas y profesionales de la salud en toda Guatemala — con asesoría técnica real, no solo catálogo.
          </p>
          <div style={{ marginBottom: 28 }}>
            <SmartSearch products={products} value={search} onChange={setSearch} onSubmit={onSearchSubmit} variant="hero" />
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[["+12,000", "equipos distribuidos"], ["+500", "instituciones atendidas"], ["20 años", "de trayectoria"]].map(([n, l]) => (
              <div key={l}>
                <div className="im-mono im-display" style={{ fontSize: 22, fontWeight: 700 }}>{n}</div>
                <div className="im-ink-faint" style={{ fontSize: 12.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="im-fade-up im-hero-visual" style={{ height: 460, animationDelay: ".1s" }}>
          <div className="im-scan-grid" />
          <div className="im-scanline" />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 220, height: 220 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--teal))", opacity: 0.14, filter: "blur(30px)" }} />
              <div style={{ position: "absolute", inset: 30, borderRadius: "50%", border: "1px solid var(--line-strong)" }} />
              <div style={{ position: "absolute", inset: 60, borderRadius: "50%", border: "1px solid var(--line-strong)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 84, height: 84, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--teal))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 32px rgba(0,87,217,0.35)" }}>
                  <HeartPulse size={38} color="#fff" strokeWidth={1.6} />
                </div>
              </div>
            </div>
          </div>
          <div className="im-mono im-ink-faint" style={{ position: "absolute", bottom: 18, left: 18, fontSize: 11 }}>SIST. DE MONITOREO · EN VIVO</div>
          <div className="im-mono im-ink-faint" style={{ position: "absolute", top: 18, right: 18, fontSize: 11 }}>GT-2026</div>
        </div>
      </div>
    </section>
  );
}

function CategoryGrid({ onSelect }: { onSelect: (catId: string) => void }) {
  const shown = CATEGORIES.slice(0, 12);
  return (
    <section className="im-container" style={{ padding: "36px 24px 56px" }}>
      <SectionHeading eyebrow="Explore" title="Categorías" desc="Todo lo que necesita, organizado como su operación lo necesita." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginTop: 28 }} className="im-cat-grid">
        {shown.map((c) => (
          <button key={c.id} onClick={() => onSelect(c.id)} className="im-card im-focus" style={{ padding: "22px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", background: "var(--surface)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <c.icon size={20} className="im-primary" strokeWidth={1.75} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 500, textAlign: "center", lineHeight: 1.3 }}>{c.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function BrandStrip() {
  const list = [...BRANDS, ...BRANDS];
  return (
    <section className="im-border-t im-border-b im-bg-soft" style={{ padding: "26px 0", overflow: "hidden" }}>
      <div className="im-container" style={{ marginBottom: 14 }}>
        <span className="im-ink-faint im-mono" style={{ fontSize: 12, letterSpacing: ".05em", textTransform: "uppercase" }}>Marcas que distribuimos</span>
      </div>
      <div className="im-scrollbar-none" style={{ overflow: "hidden" }}>
        <div className="im-marquee-track" style={{ width: "max-content" }}>
          {list.map((b, i) => (
            <span key={i} className="im-display im-ink-faint" style={{ fontSize: 22, fontWeight: 600, whiteSpace: "nowrap" }}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sectors() {
  return (
    <section id="sectores" className="im-bg-soft" style={{ padding: "56px 0" }}>
      <div className="im-container">
        <SectionHeading eyebrow="A quién servimos" title="Sectores que atendemos" align="center" desc="Del hospital de tercer nivel al consultorio independiente." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 32 }} className="im-sector-grid">
          {SECTORS.map((s) => (
            <div key={s.name} className="im-card im-surface" style={{ padding: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--teal-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <s.icon size={19} style={{ color: "var(--teal)" }} strokeWidth={1.75} />
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 6 }}>{s.name}</div>
              <div className="im-ink-soft" style={{ fontSize: 13.5, lineHeight: 1.55 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services({ openQuote }: { openQuote: (p: null) => void }) {
  return (
    <section id="servicios" className="im-container" style={{ padding: "56px 24px" }}>
      <SectionHeading eyebrow="Más que venta" title="Servicios" desc="Acompañamos el equipo durante todo su ciclo de vida." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginTop: 30 }} className="im-serv-grid">
        {SERVICES.map((s) => (
          <div key={s.name} className="im-card" style={{ padding: 20 }}>
            <s.icon size={22} className="im-primary" strokeWidth={1.6} style={{ marginBottom: 14 }} />
            <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 6 }}>{s.name}</div>
            <div className="im-ink-soft" style={{ fontSize: 13, lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, textAlign: "center" }}>
        <button onClick={() => openQuote(null)} className="im-btn im-btn-primary im-focus" style={{ padding: "12px 24px", fontSize: 14.5 }}>Hablar con un asesor</button>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="im-bg-soft" style={{ padding: "56px 0" }}>
      <div className="im-container">
        <SectionHeading eyebrow="Casos de éxito" title="Instituciones que confían en nosotros" align="center" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 32 }} className="im-test-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="im-card im-surface" style={{ padding: 24 }}>
              <Quote size={20} className="im-primary" style={{ marginBottom: 14, opacity: 0.5 }} />
              <p style={{ fontSize: 14.5, lineHeight: 1.6, marginBottom: 18 }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
              <div className="im-ink-faint" style={{ fontSize: 12.5 }}>{t.org}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Blog() {
  return (
    <section className="im-container" style={{ padding: "56px 24px" }}>
      <SectionHeading eyebrow="Recursos" title="Blog" desc="Guías prácticas para elegir, mantener y aprovechar mejor su equipo." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 28 }} className="im-blog-grid">
        {BLOG_POSTS.map((b, i) => (
          <div key={i} className="im-card" style={{ padding: 20, cursor: "pointer" }}>
            <div style={{ height: 120, borderRadius: 10, background: "linear-gradient(135deg, var(--primary-soft), var(--teal-soft))", marginBottom: 16 }} />
            <span className="im-mono im-primary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em" }}>{b.tag} · {b.read}</span>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8, lineHeight: 1.4 }}>{b.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section className="im-bg-soft" style={{ padding: "56px 0" }}>
      <div className="im-container" style={{ maxWidth: 760 }}>
        <SectionHeading eyebrow="Dudas frecuentes" title="Preguntas frecuentes" align="center" />
        <div style={{ marginTop: 28 }}>
          {FAQS.map((f, i) => (
            <div key={i} className="im-border-b" style={{ padding: "18px 4px" }}>
              <button onClick={() => setOpenIdx(openIdx === i ? -1 : i)} className="im-focus" style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{f.q}</span>
                <ChevronDown size={17} className="im-ink-faint" style={{ transform: openIdx === i ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0, marginLeft: 12 }} />
              </button>
              {openIdx === i && <p className="im-ink-soft" style={{ fontSize: 14, lineHeight: 1.65, marginTop: 12, maxWidth: 640 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ openQuote }: { openQuote: (p: null) => void }) {
  return (
    <section id="contacto" className="im-container" style={{ padding: "56px 24px" }}>
      <SectionHeading eyebrow="Contacto" title="Hablemos de su próximo proyecto" desc="Escríbanos y un asesor especializado le contactará en menos de 24 horas hábiles." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 32 }} className="im-contact-grid">
        <div className="im-card" style={{ padding: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={17} className="im-primary" /></div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Oficina central</div>
              <div className="im-ink-soft" style={{ fontSize: 13.5 }}>Zona 10, Ciudad de Guatemala</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--teal-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Phone size={17} style={{ color: "var(--teal)" }} /></div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Teléfono / WhatsApp</div>
              <div className="im-ink-soft im-mono" style={{ fontSize: 13.5 }}>+502 2200 0000</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--amber-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Mail size={17} style={{ color: "var(--amber)" }} /></div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Correo</div>
              <div className="im-ink-soft im-mono" style={{ fontSize: 13.5 }}>ventas@intermedic.gt</div>
            </div>
          </div>
          <button onClick={() => openQuote(null)} className="im-btn im-btn-primary im-focus" style={{ width: "100%", padding: "13px", fontSize: 14.5 }}>Solicitar cotización general</button>
        </div>
        <div className="im-card" style={{ position: "relative", overflow: "hidden", minHeight: 260 }}>
          <div className="im-scan-grid" />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <MapPin size={28} className="im-primary" />
            <span className="im-ink-faint im-mono" style={{ fontSize: 12 }}>Mapa · Zona 10, Guatemala</span>
            <span className="im-ink-faint" style={{ fontSize: 12 }}>Cobertura a nivel nacional</span>
          </div>
        </div>
      </div>
    </section>
  );
}

interface HomeProps {
  products: Product[];
  search: string;
  setSearch: (v: string) => void;
  onSearchSubmit: (q: string) => void;
  openProduct: (p: Product) => void;
  openQuote: (p: Product | null) => void;
  goCatalog: () => void;
  goCatalogByCatId: (catId: string) => void;
  favorites: string[];
  toggleFav: (id: string) => void;
  compareList: string[];
  toggleCompare: (id: string) => void;
}

export function Home({ products, search, setSearch, onSearchSubmit, openProduct, openQuote, goCatalog, goCatalogByCatId, favorites, toggleFav, compareList, toggleCompare }: HomeProps) {
  const featured = products.filter((p) => p.badge === "Destacado");
  const nuevos = products.filter((p) => p.badge === "Nuevo").concat(products.filter((p) => !p.badge)).slice(0, 4);
  const promos = products.filter((p) => p.badge === "Promoción")
    .concat(products.filter((p) => p.usage === "Reacondicionado"))
    .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
    .slice(0, 4);

  return (
    <>
      <Hero products={products} search={search} setSearch={setSearch} onSearchSubmit={onSearchSubmit} />
      <TickDivider />
      <CategoryGrid onSelect={goCatalogByCatId} />
      <BrandStrip />
      <ProductRow
        eyebrow="Selección"
        title="Productos destacados"
        desc="Los equipos más solicitados por hospitales y clínicas."
        products={featured.length ? featured : products.slice(0, 4)}
        onSeeAll={goCatalog}
        onOpen={openProduct}
        favorites={favorites}
        toggleFav={toggleFav}
        compareList={compareList}
        toggleCompare={toggleCompare}
      />
      <TickDivider />
      <ProductRow
        eyebrow="Recién llegados"
        title="Productos nuevos"
        desc="Lo último en incorporarse a nuestro catálogo."
        products={nuevos}
        onSeeAll={goCatalog}
        onOpen={openProduct}
        favorites={favorites}
        toggleFav={toggleFav}
        compareList={compareList}
        toggleCompare={toggleCompare}
      />
      <ProductRow
        eyebrow="Aprovechar"
        title="Promociones y reacondicionados"
        desc="Equipo certificado por Intermedic, con garantía y mejor precio."
        products={promos.length ? promos : products.slice(4, 8)}
        onSeeAll={goCatalog}
        onOpen={openProduct}
        favorites={favorites}
        toggleFav={toggleFav}
        compareList={compareList}
        toggleCompare={toggleCompare}
      />
      <Sectors />
      <Services openQuote={openQuote} />
      <Testimonials />
      <Blog />
      <FAQ />
      <Contact openQuote={openQuote} />
    </>
  );
}
