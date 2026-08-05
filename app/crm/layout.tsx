import { CRMShell } from "@/components/crm/shared/CRMShell";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return <CRMShell>{children}</CRMShell>;
}
