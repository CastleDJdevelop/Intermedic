# Intermedic — Plataforma conectada

Este proyecto reemplaza los tres prototipos sueltos (sitio web, CRM, inventario)
por una única aplicación Next.js con **una sola base de datos compartida**.
Las tres "conexiones" que pediste ya están implementadas y probadas:

1. **Sitio web → CRM**: al enviar el formulario de "Solicitar cotización", se crea
   un `Lead` (y una `Quote` en borrador) en el CRM, con origen `"Sitio web"`.
2. **CRM → Inventario**: al marcar un negocio como "Ganado" en el Pipeline, se
   generan movimientos de `Salida` por cada producto de su cotización y el stock
   se descuenta de verdad.
3. **Inventario → Sitio web / CRM**: el stock que ve el catálogo público y el que
   usa el CRM para prometer fechas de entrega es el mismo campo `warehouses` que
   edita Inventario — no hay tres copias del dato que sincronizar a mano.

## Cómo correrlo

```bash
npm install
npm run dev
# abre http://localhost:3000
```

La barra superior negra tiene enlaces directos a las 4 pantallas de demostración:
`/` (sitio), `/leads` y `/pipeline` (CRM), `/dashboard` (inventario).

## Qué es real y qué es demo todavía

| Parte | Estado |
|---|---|
| Modelo de datos (`lib/types.ts`) | ✅ Real, único, compartido |
| Persistencia (`lib/db.ts` + `data/db.json`) | ✅ Real (archivo JSON). Cambiar a Postgres es el siguiente paso — ver `docs/ROADMAP.md` |
| Endpoints API (`app/api/**`) | ✅ Reales, probados con `next build` + llamadas HTTP reales |
| Las 3 conexiones descritas arriba | ✅ Reales, probadas de punta a punta |
| Pantallas visuales completas de cada módulo | ⚠️ Aquí solo hay una versión mínima de demostración. El diseño completo (catálogo con filtros, CRM con Kanban, Inventario con Kardex, login con roles, etc.) está en `reference/*.jsx` — ver más abajo |
| Autenticación / permisos por rol | ⚠️ Los tipos y el modelo de usuarios ya existen (`AppUser`, `role`), pero las rutas API todavía no verifican quién llama. Ver `docs/ROADMAP.md` |

## Carpeta `reference/`

Contiene los tres prototipos completos que ya construimos en Claude.ai como
artifacts de React (un solo archivo cada uno, con datos de ejemplo en memoria):

- `intermedic-prototipo.jsx` — sitio web + catálogo completo
- `intermedic-crm-prototipo.jsx` — CRM completo (dashboard, leads, pipeline drag&drop, cotizaciones, tareas, reportes)
- `intermedic-inventario-prototipo.jsx` — inventario completo (Kardex FIFO/promedio, lotes, conteo físico, login con 2 perfiles)

**Estos archivos no se importan ni se ejecutan dentro de esta app** — son la
referencia de diseño/UX que Claude Code debe ir portando pantalla por pantalla
a `app/(site)/`, `app/(crm)/` y `app/(inventory)/`, reemplazando sus arreglos
`PRODUCTS`, `LEADS`, `DEALS`, etc. (que hoy viven solo en `useState`) por llamadas
a las rutas de `app/api/**` que ya existen.

## Siguiente paso

Abre este proyecto en **Claude Code** y dale el archivo `docs/ROADMAP.md` como
punto de partida — trae el orden sugerido de trabajo y prompts listos para pegar.
