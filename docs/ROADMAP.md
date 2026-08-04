# Hoja de ruta para Claude Code

Este documento asume que vas a trabajar módulo por módulo, igual que hicimos en
Claude.ai — no lo canvas todo de una vez. Cada fase abajo es un prompt que puedes
pegar tal cual (ajustando lo que corresponda) en una sesión de Claude Code, en
este mismo repositorio.

## Fase 0 — Orientarse (ya hecho, pero verifícalo)

```
Lee README.md, lib/types.ts y lib/db.ts. Corre `npm run build` y confirma que
compila. Corre `npm run dev` y prueba a mano el flujo: entra a "/", envía el
formulario de cotización, ve a "/leads" y confirma que aparece. Explícame en
2-3 líneas qué entendiste de cómo están conectados los tres módulos antes de
que sigamos.
```

## Fase 1 — Portar el sitio web completo

```
Quiero portar reference/intermedic-prototipo.jsx a esta app Next.js real,
manteniendo exactamente el mismo diseño visual (mismos tokens de color,
tipografía Space Grotesk/Inter/IBM Plex Mono, animación de scanline, etc.)
pero:
  - Divide el archivo en componentes bajo components/site/*.tsx
  - Reemplaza el arreglo PRODUCTS local por un fetch a /api/products
  - El modal de "Solicitar cotización" debe llamar a POST /api/leads
    (ya existe y funciona — mira components/QuoteForm.tsx como referencia
    de cómo se llama)
  - Mantén el catálogo con filtros, comparador y favoritos tal como están
    en el prototipo (esos pueden seguir siendo estado de cliente, no
    necesitan persistir en el servidor)
  - Cuando termines, borra app/(site)/page.tsx (la versión mínima de demo)
    y verifica con `npm run build` que no queda nada roto
```

## Fase 2 — Portar el CRM completo

```
Ahora quiero portar reference/intermedic-crm-prototipo.jsx de la misma forma:
  - Componentes bajo components/crm/*.tsx
  - Dashboard, Leads, Pipeline, Empresas, Contactos, Cotizaciones, Tareas,
    Reportes como rutas bajo app/(crm)/
  - Leads debe leer de GET /api/leads (ya existe)
  - El Pipeline (drag & drop entre etapas) debe usar POST /api/deals/[id]/win
    cuando una tarjeta se suelta en la columna "Ganado" — ya existe ese
    endpoint y ya descuenta inventario si el deal tiene quoteId
  - Para que esa conexión funcione de verdad, necesitas agregar la
    posibilidad de crear una cotización desde un negocio del pipeline
    (nuevo endpoint POST /api/quotes que reciba companyId + items[], y
    guarde el quoteId en el deal)
  - Tareas, Cotizaciones y Reportes pueden usar GET/POST nuevos endpoints
    bajo app/api/tasks y app/api/quotes — sigue el mismo patrón que
    app/api/leads/route.ts
```

## Fase 3 — Portar Inventario completo (incluye login)

```
Ahora reference/intermedic-inventario-prototipo.jsx:
  - Componentes bajo components/inventory/*.tsx
  - Dashboard, Productos (con Kardex FIFO/promedio), Movimientos, Bodegas,
    Proveedores, Lotes, Conteo físico, Reportes bajo app/(inventory)/
  - Movimientos debe usar POST /api/movements (ya existe y ya recalcula
    costo promedio y descuenta/suma stock)
  - El login: los usuarios ya están en data/db.json (users) con role
    Administrador/Vendedor. Por ahora, implementa el login SOLO en el
    cliente (como está en el prototipo) pero léelo de GET /api/users
    (nuevo endpoint, sigue el patrón de companies/route.ts) en vez de un
    arreglo hardcodeado. La autenticación real de verdad va en la Fase 4.
```

## Fase 4 — Autenticación real (importante antes de producción)

Los prototipos actuales guardan las contraseñas en texto plano en el
frontend — está bien para demostrar el flujo, pero **no debe llegar a
producción así**. Prompt sugerido:

```
Quiero reemplazar el login de solo-frontend por autenticación real:
  - Agrega NextAuth.js (o Lucia/Auth.js) con Credentials Provider
  - Las contraseñas se guardan hasheadas con bcrypt, nunca en texto plano
  - Protege las rutas app/api/movements (POST con type !== "Salida"),
    app/api/products (POST), y cualquier edición de precio/costo para
    que solo un usuario con role === "Administrador" pueda llamarlas
  - Los Vendedores solo deben poder hacer POST /api/movements con
    type: "Salida"
  - Usa middleware.ts de Next.js para proteger las rutas de página
    también, no solo las de API
```

## Fase 5 — Base de datos real (Postgres + Prisma)

```
Quiero migrar lib/db.ts de JSON a Prisma + PostgreSQL:
  - Genera schema.prisma a partir de lib/types.ts (los modelos son
    casi 1:1: Product, Company, Contact, Lead, Deal, Quote, Movement, AppUser)
  - Usa Docker Compose para levantar Postgres localmente
  - Reescribe cada función de lib/db.ts (getDB/saveDB ya no existen;
    createLeadFromQuoteRequest, markDealWon, applyMovement, etc. se
    reescriben usando prisma.<modelo>) manteniendo la misma firma de
    entrada/salida para que las rutas de app/api/** casi no cambien
  - Escribe un script de seed (prisma/seed.ts) con los mismos datos que
    hoy están en data/db.json
```

## Fase 6 — Los módulos que faltan del documento original

Según el brief original (ver el mensaje inicial del proyecto), después de
Inventario siguen: **Compras, Ventas/Facturación, Panel Administrativo,
Dashboard Ejecutivo unificado, Gestión de Usuarios/Roles/Permisos**. El
mismo patrón de este roadmap aplica: diseñar primero como artifact en
Claude.ai si quieres iterar rápido en el look & feel, y luego traerlo aquí
para conectarlo de verdad.

## Fase 7 — Despliegue

```
Prepara este proyecto para desplegar en Vercel:
  - Variables de entorno para DATABASE_URL, NEXTAUTH_SECRET, etc.
  - Confirma que `npm run build` pasa limpio
  - Documenta en README.md los pasos exactos para conectar el repo de
    GitHub a Vercel y las variables que hay que configurar ahí
```
