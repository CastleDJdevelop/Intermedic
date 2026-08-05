"use client";

import { GripVertical } from "lucide-react";
import type { Deal } from "@/lib/types";
import { formatQ } from "./constants";

function daysUntil(iso: string) {
  return Math.round((new Date(iso + "T00:00:00").getTime() - new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime()) / 86400000);
}

interface DealCardProps {
  deal: Deal;
  companyName: string;
  dragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onOpen: (deal: Deal) => void;
}

export function DealCard({ deal, companyName, dragging, onDragStart, onOpen }: DealCardProps) {
  const d = daysUntil(deal.closeDate);
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onClick={() => onOpen(deal)}
      className="im-card"
      style={{ padding: 13, marginBottom: 10, cursor: "grab", opacity: dragging ? 0.4 : 1 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>{deal.title}</span>
        <GripVertical size={13} className="im-ink-faint" style={{ flexShrink: 0, marginTop: 2 }} />
      </div>
      <div className="im-ink-faint" style={{ fontSize: 11.5, marginBottom: 10 }}>{companyName}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="im-mono" style={{ fontSize: 13, fontWeight: 700 }}>{formatQ(deal.value)}</span>
        <span className="im-ink-faint" style={{ fontSize: 11 }}>{deal.rep || "Sin asignar"}</span>
      </div>
      {deal.quoteId && (
        <div className="im-mono" style={{ fontSize: 10, marginTop: 6, color: "var(--primary)" }}>Cotización vinculada</div>
      )}
      {deal.stage !== "Ganado" && deal.stage !== "Perdido" && (
        <div className="im-ink-faint" style={{ fontSize: 10.5, marginTop: 6 }}>{d >= 0 ? `Cierra en ${d} días` : `Vencido hace ${-d} días`}</div>
      )}
    </div>
  );
}
