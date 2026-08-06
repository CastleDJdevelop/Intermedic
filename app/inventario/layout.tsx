import { InventoryShell } from "@/components/inventory/shared/InventoryShell";

export default function InventarioLayout({ children }: { children: React.ReactNode }) {
  return <InventoryShell>{children}</InventoryShell>;
}
