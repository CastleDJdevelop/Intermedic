"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import type { Product } from "@/lib/types";

const CATEGORIES = [
  "Equipo médico",
  "Equipo hospitalario",
  "Instrumental quirúrgico",
  "Diagnóstico",
  "Mobiliario médico",
  "Equipo de laboratorio",
  "Insumos médicos",
  "Rehabilitación",
  "Ortopedia",
  "Cuidado del paciente",
  "Monitores",
  "Esterilizadores",
];

interface NewProductModalProps {
  existingSkus: string[];
  onClose: () => void;
  onCreated: (product: Product) => void;
}

export function NewProductModal({ existingSkus, onClose, onCreated }: NewProductModalProps) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [categoryCustom, setCategoryCustom] = useState("");
  const [brand, setBrand] = useState("");
  const [supplier, setSupplier] = useState("");
  const [unit, setUnit] = useState("unidad");
  const [price, setPrice] = useState("");
  const [costProm, setCostProm] = useState("");
  const [ultimoCosto, setUltimoCosto] = useState("");
  const [stockMin, setStockMin] = useState("0");
  const [stockMax, setStockMax] = useState("0");
  const [serialized, setSerialized] = useState(false);
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState<"Nuevo" | "Promoción" | "Destacado" | "">("Nuevo");
  const [usage, setUsage] = useState<"Nuevo" | "Reacondicionado" | "">("Nuevo");
  const [delivery, setDelivery] = useState("5–7 días hábiles");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skuExists = existingSkus.includes(sku.trim());
  const finalCategory = category === "Otro" ? categoryCustom : category;
  const canSave =
    sku.trim() &&
    name.trim() &&
    finalCategory &&
    costProm &&
    !skuExists &&
    !isNaN(Number(costProm)) &&
    !isNaN(Number(ultimoCosto || "0")) &&
    !isNaN(Number(stockMin || "0")) &&
    !isNaN(Number(stockMax || "0")) &&
    !isNaN(Number(price || "0"));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: sku.trim(),
          barcode: "",
          name: name.trim(),
          category: finalCategory,
          brand: brand.trim(),
          supplier: supplier.trim(),
          unit: unit || "unidad",
          price: price ? Number(price) : null,
          costProm: Number(costProm),
          ultimoCosto: Number(ultimoCosto || costProm),
          stockMin: Number(stockMin || 0),
          stockMax: Number(stockMax || 0),
          serialized,
          description: description.trim() || undefined,
          badge: badge || null,
          usage: usage || undefined,
          delivery: delivery || undefined,
          published,
        }),
      });

      const resBody = await res.json();
      if (!res.ok) throw new Error(resBody.error ?? "No se pudo crear el producto");

      onCreated(resBody);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  const categoryOptions = [
    ...CATEGORIES,
    category === "Otro" || (category && !CATEGORIES.includes(category)) ? "Otro" : null,
  ].filter(Boolean) as string[];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.55)" }} />
      <form
        onSubmit={submit}
        className="im-surface im-shadow-lg im-fade-up im-scrollbar-none"
        style={{ position: "relative", width: "min(560px,100%)", maxHeight: "90vh", overflowY: "auto", borderRadius: 16, padding: 26 }}
      >
        <button type="button" onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }} aria-label="Cerrar">
          <X size={14} />
        </button>

        <h3 className="im-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, paddingRight: 30 }}>Nuevo producto</h3>
        <p className="im-ink-soft" style={{ fontSize: 12.5, marginBottom: 18 }}>El stock inicial se registrará mediante una entrada de inventario después de crear el producto, para mantener un kardex completo.</p>

        {/* SKU y Nombre */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              SKU <span style={{ color: "var(--red, #d65959)" }}>*</span>
            </label>
            <input
              required
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="im-input im-focus"
              style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, borderColor: skuExists ? "var(--red, #d65959)" : undefined }}
              placeholder="Ej. MED-001"
            />
            {skuExists && <div style={{ color: "var(--red, #d65959)", fontSize: 11, marginTop: 4 }}>SKU ya existe</div>}
          </div>
          <div style={{ flex: 1.5 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              Nombre <span style={{ color: "var(--red, #d65959)" }}>*</span>
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="im-input im-focus"
              style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}
              placeholder="Ej. Monitor de signos vitales"
            />
          </div>
        </div>

        {/* Categoría */}
        <div style={{ marginBottom: 14 }}>
          <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
            Categoría <span style={{ color: "var(--red, #d65959)" }}>*</span>
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, marginBottom: 8 }}>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {category === "Otro" && (
            <input
              type="text"
              value={categoryCustom}
              onChange={(e) => setCategoryCustom(e.target.value)}
              className="im-input im-focus"
              style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}
              placeholder="Escriba la categoría"
            />
          )}
        </div>

        {/* Marca, Proveedor, Unidad */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              Marca
            </label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Mindray" />
          </div>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              Proveedor
            </label>
            <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Distribuidora X" />
          </div>
          <div style={{ flex: 0.8 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              Unidad
            </label>
            <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="unidad" />
          </div>
        </div>

        {/* Costos y Precios */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              Costo promedio (Q) <span style={{ color: "var(--red, #d65959)" }}>*</span>
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={costProm}
              onChange={(e) => setCostProm(e.target.value)}
              className="im-input im-focus"
              style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              Último costo (Q)
            </label>
            <input type="number" min="0" step="0.01" value={ultimoCosto} onChange={(e) => setUltimoCosto(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder={costProm} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              Precio público (Q)
            </label>
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Opcional" />
          </div>
        </div>

        {/* Stock mínimo y máximo */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              Stock mínimo
            </label>
            <input type="number" min="0" value={stockMin} onChange={(e) => setStockMin(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              Stock máximo
            </label>
            <input type="number" min="0" value={stockMax} onChange={(e) => setStockMax(e.target.value)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} />
          </div>
        </div>

        {/* Serialized */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
            <input type="checkbox" checked={serialized} onChange={(e) => setSerialized(e.target.checked)} className="im-focus" style={{ width: 16, height: 16, cursor: "pointer" }} />
            <span className="im-ink-soft">Requiere número de serie</span>
          </label>
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: 14 }}>
          <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="im-input im-focus"
            style={{ width: "100%", padding: "9px 12px", fontSize: 13.5, minHeight: 80, fontFamily: "inherit" }}
            placeholder="Especificaciones técnicas o detalles del producto"
          />
        </div>

        {/* Badge, Uso, Entrega */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              Badge en sitio
            </label>
            <select value={badge} onChange={(e) => setBadge(e.target.value as any)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>
              <option value="">Ninguno</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Promoción">Promoción</option>
              <option value="Destacado">Destacado</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
              Condición
            </label>
            <select value={usage} onChange={(e) => setUsage(e.target.value as any)} className="im-input im-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>
              <option value="">No especificado</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Reacondicionado">Reacondicionado</option>
            </select>
          </div>
        </div>

        {/* Entrega */}
        <div style={{ marginBottom: 14 }}>
          <label className="im-ink-soft" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
            Tiempo de entrega estimado
          </label>
          <input
            type="text"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            className="im-input im-focus"
            style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}
            placeholder="Ej. 5–7 días hábiles"
          />
        </div>

        {/* Publicación */}
        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="im-focus" style={{ width: 16, height: 16, cursor: "pointer" }} />
            <span>Publicar en el sitio público</span>
          </label>
          <p className="im-ink-faint" style={{ fontSize: 11, marginTop: 6 }}>Si no está marcado, el producto existe en Inventario pero no aparece en el catálogo público.</p>
        </div>

        {error && <div style={{ color: "var(--red, #d65959)", fontSize: 12.5, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={saving || !canSave} className="im-btn im-btn-primary im-focus" style={{ flex: 1, padding: 12, fontSize: 13.5 }}>
            {saving ? "Creando…" : "Crear producto"}
          </button>
          <button type="button" onClick={onClose} className="im-btn im-btn-ghost im-focus" style={{ padding: 12, fontSize: 13.5 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
