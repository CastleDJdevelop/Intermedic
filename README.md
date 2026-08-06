# Intermedic — Plataforma conectada

Sitio web (catálogo público) + CRM + Inventario sobre una misma base de datos
en Postgres, con autenticación real por roles y checkout/agente por WhatsApp.

## Estado actual — Todas las fases completadas

| Módulo | Estado |
|---|---|
| **Sitio web** | ✅ Catálogo público, búsqueda, filtros, favoritos, comparador, cotización |
| **CRM** | ✅ Leads, Pipeline, Empresas, Contactos, Cotizaciones, Tareas, Reportes, **Reservas, Facturas** |
| **Inventario** | ✅ Productos, Movimientos, Kardex, Bodegas, Categorías, Proveedores, Reportes |
| **Autenticación** | ✅ Scrypt, sesiones, roles (Admin/Vendedor), permisos server-side |
| **WhatsApp** | ✅ Checkout wa.me + Cloud API webhook (recibe mensajes, crea leads, responde con IA) |
| **Usuarios** | ✅ Panel de administración, cambio de contraseña (Admin/User) |
| **Base de datos** | ✅ data/db.json (dev) + Postgres/Neon (prod, JSONB versionado) |
| **Desarrollo** | ✅ npm run build pasa, npm run dev funciona, middleware protege rutas |

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

**Cámbialas antes de dar acceso real a tu equipo**:
- **Admin**: ve a CRM → Usuarios, selecciona el usuario, ingresa nueva contraseña y guarda.
- **User**: en /crm/dashboard, click en tu usuario (arriba a la derecha) → "Cambiar contraseña".

### Permisos por rol

- **Administrador**: acceso completo (Sitio, CRM completo, Inventario, Reservas, Facturas, Usuarios). Puede cambiar contraseñas de otros usuarios.
- **Vendedor**: acceso a CRM (leads, deals, empresas, contactos, cotizaciones, tareas, reservas, facturas). Puede registrar movimientos de tipo "Salida" (venta directa) en Inventario. No puede crear/editar productos, ni hacer Entrada/Transferencia/Ajuste, ni ver Kardex/costos.

## Carpeta `reference/`

Los tres prototipos originales (artifacts de React de una sola pantalla) se
mantienen aquí solo como referencia de diseño — no se importan en la app.

## Siguiente paso recomendado (no bloqueante)

Migrar `lib/db.ts` de un blob JSONB a tablas relacionales reales con Prisma
(una tabla por entidad: Product, Company, Lead, Deal, etc.) para poder hacer
queries/reportes más eficientes a medida que crece el volumen de datos. Ver
`docs/ROADMAP.md`, Fase 5.
