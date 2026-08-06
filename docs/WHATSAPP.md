# Agente de WhatsApp — puesta en marcha

El código del agente ya está listo en `app/api/whatsapp/webhook/route.ts`.
Esta guía es para conectar tu número real (**+502 4102 2690**) a WhatsApp
Cloud API de Meta — son pasos que solo tú puedes hacer porque requieren tu
cuenta de Meta Business y verificación del número.

## 1. Crear la app de Meta

1. Entra a [developers.facebook.com](https://developers.facebook.com/) → **Mis apps → Crear app**.
2. Tipo de app: **"Otro"** → **"Empresa"**.
3. Dentro de la app, agrega el producto **WhatsApp**.

## 2. Conectar el número +502 4102 2690

1. En **WhatsApp → Configuración de la API**, Meta te da un número de prueba
   gratuito para probar de inmediato — úsalo primero para no arriesgar tu
   número real mientras pruebas.
2. Cuando quieras usar +502 4102 2690 en serio: **WhatsApp → Números de
   teléfono → Agregar número**, sigue la verificación por SMS/llamada.
   Importante: **ese número no puede tener WhatsApp normal (app de celular)
   activo al mismo tiempo** — Cloud API y la app de WhatsApp normal son
   excluyentes en el mismo número. Si hoy ya usas ese número desde el celular
   para atender clientes, considera usar un número secundario para el agente
   automático, o migrar conscientemente.
3. Guarda el **Phone number ID** que te asigna Meta — es tu
   `WHATSAPP_PHONE_NUMBER_ID`.

## 3. Generar el token de acceso

1. **WhatsApp → Configuración de la API → Token de acceso temporal** (dura
   24h, sirve para probar). Para producción: **Configuración de la empresa →
   Usuarios del sistema → Generar token permanente** con el permiso
   `whatsapp_business_messaging`.
2. Ese token es tu `WHATSAPP_TOKEN`.

## 4. Conectar el webhook a tu app en Vercel

1. Inventa un string cualquiera (ej. genera uno con `openssl rand -hex 16`)
   y guárdalo como `WHATSAPP_VERIFY_TOKEN` en Vercel.
2. En Meta: **WhatsApp → Configuración → Webhooks → Editar**:
   - URL de callback: `https://intermedic.vercel.app/api/whatsapp/webhook`
   - Verify token: el mismo valor que pusiste en `WHATSAPP_VERIFY_TOKEN`
3. Verificar y guardar — Meta hace un `GET` a esa URL que tu webhook ya
   responde (`app/api/whatsapp/webhook/route.ts`, función `GET`).
4. **Suscríbete al campo `messages`** en esa misma pantalla — sin esto no te
   llegan los mensajes entrantes al webhook.

## 5. Variables de entorno en Vercel

Agrega en **Settings → Environment Variables**:

```
WHATSAPP_VERIFY_TOKEN=el-string-que-inventaste
WHATSAPP_TOKEN=el-token-permanente-de-meta
WHATSAPP_PHONE_NUMBER_ID=el-id-que-te-dio-meta
```

Y si quieres que el agente responda con IA en vez de las respuestas fijas:

```
ANTHROPIC_API_KEY=tu-api-key-de-console.anthropic.com
```

(Esa API key es tuya, se factura aparte en tu cuenta de Anthropic — no es la
misma cuenta con la que hablas conmigo en claude.ai.)

## 6. Probar

Escríbele por WhatsApp al número conectado. El webhook:

1. Registra al remitente como un `Lead` en el CRM (origen `"WhatsApp"`) si es
   la primera vez que escribe.
2. Responde automáticamente — con Claude si configuraste `ANTHROPIC_API_KEY`,
   o con un set de respuestas fijas si no.

## Límites de esta primera versión

- El agente no tiene memoria de conversación entre mensajes (cada mensaje se
  responde de forma independiente) — para eso habría que guardar el
  historial por número en la base de datos y pasarlo como contexto.
- No hace handoff real a un humano (solo responde con un mensaje de "ya le
  contactamos"); un vendedor tiene que revisar el CRM y seguir la
  conversación manualmente desde su WhatsApp normal, o desde el mismo número
  si Cloud API lo permite en tu plan.
- No envía plantillas (`message templates`) para iniciar conversación fuera
  de la ventana de 24h que exige Meta — si el cliente no ha escrito en más
  de 24 horas, hay que usar una plantilla pre-aprobada por Meta para
  contactarlo de nuevo, no un mensaje libre.
