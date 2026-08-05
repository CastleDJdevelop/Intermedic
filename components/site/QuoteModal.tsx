"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { Eyebrow } from "./shared";

interface QuoteModalProps {
  product: Product | null | undefined;
  onClose: () => void;
}

/**
 * Esta es la CONEXIÓN Sitio Web → CRM (misma integración probada en Fase 0):
 * hace POST real a /api/leads, que crea un Lead (y una Quote en borrador si
 * hay producto) con origen "Sitio web". No simula el envío.
 */
export function QuoteModal({ product, onClose }: QuoteModalProps) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (product === undefined) return null;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: form.get("contactName"),
          companyName: form.get("companyName"),
          email: form.get("email") || undefined,
          phone: form.get("phone") || undefined,
          productId: product?.id,
          qty: form.get("qty") ? Number(form.get("qty")) : undefined,
          note: form.get("note") || undefined,
        }),
      });
      if (!res.ok) throw new Error("No se pudo enviar la solicitud");
      setSent(true);
    } catch {
      setError("No se pudo enviar la solicitud. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="im-backdrop" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.55)" }} />
      <div className="im-surface im-shadow-lg im-fade-up" style={{ position: "relative", width: "min(460px, 100%)", borderRadius: 18, padding: 28, maxHeight: "88vh", overflowY: "auto" }}>
        <button onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 18, right: 18, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>
        {sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--teal-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Check size={24} style={{ color: "var(--teal)" }} strokeWidth={2.5} />
            </div>
            <div className="im-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Solicitud enviada</div>
            <p className="im-ink-soft" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 22 }}>
              Se creó un lead en el CRM con esta solicitud. Un asesor de Intermedic le contactará en menos de 24 horas hábiles.
            </p>
            <button onClick={onClose} className="im-btn im-btn-outline im-focus" style={{ padding: "10px 22px", fontSize: 13.5 }}>Cerrar</button>
          </div>
        ) : (
          <>
            <Eyebrow>Solicitar cotización</Eyebrow>
            <h3 className="im-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{product ? product.name : "Cotización general"}</h3>
            <p className="im-ink-soft" style={{ fontSize: 13.5, marginBottom: 20 }}>Complete el formulario y le enviaremos una propuesta a la medida.</p>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input name="contactName" required placeholder="Nombre completo" className="im-input im-focus" style={{ padding: "11px 14px", fontSize: 13.5 }} />
              <input name="companyName" required placeholder="Institución / empresa" className="im-input im-focus" style={{ padding: "11px 14px", fontSize: 13.5 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input name="email" type="email" placeholder="Correo electrónico" className="im-input im-focus" style={{ flex: 1, padding: "11px 14px", fontSize: 13.5 }} />
                <input name="phone" type="tel" placeholder="Teléfono" className="im-input im-focus" style={{ flex: 1, padding: "11px 14px", fontSize: 13.5 }} />
              </div>
              {product && <input name="qty" type="number" min={1} defaultValue={1} placeholder="Cantidad estimada" className="im-input im-focus" style={{ padding: "11px 14px", fontSize: 13.5 }} />}
              <textarea name="note" placeholder="Mensaje (opcional)" rows={3} className="im-input im-focus" style={{ padding: "11px 14px", fontSize: 13.5, resize: "vertical", fontFamily: "inherit" }} />
              {error && <span style={{ color: "var(--red, #d65959)", fontSize: 12.5 }}>{error}</span>}
              <button type="submit" disabled={loading} className="im-btn im-btn-primary im-focus" style={{ padding: "13px", fontSize: 14.5, marginTop: 6 }}>
                {loading ? "Enviando…" : "Enviar solicitud"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
