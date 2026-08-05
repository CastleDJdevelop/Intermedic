import type { DealStage } from "@/lib/types";

export const STAGES: DealStage[] = ["Prospección", "Calificación", "Propuesta enviada", "Negociación", "Ganado", "Perdido"];

export const STAGE_COLOR: Record<DealStage, string> = {
  "Prospección": "var(--ink-faint)",
  "Calificación": "var(--primary)",
  "Propuesta enviada": "var(--amber)",
  "Negociación": "#7C5CFF",
  "Ganado": "var(--teal)",
  "Perdido": "var(--red)",
};

export function formatQ(n: number) {
  return `Q ${n.toLocaleString("es-GT")}`;
}
