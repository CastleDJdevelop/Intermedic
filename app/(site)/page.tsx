import { getDB } from "@/lib/db";
import { SiteApp } from "@/components/site/SiteApp";

export const dynamic = "force-dynamic";

export default function SitePage() {
  const db = getDB();
  const products = db.products.filter((p) => p.published !== false);

  return <SiteApp products={products} />;
}
