import { NextResponse } from "next/server";
import { getDB, createLeadFromQuoteRequest } from "@/lib/db";

/**
 * Agente de WhatsApp conectado a WhatsApp Cloud API (Meta), para el número
 * +502 4102 2690. Ver docs/WHATSAPP.md para la puesta en marcha completa
 * (cuenta de Meta Business, verificación del número, variables de entorno).
 *
 * Variables de entorno requeridas:
 *   WHATSAPP_VERIFY_TOKEN   — string que tú inventas, se usa en la verificación del webhook
 *   WHATSAPP_TOKEN          — access token permanente de la app de Meta
 *   WHATSAPP_PHONE_NUMBER_ID — id numérico del número de WhatsApp Business (lo da Meta)
 *   ANTHROPIC_API_KEY       — opcional. Si está presente, el agente usa Claude para
 *                             responder de forma más natural sobre el catálogo. Si no
 *                             está, usa un set de respuestas fijas (funciona igual, solo
 *                             menos flexible).
 */

/* ---------- 1) Verificación del webhook (handshake de Meta) ---------- */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Verificación fallida", { status: 403 });
}

/* ---------- 2) Mensajes entrantes ---------- */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  try {
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    // Meta también manda notificaciones de "status" (entregado/leído) sin
    // "messages" — no hay nada que responder en esas, se ignoran.
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const from: string = message.from; // número del cliente, en formato internacional sin "+"
    const contactName: string = change?.contacts?.[0]?.profile?.name ?? "Cliente WhatsApp";
    const text: string = message.text?.body ?? "";

    // Registra (o encuentra) el lead de este número, para que el mensaje
    // quede visible en el CRM con origen "WhatsApp" — misma conexión que ya
    // existe para el Sitio (createLeadFromQuoteRequest), reutilizada aquí.
    const db = await getDB();
    let lead = db.leads.find((l) => l.phone === from && l.source === "WhatsApp");
    if (!lead) {
      const created = await createLeadFromQuoteRequest({
        companyName: "Por definir",
        contactName,
        phone: from,
        source: "WhatsApp",
        note: text,
      });
      lead = created.lead;
    }

    const reply = await generateReply(text);
    await sendWhatsAppMessage(from, reply);

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Siempre 200 hacia Meta aunque algo interno falle, para que no reintente
    // el mismo webhook en bucle — el error queda en los logs de Vercel.
    console.error("Error procesando webhook de WhatsApp:", err);
    return NextResponse.json({ ok: true });
  }
}

/* ---------- Generación de la respuesta ---------- */
async function generateReply(incomingText: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return ruleBasedReply(incomingText);

  try {
    const db = await getDB();
    const catalogSummary = db.products
      .filter((p) => p.published !== false)
      .slice(0, 40)
      .map((p) => `- ${p.name} (${p.category}, marca ${p.brand})`)
      .join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 400,
        system:
          "Eres el asesor virtual de Intermedic, distribuidor de equipo médico en Guatemala, " +
          "respondiendo por WhatsApp. Responde en español, en 2-4 líneas máximo, tono cordial " +
          "y profesional. Si preguntan por un producto del catálogo, menciona que puedes darle " +
          "más detalles o pasarlo con un asesor humano. Si preguntan precio, indica que un asesor " +
          "le confirma el precio y disponibilidad exacta. Nunca inventes precios ni stock. " +
          "Este es un extracto del catálogo:\n" + catalogSummary,
        messages: [{ role: "user", content: incomingText }],
      }),
    });

    if (!res.ok) return ruleBasedReply(incomingText);
    const data = await res.json();
    const text = data?.content?.find((b: any) => b.type === "text")?.text;
    return text || ruleBasedReply(incomingText);
  } catch {
    return ruleBasedReply(incomingText);
  }
}

/** Respuestas fijas — funcionan sin necesidad de configurar ANTHROPIC_API_KEY. */
function ruleBasedReply(text: string): string {
  const t = text.toLowerCase();
  if (/precio|costo|cotiz/.test(t)) {
    return "¡Gracias por escribir a Intermedic! Para confirmarle precio y disponibilidad exacta, un asesor le va a contactar en breve. ¿Nos puede indicar qué equipo le interesa?";
  }
  if (/hola|buenas|buenos d[ií]as|buenas tardes/.test(t)) {
    return "¡Hola! Bienvenido a Intermedic, distribuidor de equipo médico en Guatemala. ¿En qué equipo o categoría está interesado?";
  }
  if (/asesor|humano|persona/.test(t)) {
    return "Claro, ya le comunicamos con uno de nuestros asesores. Mientras tanto, cuéntenos brevemente qué necesita para adelantar la atención.";
  }
  return "Gracias por su mensaje. Un asesor de Intermedic le responderá en breve. Si gusta, puede contarnos qué equipo o categoría busca para agilizar la atención.";
}

/* ---------- Envío de mensajes salientes vía WhatsApp Cloud API ---------- */
async function sendWhatsAppMessage(to: string, text: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    console.warn("WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID no configurados — no se envió respuesta real.");
    return;
  }

  await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}
