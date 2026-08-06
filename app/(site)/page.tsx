import { getDB } from "@/lib/db";
import { SiteApp } from "@/components/site/SiteApp";

export const dynamic = "force-dynamic";

export default async function SitePage() {
  const db = await getDB();
  const products = db.products.filter((p) => p.published !== false);

  return <SiteApp products={products} />;
}
