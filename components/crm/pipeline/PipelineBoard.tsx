"use client";

import { useState } from "react";
import type { Deal, DealStage } from "@/lib/types";
import { DealCard } from "./DealCard";
import { STAGES, STAGE_COLOR, formatQ } from "./constants";

interface PipelineBoardProps {
  deals: Deal[];
  companyNameById: Map<string, string>;
  onOpenDeal: (deal: Deal) => void;
  onMoveStage: (dealId: string, stage: DealStage) => Promise<void>;
}

export function PipelineBoard({ deals, companyNameById, onOpenDeal, onMoveStage }: PipelineBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<DealStage | null>(null);

  async function handleDrop(stage: DealStage) {
    if (draggingId) await onMoveStage(draggingId, stage);
    setDraggingId(null);
    setOverStage(null);
  }

  return (
    <div className="im-scrollbar-none" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
      {STAGES.map((stage) => {
        const items = deals.filter((d) => d.stage === stage);
        const total = items.reduce((sum, d) => sum + d.value, 0);
        const isOver = overStage === stage;
        return (
          <div
            key={stage}
            onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
            onDragLeave={() => setOverStage(null)}
            onDrop={() => handleDrop(stage)}
            style={{
              minWidth: 250, width: 250, flexShrink: 0, borderRadius: 14, padding: 12,
              maxHeight: "calc(100vh - 260px)", overflowY: "auto",
              background: isOver ? "var(--primary-soft)" : "var(--bg-soft)",
              border: "1px solid " + (isOver ? "var(--primary)" : "var(--line)"),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: STAGE_COLOR[stage] }} />
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>{stage}</span>
              <span className="im-mono im-ink-faint" style={{ fontSize: 11, marginLeft: "auto" }}>{items.length}</span>
            </div>
            <div className="im-mono im-ink-faint" style={{ fontSize: 11, marginBottom: 12 }}>{formatQ(total)}</div>
            {items.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                companyName={companyNameById.get(deal.companyId) ?? "—"}
                dragging={draggingId === deal.id}
                onOpen={onOpenDeal}
                onDragStart={(e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = "move"; }}
              />
            ))}
            {items.length === 0 && <div className="im-ink-faint" style={{ fontSize: 12, textAlign: "center", padding: "20px 0" }}>Sin negocios</div>}
          </div>
        );
      })}
    </div>
  );
}
