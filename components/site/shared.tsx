"use client";

import type { LucideIcon } from "lucide-react";
import type { StockStatus } from "@/lib/stock";

export function TickDivider() {
  return (
    <div className="im-tick-divider" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`im-tick ${i === 2 ? "long" : "short"}`} />
      ))}
      <div className="im-tick dot" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={"b" + i} className={`im-tick ${i === 2 ? "long" : "short"}`} />
      ))}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="im-mono im-primary" style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, desc, align = "left" }: { eyebrow?: React.ReactNode; title: React.ReactNode; desc?: React.ReactNode; align?: "left" | "center" }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === "center" ? 620 : 560, margin: align === "center" ? "0 auto" : 0 }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="im-display" style={{ fontSize: "clamp(26px,3.2vw,38px)", fontWeight: 600, lineHeight: 1.15, marginBottom: 12 }}>{title}</h2>
      {desc && <p className="im-ink-soft" style={{ fontSize: 16, lineHeight: 1.6 }}>{desc}</p>}
    </div>
  );
}

export function ProductVisual({ colors, icon: Icon, size = 1 }: { colors: string[]; icon: LucideIcon; size?: number }) {
  const [c0, c1] = colors.length >= 2 ? colors : ["#0057D9", "#00B39E"];
  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 14, overflow: "hidden",
      background: `linear-gradient(135deg, ${c0}1A, ${c1}26)`,
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)", backgroundSize: "18px 18px", opacity: 0.5 }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 64 * size, height: 64 * size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(135deg, ${c0}, ${c1})`, boxShadow: `0 8px 24px ${c0}40`,
        }}>
          <Icon size={28 * size} color="#fff" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}

export function StockBadge({ status }: { status: StockStatus }) {
  if (status === "out") return <span className="im-mono im-ink-faint" style={{ fontSize: 11.5 }}>· agotado</span>;
  if (status === "low") return <span className="im-mono im-ink-faint" style={{ fontSize: 11.5 }}>· pocas unidades</span>;
  return <span className="im-mono im-ink-faint" style={{ fontSize: 11.5 }}>· en stock</span>;
}
