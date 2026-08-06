# Intermedic — Plataforma conectada

Sitio web (catálogo público) + CRM + Inventario sobre una misma base de datos
en Postgres, con autenticación real por roles y checkout/agente por WhatsApp.

## Estado actual

| Parte | Estado |
|---|---|
| Sitio, CRM e Inventario conectados a una sola base de datos | ✅ Real |
| Persistencia (`lib/db.ts`) | ✅ Postgres (Neon), funciona en Vercel |
| Autenticación (usuario/contraseña + sesión firmada) | ✅ Real |
| Roles (Administrador / Vendedor) con protección de páginas y API | ✅ Real |
| Checkout por WhatsApp (wa.me) | ✅ Real, sin configuración adicional |
| Agente automático de WhatsApp (WhatsApp Cloud API) | ✅ Código listo — requiere que tú configures la cuenta de Meta Business (ver `docs/WHATSAPP.md`) |
| Migración a un esquema relacional completo (Prisma, tabla por entidad) | ⏳ Pendiente, no bloqueante — hoy la DB guarda el estado como JSONB versionado |

## Cómo correrlo en local

```bash
npm install
cp .env.example .env.local   # y completa las variables (ver abajo)
npm run dev
# abre http://localhost:3000
```

## Variables de entorno

| Variable | Requerida | Para qué |
|---|---|---|
| `DATABASE_URL` | Sí | Connection string de Postgres (Neon). En Vercel se agrega sola al conectar la integración de Neon (Storage → Marketplace → Neon). En local, copia esa misma connection string a `.env.local`. |
| `SESSION_SECRET` | Sí | String aleatorio largo (mínimo 16 caracteres) para firmar la cookie de sesión. Genera uno con `openssl rand -hex 32`. |
| `WHATSAPP_VERIFY_TOKEN` | Solo para el agente automático | String que tú inventas, se usa al conectar el webhook en Meta. |
| `WHATSAPP_TOKEN` | Solo para el agente automático | Access token permanente de tu app de Meta Business. |
| `WHATSAPP_PHONE_NUMBER_ID` | Solo para el agente automático | Lo asigna Meta al verificar +502 4102 2690. |
| `ANTHROPIC_API_KEY` | Opcional | Si la agregas, el agente de WhatsApp responde con Claude en vez de respuestas fijas. |

El botón de **"Confirmar por WhatsApp"** del sitio (wa.me) no necesita ninguna
de las 4 últimas variables — funciona de inmediato porque solo abre un link,
no requiere API.

## Desplegar en Vercel

1. Importa el repo de GitHub en Vercel (ya lo tienes hecho: `intermedic.vercel.app`).
2. **Storage → Marketplace → Neon** → crear/conectar una base — esto agrega
   `DATABASE_URL` automáticamente a las variables de entorno del proyecto.
3. **Settings → Environment Variables** → agrega `SESSION_SECRET` (genera uno
   con `openssl rand -hex 32`, no reutilices el de otro proyecto).
4. Redeploy. En el primer request a cualquier endpoint que lea la base, la
   tabla `app_state` se crea sola y se siembra con los datos de `data/db.json`.
5. (Opcional) Para el agente de WhatsApp, sigue `docs/WHATSAPP.md` y agrega
   `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
   (y `ANTHROPIC_API_KEY` si quieres respuestas con IA).

## Usuarios de acceso (CRM / Inventario)

Los tres usuarios de `data/db.json` tienen la misma contraseña temporal:

| Usuario | Rol | Contraseña |
|---|---|---|
| `rixchel` | Administrador | `Intermedic2026!` |
| `msay` | Vendedor | `Intermedic2026!` |
| `opineda` | Vendedor | `Intermedic2026!` |

**Cámbialas antes de dar acceso real a tu equipo** — no hay todavía pantalla
de "cambiar contraseña"; por ahora se cambia generando un nuevo hash con
`node -e "console.log(require('./lib/auth.ts'))"` (o pídele a Claude Code que
agregue esa pantalla) y actualizando `passwordHash` directamente en la fila
de `app_state` en Postgres, o en `data/db.json` si vas a resembrar desde cero.

- **Administrador**: acceso completo (Sitio, CRM, Inventario, productos, costos, movimientos, Kardex).
- **Vendedor**: CRM completo + puede registrar movimientos de tipo "Salida" (venta directa). No puede crear/editar productos, ni movimientos de Entrada/Transferencia/Ajuste, ni consultar Kardex.

## Carpeta `reference/`

Los tres prototipos originales (artifacts de React de una sola pantalla) se
mantienen aquí solo como referencia de diseño — no se importan en la app.

## Siguiente paso recomendado (no bloqueante)

Migrar `lib/db.ts` de un blob JSONB a tablas relacionales reales con Prisma
(una tabla por entidad: Product, Company, Lead, Deal, etc.) para poder hacer
queries/reportes más eficientes a medida que crece el volumen de datos. Ver
`docs/ROADMAP.md`, Fase 5.
