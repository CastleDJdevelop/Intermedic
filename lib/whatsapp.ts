/**
 * Helper de checkout/confirmación por WhatsApp (sin dependencias, funciona
 * en el cliente). Genera un link wa.me al número de ventas de Intermedic
 * con el mensaje pre-cargado — el visitante solo tiene que darle "Enviar"
 * en WhatsApp para confirmar. No requiere ninguna configuración de API.
 *
 * El número de WhatsApp Business real (+502 4102 2690) también recibe
 * mensajes entrantes de clientes, que responde el agente configurado en
 * /api/whatsapp/webhook (ver docs/WHATSAPP.md para la puesta en marcha).
 */

export const INTERMEDIC_WHATSAPP_NUMBER = "50241022690"; // +502 4102 2690, formato E.164 sin "+"

export function buildWhatsAppLink(message: string, phone: string = INTERMEDIC_WHATSAPP_NUMBER): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildQuoteWhatsAppMessage(input: {
  productName?: string | null;
  qty?: number;
  contactName: string;
  companyName: string;
  note?: string;
}): string {
  const lines = [
    `Hola, quisiera confirmar una cotización con Intermedic.`,
    input.productName ? `Producto: ${input.productName}${input.qty ? ` (cantidad: ${input.qty})` : ""}` : null,
    `Institución/empresa: ${input.companyName}`,
    `Contacto: ${input.contactName}`,
    input.note ? `Nota: ${input.note}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}
