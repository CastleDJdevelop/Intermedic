import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LayoutDashboard, Package, ArrowLeftRight, Warehouse, Truck, Layers, ClipboardList,
  BarChart3, Search, Bell, Plus, ChevronDown, X, Check, AlertTriangle, Building2,
  Phone, Mail, MapPin, Barcode as BarcodeIcon, QrCode, Download, Upload, FileText, Clock,
  TrendingUp, DollarSign, Hash, MoreHorizontal, Sun, Moon, Menu, LogOut, Target,
  ArrowDownToLine, ArrowUpFromLine, RefreshCw, Boxes, CalendarClock, ScanLine,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

/* =========================================================================
   MOCK DATA
   ========================================================================= */

const WAREHOUSES = [
  { id: "w1", name: "Bodega Central", type: "Bodega principal", city: "Ciudad de Guatemala" },
  { id: "w2", name: "Sucursal Zona 10", type: "Sucursal", city: "Ciudad de Guatemala" },
  { id: "w3", name: "Sucursal Quetzaltenango", type: "Sucursal", city: "Quetzaltenango" },
  { id: "w4", name: "Sucursal Escuintla", type: "Sucursal", city: "Escuintla" },
];
const WH_NAMES = WAREHOUSES.map((w) => w.name);

const STAFF = ["Marvin Say", "Rebeca Ixchel", "Óscar Pineda"];

const USERS = [
  { id: "u1", username: "rixchel", password: "Admin2026*", name: "Rebeca Ixchel", role: "Administrador", initials: "RI", color: "#0057D9" },
  { id: "u2", username: "msay", password: "Venta2026*", name: "Marvin Say", role: "Vendedor", initials: "MS", color: "#00998A" },
  { id: "u3", username: "opineda", password: "Venta2026*", name: "Óscar Pineda", role: "Vendedor", initials: "OP", color: "#C9600A" },
];

const SUPPLIERS = [
  { id: "s1", name: "Mindray Latinoamérica", contact: "Laura Chen", email: "ventas@mindray-latam.com", phone: "+502 2211 3300", category: "Diagnóstico y monitoreo", leadTime: "15–20 días" },
  { id: "s2", name: "Philips Healthcare GT", contact: "Andrés Molina", email: "amolina@philips-gt.com", phone: "+502 2233 4410", category: "Diagnóstico y desfibrilación", leadTime: "20–25 días" },
  { id: "s3", name: "B. Braun Distribución", contact: "Karla Reyes", email: "kreyes@bbraun-gt.com", phone: "+502 2244 7712", category: "Insumos e instrumental", leadTime: "10–15 días" },
  { id: "s4", name: "Getinge Sales GT", contact: "Ricardo Paz", email: "rpaz@getinge.com", phone: "+502 2255 9081", category: "Esterilización", leadTime: "25–30 días" },
  { id: "s5", name: "3M Guatemala", contact: "Fernanda López", email: "flopez@3m.com.gt", phone: "+502 2266 1145", category: "Material descartable", leadTime: "5–8 días" },
  { id: "s6", name: "Textiles Médicos S.A.", contact: "Jorge Toc", email: "jtoc@textilesmedicos.gt", phone: "+502 5511 2290", category: "Uniformes y mobiliario", leadTime: "3–5 días" },
];

const PRODUCTS = [
  { id: "p1", sku: "MON-V8", barcode: "7501234500019", name: "Monitor de Signos Vitales Serie V8", category: "Monitores", brand: "Mindray", supplier: "Mindray Latinoamérica", unit: "unidad", costProm: 9725, ultimoCosto: 10100, stockMin: 3, stockMax: 12, serialized: true, warehouses: { "Bodega Central": 4, "Sucursal Zona 10": 3 },
    seriales: [
      { serial: "MDV8-2601", warehouse: "Bodega Central", estado: "Disponible" }, { serial: "MDV8-2602", warehouse: "Bodega Central", estado: "Disponible" },
      { serial: "MDV8-2603", warehouse: "Bodega Central", estado: "Disponible" }, { serial: "MDV8-2604", warehouse: "Bodega Central", estado: "Reservado" },
      { serial: "MDV8-2605", warehouse: "Sucursal Zona 10", estado: "Disponible" }, { serial: "MDV8-2606", warehouse: "Sucursal Zona 10", estado: "Disponible" },
      { serial: "MDV8-2607", warehouse: "Sucursal Zona 10", estado: "En mantenimiento" },
    ] },
  { id: "p2", sku: "CAM-EH3", barcode: "7501234500026", name: "Cama Hospitalaria Eléctrica 3 Posiciones", category: "Equipo hospitalario", brand: "Welch Allyn", supplier: "B. Braun Distribución", unit: "unidad", costProm: 17800, ultimoCosto: 18500, stockMin: 1, stockMax: 6, serialized: false, warehouses: { "Bodega Central": 2, "Sucursal Zona 10": 1 } },
  { id: "p3", sku: "INS-SET32", barcode: "7501234500033", name: "Set de Instrumental Quirúrgico General (32 pzs)", category: "Instrumental quirúrgico", brand: "B. Braun", supplier: "B. Braun Distribución", unit: "set", costProm: 5900, ultimoCosto: 6200, stockMin: 2, stockMax: 10, serialized: false, warehouses: { "Bodega Central": 4, "Sucursal Quetzaltenango": 2 } },
  { id: "p4", sku: "ECO-DPC", barcode: "7501234500040", name: "Ecógrafo Portátil Doppler Color", category: "Diagnóstico", brand: "Mindray", supplier: "Mindray Latinoamérica", unit: "unidad", costProm: 84000, ultimoCosto: 89000, stockMin: 1, stockMax: 5, serialized: true, warehouses: { "Bodega Central": 1, "Sucursal Zona 10": 1 },
    seriales: [{ serial: "ECO-DP-101", warehouse: "Bodega Central", estado: "Disponible" }, { serial: "ECO-DP-102", warehouse: "Sucursal Zona 10", estado: "Disponible" }] },
  { id: "p5", sku: "AUT-24L", barcode: "7501234500057", name: "Autoclave de Mesa 24L", category: "Esterilizadores", brand: "Getinge", supplier: "Getinge Sales GT", unit: "unidad", costProm: 23200, ultimoCosto: 24900, stockMin: 1, stockMax: 5, serialized: false, warehouses: { "Sucursal Zona 10": 1, "Sucursal Quetzaltenango": 1 } },
  { id: "p6", sku: "VEN-TR", barcode: "7501234500064", name: "Ventilador de Transporte", category: "Equipo respiratorio", brand: "Dräger", supplier: "Mindray Latinoamérica", unit: "unidad", costProm: 61000, ultimoCosto: 64000, stockMin: 1, stockMax: 4, serialized: true, warehouses: { "Sucursal Zona 10": 1, "Sucursal Escuintla": 1 },
    seriales: [{ serial: "VEN-TR-55", warehouse: "Sucursal Zona 10", estado: "Disponible" }, { serial: "VEN-TR-56", warehouse: "Sucursal Escuintla", estado: "En mantenimiento" }] },
  { id: "p7", sku: "SIL-ORT", barcode: "7501234500071", name: "Silla de Ruedas Ortopédica Reforzada", category: "Ortopedia", brand: "Genérico", supplier: "Textiles Médicos S.A.", unit: "unidad", costProm: 1350, ultimoCosto: 1450, stockMin: 3, stockMax: 15, serialized: false, warehouses: { "Bodega Central": 6, "Sucursal Quetzaltenango": 3 } },
  { id: "p8", sku: "MIC-BIN", barcode: "7501234500088", name: "Microscopio Binocular de Laboratorio", category: "Equipo de laboratorio", brand: "Genérico", supplier: "B. Braun Distribución", unit: "unidad", costProm: 3550, ultimoCosto: 3800, stockMin: 2, stockMax: 8, serialized: false, warehouses: { "Bodega Central": 3, "Sucursal Zona 10": 2 } },
  { id: "p9", sku: "BOM-INF", barcode: "7501234500095", name: "Bomba de Infusión Volumétrica", category: "Cuidado del paciente", brand: "B. Braun", supplier: "B. Braun Distribución", unit: "unidad", costProm: 5100, ultimoCosto: 5600, stockMin: 4, stockMax: 10, serialized: false, warehouses: { "Bodega Central": 2, "Sucursal Escuintla": 1 } },
  { id: "p10", sku: "GUA-NIT", barcode: "7501234500101", name: "Guantes de Nitrilo sin Polvo (Caja 100)", category: "Material descartable", brand: "3M", supplier: "3M Guatemala", unit: "caja", costProm: 79, ultimoCosto: 82, stockMin: 50, stockMax: 300, serialized: false, warehouses: { "Bodega Central": 22, "Sucursal Zona 10": 20 },
    lotes: [{ lote: "GN-2604", vencimiento: "2027-04-15", qty: 22, warehouse: "Bodega Central" }, { lote: "GN-2609", vencimiento: "2026-09-30", qty: 20, warehouse: "Sucursal Zona 10" }] },
  { id: "p11", sku: "UNI-QX", barcode: "7501234500118", name: "Uniforme Quirúrgico Antifluido (Par)", category: "Uniformes médicos", brand: "Genérico", supplier: "Textiles Médicos S.A.", unit: "par", costProm: 195, ultimoCosto: 210, stockMin: 20, stockMax: 150, serialized: false, warehouses: { "Bodega Central": 50, "Sucursal Zona 10": 35 } },
  { id: "p12", sku: "DEA-AUT", barcode: "7501234500125", name: "Desfibrilador Externo Automático (DEA)", category: "Diagnóstico", brand: "Philips", supplier: "Philips Healthcare GT", unit: "unidad", costProm: 26800, ultimoCosto: 28000, stockMin: 2, stockMax: 8, serialized: true, warehouses: { "Sucursal Zona 10": 2, "Sucursal Escuintla": 2 },
    seriales: [
      { serial: "DEA-P-0231", warehouse: "Sucursal Zona 10", estado: "Disponible" }, { serial: "DEA-P-0232", warehouse: "Sucursal Zona 10", estado: "Disponible" },
      { serial: "DEA-P-0233", warehouse: "Sucursal Escuintla", estado: "Disponible" }, { serial: "DEA-P-0234", warehouse: "Sucursal Escuintla", estado: "En mantenimiento" },
    ] },
  { id: "p13", sku: "JER-10ML", barcode: "7501234500132", name: "Jeringas Descartables 10ml (Caja 50)", category: "Material descartable", brand: "B. Braun", supplier: "B. Braun Distribución", unit: "caja", costProm: 34, ultimoCosto: 36, stockMin: 30, stockMax: 200, serialized: false, warehouses: { "Bodega Central": 35, "Sucursal Escuintla": 20 },
    lotes: [{ lote: "JR-2611", vencimiento: "2027-01-10", qty: 35, warehouse: "Bodega Central" }, { lote: "JR-2607", vencimiento: "2026-08-25", qty: 20, warehouse: "Sucursal Escuintla" }] },
];

let mvSeq = 1;
const mv = (date, type, sku, qty, opts = {}) => ({ id: "m" + mvSeq++, date, type, sku, qty, from: opts.from || null, to: opts.to || null, cost: opts.cost ?? null, ref: opts.ref || "", user: opts.user || STAFF[0] });

const MOVEMENTS = [
  mv("2026-01-05", "Entrada", "CAM-EH3", 3, { to: "Bodega Central", cost: 17800, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-01-05", "Entrada", "INS-SET32", 6, { to: "Bodega Central", cost: 5900, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-01-05", "Entrada", "ECO-DPC", 2, { to: "Bodega Central", cost: 84000, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-01-05", "Entrada", "VEN-TR", 2, { to: "Sucursal Zona 10", cost: 61000, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-01-05", "Entrada", "SIL-ORT", 9, { to: "Bodega Central", cost: 1350, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-01-05", "Entrada", "MIC-BIN", 5, { to: "Bodega Central", cost: 3550, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-01-05", "Entrada", "BOM-INF", 3, { to: "Bodega Central", cost: 5100, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-01-05", "Entrada", "UNI-QX", 85, { to: "Bodega Central", cost: 195, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),

  mv("2026-01-05", "Entrada", "MON-V8", 5, { to: "Bodega Central", cost: 9500, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-06-10", "Entrada", "MON-V8", 3, { to: "Sucursal Zona 10", cost: 10100, ref: "OC-1187 — Mindray Latinoamérica", user: "Marvin Say" }),
  mv("2026-07-20", "Salida", "MON-V8", 1, { from: "Bodega Central", ref: "Venta — COT-2026-0141", user: "Marvin Say" }),

  mv("2026-01-05", "Entrada", "GUA-NIT", 80, { to: "Bodega Central", cost: 78, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-04-10", "Entrada", "GUA-NIT", 40, { to: "Sucursal Zona 10", cost: 82, ref: "OC-1203 — 3M Guatemala", user: "Marvin Say" }),
  mv("2026-05-12", "Salida", "GUA-NIT", 50, { from: "Bodega Central", ref: "Despacho — Hospital Regional Altiplano", user: "Óscar Pineda" }),
  mv("2026-07-18", "Salida", "GUA-NIT", 28, { from: "Sucursal Zona 10", ref: "Venta mostrador", user: "Óscar Pineda" }),

  mv("2026-01-05", "Entrada", "JER-10ML", 70, { to: "Bodega Central", cost: 33, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-03-14", "Salida", "JER-10ML", 30, { from: "Bodega Central", ref: "Despacho — Clínica Vida Nueva", user: "Óscar Pineda" }),
  mv("2026-07-01", "Entrada", "JER-10ML", 35, { to: "Bodega Central", cost: 36, ref: "OC-1244 — B. Braun Distribución", user: "Marvin Say" }),
  mv("2026-07-25", "Salida", "JER-10ML", 20, { from: "Bodega Central", to: "Sucursal Escuintla", ref: "Transferencia a Escuintla", user: "Óscar Pineda" }),

  mv("2026-02-01", "Entrada", "AUT-24L", 1, { to: "Bodega Central", cost: 21500, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-06-15", "Entrada", "AUT-24L", 1, { to: "Sucursal Zona 10", cost: 24900, ref: "OC-1219 — Getinge Sales GT", user: "Marvin Say" }),
  mv("2026-07-22", "Transferencia", "AUT-24L", 1, { from: "Bodega Central", to: "Sucursal Quetzaltenango", ref: "Instalación en sucursal", user: "Marvin Say" }),

  mv("2026-01-20", "Entrada", "DEA-AUT", 2, { to: "Sucursal Zona 10", cost: 25000, ref: "Migración inicial de inventario", user: "Rebeca Ixchel" }),
  mv("2026-06-05", "Entrada", "DEA-AUT", 3, { to: "Sucursal Escuintla", cost: 28000, ref: "OC-1231 — Philips Healthcare GT", user: "Marvin Say" }),
  mv("2026-07-28", "Salida", "DEA-AUT", 1, { from: "Sucursal Escuintla", ref: "Venta — Hospital Municipal Cobán", user: "Óscar Pineda" }),

  mv("2026-07-30", "Ajuste", "SIL-ORT", -1, { from: "Bodega Central", ref: "Conteo físico — unidad dañada", user: "Rebeca Ixchel" }),
  mv("2026-07-30", "Entrada", "SIL-ORT", 1, { to: "Bodega Central", cost: 1350, ref: "Conteo físico — reingreso corregido", user: "Rebeca Ixchel" }),
];

/* =========================================================================
   HELPERS
   ========================================================================= */

const formatQ = (n) => `Q ${Math.round(n).toLocaleString("es-GT")}`;
const formatDateShort = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "2-digit" });
const TODAY = new Date().toISOString().slice(0, 10);
const daysUntil = (iso) => Math.round((new Date(iso + "T00:00:00") - new Date(TODAY + "T00:00:00")) / 86400000);
const totalStock = (p) => Object.values(p.warehouses).reduce((a, b) => a + b, 0);
const stockInWarehouse = (p, wh) => (wh === "Todas" ? totalStock(p) : p.warehouses[wh] || 0);

function useOutsideClose(ref, onClose) {
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

function downloadCSV(filename, headers, rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Kardex: company-wide, chronological. method: "Promedio" | "FIFO"
function computeKardex(movements, method) {
  const rows = [];
  let balance = 0, avgCost = 0;
  let layers = [];

  const sorted = [...movements].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  for (const m of sorted) {
    let qtyIn = 0, qtyOut = 0, costUnit = 0;
    if (m.type === "Entrada" || (m.type === "Ajuste" && m.qty > 0)) {
      qtyIn = Math.abs(m.qty);
      const cost = m.cost ?? avgCost;
      if (method === "Promedio") {
        avgCost = balance + qtyIn === 0 ? cost : ((balance * avgCost) + (qtyIn * cost)) / (balance + qtyIn);
        costUnit = cost;
      } else {
        layers.push({ qty: qtyIn, cost });
        costUnit = cost;
      }
      balance += qtyIn;
    } else if (m.type === "Salida" || (m.type === "Ajuste" && m.qty < 0)) {
      qtyOut = Math.abs(m.qty);
      if (method === "Promedio") {
        costUnit = avgCost;
      } else {
        let remaining = qtyOut, cost = 0, consumed = 0;
        while (remaining > 0 && layers.length) {
          const layer = layers[0];
          const take = Math.min(layer.qty, remaining);
          cost += take * layer.cost; consumed += take;
          layer.qty -= take; remaining -= take;
          if (layer.qty <= 0) layers.shift();
        }
        costUnit = consumed ? cost / consumed : 0;
      }
      balance -= qtyOut;
    } else if (m.type === "Transferencia") {
      costUnit = method === "Promedio" ? avgCost : (layers[0]?.cost || 0);
    }
    const valorSaldo = method === "Promedio" ? balance * avgCost : layers.reduce((s, l) => s + l.qty * l.cost, 0);
    rows.push({ ...m, qtyIn, qtyOut, balance, costUnit, valorSaldo });
  }
  return rows;
}

/* =========================================================================
   GLOBAL STYLES
   ========================================================================= */

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
      .inv-root {
        --bg: #F4F7F9; --surface: #FFFFFF; --sidebar: #0B1B2B; --sidebar-ink: #C7D3DE; --sidebar-ink-active: #FFFFFF;
        --ink: #0B1B2B; --ink-soft: #55677A; --ink-faint: #8494A3; --line: #E2E8ED; --line-strong: #C9D3DB;
        --primary: #0057D9; --primary-soft: #E9F0FE; --teal: #00998A; --teal-soft: #E3F6F2;
        --amber: #C9600A; --amber-soft: #FCEEE1; --red: #D65959; --red-soft: #FBEAEA;
        --shadow: 0 1px 2px rgba(11,27,43,0.04), 0 8px 20px rgba(11,27,43,0.06);
        --shadow-lg: 0 4px 8px rgba(11,27,43,0.08), 0 24px 48px rgba(11,27,43,0.14);
        font-family: 'Inter', system-ui, sans-serif; color: var(--ink); background: var(--bg); min-height: 100vh;
      }
      .inv-root.inv-dark {
        --bg: #08131F; --surface: #0F2135; --sidebar: #060D16; --sidebar-ink: #7C8FA1; --sidebar-ink-active: #FFFFFF;
        --ink: #E9F1F8; --ink-soft: #9FB2C4; --ink-faint: #6E8397; --line: #1D3245; --line-strong: #294763;
        --primary: #4C90FF; --primary-soft: #142E4C; --teal: #35D6BF; --teal-soft: #0E2D2A;
        --amber: #FFA35C; --amber-soft: #2E2013; --red: #FF7A7A; --red-soft: #331A1A;
        --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.35);
        --shadow-lg: 0 4px 8px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.55);
      }
      .inv-root * { box-sizing: border-box; }
      .inv-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.01em; }
      .inv-mono { font-family: 'IBM Plex Mono', monospace; }
      .inv-ink { color: var(--ink); } .inv-ink-soft { color: var(--ink-soft); } .inv-ink-faint { color: var(--ink-faint); }
      .inv-primary { color: var(--primary); }
      .inv-surface { background: var(--surface); }
      .inv-border { border: 1px solid var(--line); } .inv-border-t { border-top: 1px solid var(--line); } .inv-border-b { border-bottom: 1px solid var(--line); }
      .inv-shadow { box-shadow: var(--shadow); } .inv-shadow-lg { box-shadow: var(--shadow-lg); }
      .inv-card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; }
      .inv-focus:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
      .inv-btn { font-weight: 600; border-radius: 9px; cursor: pointer; transition: all .15s ease; white-space: nowrap; }
      .inv-btn-primary { background: var(--primary); color: #fff; border: 1px solid var(--primary); }
      .inv-btn-primary:hover { filter: brightness(1.08); }
      .inv-btn-outline { background: transparent; color: var(--ink); border: 1px solid var(--line-strong); }
      .inv-btn-outline:hover { border-color: var(--primary); color: var(--primary); }
      .inv-btn-ghost { background: transparent; color: var(--ink-soft); border: 1px solid transparent; }
      .inv-btn-ghost:hover { background: var(--bg); color: var(--ink); }
      .inv-icon-btn { background: var(--surface); border: 1px solid var(--line); border-radius: 9px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
      .inv-icon-btn:hover { border-color: var(--primary); color: var(--primary); }
      .inv-icon-btn.active { background: var(--primary-soft); color: var(--primary); border-color: var(--primary); }
      .inv-input { background: var(--surface); border: 1px solid var(--line-strong); border-radius: 9px; color: var(--ink); outline: none; font-family: 'Inter', sans-serif; transition: border-color .15s, box-shadow .15s; }
      .inv-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
      .inv-input::placeholder { color: var(--ink-faint); }
      .inv-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
      .inv-table-row:hover { background: var(--bg); }
      .inv-scrollbar-none::-webkit-scrollbar { display: none; } .inv-scrollbar-none { scrollbar-width: none; }
      .inv-fade { animation: invFade .35s ease both; }
      @keyframes invFade { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: none; } }
      @media (prefers-reduced-motion: reduce) { .inv-fade { animation: none; } }
      .inv-sidebar-link { display: flex; align-items: center; gap: 11px; padding: 9px 12px; border-radius: 9px; color: var(--sidebar-ink); font-size: 13.5px; font-weight: 500; cursor: pointer; transition: all .15s; border: none; background: none; width: 100%; text-align: left; }
      .inv-sidebar-link:hover { background: rgba(255,255,255,0.06); color: var(--sidebar-ink-active); }
      .inv-sidebar-link.active { background: var(--primary); color: #fff; }
      .inv-line-clamp { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      .inv-label { font-size: 12px; font-weight: 600; color: var(--ink-soft); margin-bottom: 6px; display: block; }
      .inv-field { margin-bottom: 14px; }
      .inv-barcode-bar { display: inline-block; width: 100%; height: 40px; }
    `}</style>
  );
}

/* =========================================================================
   SMALL PIECES
   ========================================================================= */

function StatusBadge({ status, map }) {
  const c = map[status] || { bg: "var(--bg)", fg: "var(--ink-faint)" };
  return <span className="inv-badge" style={{ background: c.bg, color: c.fg }}>{status}</span>;
}

const MOVE_TYPE_MAP = {
  Entrada: { bg: "var(--teal-soft)", fg: "var(--teal)", icon: ArrowDownToLine },
  Salida: { bg: "var(--red-soft)", fg: "var(--red)", icon: ArrowUpFromLine },
  Transferencia: { bg: "var(--primary-soft)", fg: "var(--primary)", icon: ArrowLeftRight },
  Ajuste: { bg: "var(--amber-soft)", fg: "var(--amber)", icon: RefreshCw },
};

function StockLevelBar({ p }) {
  const stock = totalStock(p);
  const pct = Math.min(100, Math.max(4, (stock / p.stockMax) * 100));
  const low = stock <= p.stockMin;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
        <span className={low ? "" : "inv-ink-faint"} style={low ? { color: "var(--red)", fontWeight: 700 } : {}}>{stock} {p.unit}{stock !== 1 ? "s" : ""}</span>
        <span className="inv-ink-faint">min {p.stockMin} / max {p.stockMax}</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: "var(--bg)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: low ? "var(--red)" : "var(--teal)", borderRadius: 4 }} />
      </div>
    </div>
  );
}

function Barcode({ value }) {
  const bars = useMemo(() => {
    let seed = 0; for (const c of value) seed = (seed * 31 + c.charCodeAt(0)) % 997;
    const out = [];
    for (let i = 0; i < 40; i++) { seed = (seed * 1103515245 + 12345) % 2147483648; out.push(1 + (seed % 4)); }
    return out;
  }, [value]);
  const total = bars.reduce((a, b) => a + b, 0);
  let x = 0;
  const els = bars.map((w, i) => {
    const el = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={40} fill="var(--ink)" /> : null;
    x += w;
    return el;
  });
  return (
    <div>
      <svg viewBox={`0 0 ${total} 40`} className="inv-barcode-bar" preserveAspectRatio="none">{els}</svg>
      <div className="inv-mono inv-ink-faint" style={{ textAlign: "center", fontSize: 11, letterSpacing: "0.15em", marginTop: 4 }}>{value}</div>
    </div>
  );
}

function QrPreview({ value }) {
  const cells = useMemo(() => {
    let seed = 0; for (const c of value) seed = (seed * 31 + c.charCodeAt(0)) % 9973;
    const n = 9, out = [];
    for (let i = 0; i < n * n; i++) { seed = (seed * 1103515245 + 12345) % 2147483648; out.push(seed % 5 === 0); }
    return out;
  }, [value]);
  const n = 9;
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width={72} height={72}>
      <rect width={n} height={n} fill="var(--surface)" />
      {cells.map((on, i) => on && <rect key={i} x={i % n} y={Math.floor(i / n)} width={1} height={1} fill="var(--ink)" />)}
      <rect x={0} y={0} width={2.5} height={2.5} fill="none" stroke="var(--ink)" strokeWidth={0.4} />
      <rect x={n - 2.5} y={0} width={2.5} height={2.5} fill="none" stroke="var(--ink)" strokeWidth={0.4} />
      <rect x={0} y={n - 2.5} width={2.5} height={2.5} fill="none" stroke="var(--ink)" strokeWidth={0.4} />
    </svg>
  );
}

function KpiCard({ label, value, delta, tone = "var(--teal)", icon: Icon, accent }) {
  return (
    <div className="inv-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span className="inv-ink-faint inv-mono" style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: accent + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div className="inv-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{value}</div>
      {delta && <div style={{ fontSize: 12.5, color: tone }}>{delta}</div>}
    </div>
  );
}

function ViewHeader({ title, desc, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 className="inv-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>{title}</h1>
        {desc && <p className="inv-ink-soft" style={{ fontSize: 13.5 }}>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

/* =========================================================================
   PRODUCTOS
   ========================================================================= */

function ProductsView({ products, warehouseFilter, onOpen, onNew, role }) {
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("Todas");
  const categories = ["Todas", ...new Set(products.map((p) => p.category))];
  const isAdmin = role === "Administrador";

  const filtered = products.filter((p) => {
    const matchesQ = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase());
    const matchesCat = catFilter === "Todas" || p.category === catFilter;
    return matchesQ && matchesCat;
  });

  return (
    <div className="inv-fade">
      <ViewHeader title="Productos" desc={isAdmin ? "Catálogo de productos con existencias, costos y niveles de reposición." : "Consulte las existencias disponibles por producto."}
        action={isAdmin && <button onClick={onNew} className="inv-btn inv-btn-primary inv-focus" style={{ padding: "10px 16px", fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Nuevo producto</button>} />

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} className="inv-ink-faint" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o SKU…" className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px 9px 32px", fontSize: 13.5 }} />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="inv-input inv-focus" style={{ padding: "9px 12px", fontSize: 13 }}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="inv-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead><tr className="inv-border-b inv-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase" }}>
            {[["Producto"], ["SKU"], ["Categoría"], [`Stock${warehouseFilter !== "Todas" ? " (" + warehouseFilter + ")" : ""}`], isAdmin && ["Costo prom."], isAdmin && ["Valor"], [""]].filter(Boolean).map(([h]) => <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((p) => {
              const stock = stockInWarehouse(p, warehouseFilter);
              return (
                <tr key={p.id} onClick={() => onOpen(p)} className="inv-table-row inv-border-b" style={{ cursor: "pointer" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Package size={15} className="inv-primary" /></div>
                      <div style={{ minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600 }} className="inv-line-clamp">{p.name}</div><div className="inv-ink-faint" style={{ fontSize: 11.5 }}>{p.brand}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12 }} className="inv-mono inv-ink-soft">{p.sku}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }} className="inv-ink-soft">{p.category}</td>
                  <td style={{ padding: "12px 16px", minWidth: 150 }}><StockLevelBar p={{ ...p, warehouses: warehouseFilter === "Todas" ? p.warehouses : { [warehouseFilter]: stock } }} /></td>
                  {isAdmin && <td style={{ padding: "12px 16px", fontSize: 13 }} className="inv-mono">{formatQ(p.costProm)}</td>}
                  {isAdmin && <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }} className="inv-mono">{formatQ(stock * p.costProm)}</td>}
                  <td style={{ padding: "12px 16px", textAlign: "right" }}><MoreHorizontal size={16} className="inv-ink-faint" /></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 40, textAlign: "center" }} className="inv-ink-faint">Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductDetail({ product, movements, onClose, role, onEditPrice }) {
  const [tab, setTab] = useState("info");
  const [method, setMethod] = useState("Promedio");
  const isAdmin = role === "Administrador";
  if (!product) return null;
  const stock = totalStock(product);
  const low = stock <= product.stockMin;
  const productMoves = movements.filter((m) => m.sku === product.sku);
  const kardex = useMemo(() => computeKardex(productMoves, method), [productMoves, method]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.5)" }} />
      <div className="inv-surface inv-shadow-lg inv-scrollbar-none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(620px,100%)", overflowY: "auto", padding: 26 }}>
        <button onClick={onClose} className="inv-icon-btn inv-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }}><X size={14} /></button>

        <div className="inv-ink-faint" style={{ fontSize: 12.5, marginBottom: 6 }}>{product.category} · {product.brand}</div>
        <h2 className="inv-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{product.name}</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <span className="inv-badge" style={{ background: low ? "var(--red-soft)" : "var(--teal-soft)", color: low ? "var(--red)" : "var(--teal)" }}>{low ? "Bajo stock" : "Stock saludable"}</span>
          {product.serialized && <span className="inv-badge" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>Serializado</span>}
          {product.lotes && <span className="inv-badge" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>Por lote</span>}
        </div>

        {isAdmin ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div className="inv-card" style={{ padding: 14 }}><div className="inv-ink-faint" style={{ fontSize: 11 }}>Stock total</div><div className="inv-mono" style={{ fontSize: 17, fontWeight: 700 }}>{stock} {product.unit}{stock !== 1 ? "s" : ""}</div></div>
            <div className="inv-card" style={{ padding: 14 }}><div className="inv-ink-faint" style={{ fontSize: 11 }}>Costo promedio</div><div className="inv-mono" style={{ fontSize: 17, fontWeight: 700 }}>{formatQ(product.costProm)}</div></div>
            <div className="inv-card" style={{ padding: 14 }}><div className="inv-ink-faint" style={{ fontSize: 11 }}>Valor en inventario</div><div className="inv-mono" style={{ fontSize: 17, fontWeight: 700 }}>{formatQ(stock * product.costProm)}</div></div>
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div className="inv-card" style={{ padding: 14 }}><div className="inv-ink-faint" style={{ fontSize: 11 }}>Stock total</div><div className="inv-mono" style={{ fontSize: 17, fontWeight: 700 }}>{stock} {product.unit}{stock !== 1 ? "s" : ""}</div></div>
          </div>
        )}
        {isAdmin && (
          <button onClick={() => onEditPrice(product)} className="inv-btn inv-btn-outline inv-focus" style={{ padding: "8px 14px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <DollarSign size={13} /> Editar precio / costo
          </button>
        )}

        <div className="inv-border-b" style={{ display: "flex", gap: 18, marginBottom: 18, overflowX: "auto" }}>
          {[["info", "Información"], ["stock", "Stock por bodega"], (product.lotes || product.serialized) && ["trace", product.lotes ? "Lotes" : "Series"], isAdmin && ["kardex", "Kardex"]].filter(Boolean).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="inv-focus" style={{ background: "none", border: "none", padding: "0 0 10px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", color: tab === k ? "var(--primary)" : "var(--ink-faint)", borderBottom: tab === k ? "2px solid var(--primary)" : "2px solid transparent" }}>{l}</button>
          ))}
        </div>

        {tab === "info" && (
          <div>
            <div style={{ display: "flex", gap: 24, marginBottom: 22, flexWrap: "wrap" }}>
              <Barcode value={product.barcode} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <QrPreview value={product.sku} />
                <span className="inv-ink-faint" style={{ fontSize: 10.5 }}>QR · {product.sku}</span>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[["SKU", product.sku], ["Marca", product.brand], ["Unidad de medida", product.unit], ["Proveedor", product.supplier], isAdmin && ["Último costo", formatQ(product.ultimoCosto)], ["Stock mínimo", `${product.stockMin} ${product.unit}s`], ["Stock máximo", `${product.stockMax} ${product.unit}s`]].filter(Boolean).map(([k, v]) => (
                  <tr key={k} className="inv-border-b"><td className="inv-ink-faint" style={{ padding: "10px 0", fontSize: 13, width: "45%" }}>{k}</td><td style={{ padding: "10px 0", fontSize: 13, fontWeight: 500 }}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "stock" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {WAREHOUSES.map((w) => {
              const qty = product.warehouses[w.name] || 0;
              return (
                <div key={w.id} className="inv-card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <Warehouse size={16} className="inv-ink-faint" />
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</div><div className="inv-ink-faint" style={{ fontSize: 11.5 }}>{w.city}</div></div>
                  <span className="inv-mono" style={{ fontSize: 14, fontWeight: 700 }}>{qty} {product.unit}{qty !== 1 ? "s" : ""}</span>
                </div>
              );
            })}
          </div>
        )}

        {tab === "trace" && product.lotes && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {product.lotes.map((l) => {
              const d = daysUntil(l.vencimiento);
              const status = d < 0 ? "Vencido" : d <= 30 ? "Vence pronto" : d <= 60 ? "Por vencer" : "Vigente";
              const map = { Vencido: { bg: "var(--red-soft)", fg: "var(--red)" }, "Vence pronto": { bg: "var(--red-soft)", fg: "var(--red)" }, "Por vencer": { bg: "var(--amber-soft)", fg: "var(--amber)" }, Vigente: { bg: "var(--teal-soft)", fg: "var(--teal)" } };
              return (
                <div key={l.lote} className="inv-card" style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="inv-mono" style={{ fontSize: 13, fontWeight: 700 }}>{l.lote}</span>
                    <StatusBadge status={status} map={map} />
                  </div>
                  <div className="inv-ink-soft" style={{ fontSize: 12.5, display: "flex", justifyContent: "space-between" }}>
                    <span>{l.warehouse}</span><span>{l.qty} {product.unit}s</span><span>Vence: {formatDateShort(l.vencimiento)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tab === "trace" && product.serialized && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {product.seriales.map((s) => (
              <div key={s.serial} className="inv-card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <Hash size={14} className="inv-ink-faint" />
                <span className="inv-mono" style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{s.serial}</span>
                <span className="inv-ink-faint" style={{ fontSize: 12 }}>{s.warehouse}</span>
                <StatusBadge status={s.estado} map={{ Disponible: { bg: "var(--teal-soft)", fg: "var(--teal)" }, Reservado: { bg: "var(--primary-soft)", fg: "var(--primary)" }, "En mantenimiento": { bg: "var(--amber-soft)", fg: "var(--amber)" } }} />
              </div>
            ))}
          </div>
        )}

        {tab === "kardex" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="inv-ink-faint" style={{ fontSize: 12 }}>Método de valuación</div>
              <div style={{ display: "flex", gap: 4, background: "var(--bg)", borderRadius: 8, padding: 3 }}>
                {["Promedio", "FIFO"].map((m) => (
                  <button key={m} onClick={() => setMethod(m)} className="inv-focus" style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: method === m ? "var(--surface)" : "none", color: method === m ? "var(--primary)" : "var(--ink-faint)", boxShadow: method === m ? "var(--shadow)" : "none" }}>{m === "Promedio" ? "Costo promedio" : "FIFO"}</button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                <thead><tr className="inv-border-b inv-ink-faint" style={{ fontSize: 10.5, textTransform: "uppercase" }}>
                  {["Fecha", "Tipo", "Ref.", "Entrada", "Salida", "Saldo", "Costo unit.", "Valor saldo"].map((h) => <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {kardex.map((r) => (
                    <tr key={r.id} className="inv-border-b">
                      <td className="inv-mono inv-ink-faint" style={{ padding: "8px 10px", fontSize: 11.5 }}>{formatDateShort(r.date)}</td>
                      <td style={{ padding: "8px 10px" }}><StatusBadge status={r.type} map={{ Entrada: { bg: "var(--teal-soft)", fg: "var(--teal)" }, Salida: { bg: "var(--red-soft)", fg: "var(--red)" }, Transferencia: { bg: "var(--primary-soft)", fg: "var(--primary)" }, Ajuste: { bg: "var(--amber-soft)", fg: "var(--amber)" } }} /></td>
                      <td className="inv-ink-soft inv-line-clamp" style={{ padding: "8px 10px", fontSize: 11.5, maxWidth: 140 }}>{r.ref}</td>
                      <td className="inv-mono" style={{ padding: "8px 10px", fontSize: 12, color: "var(--teal)" }}>{r.qtyIn || "—"}</td>
                      <td className="inv-mono" style={{ padding: "8px 10px", fontSize: 12, color: "var(--red)" }}>{r.qtyOut || "—"}</td>
                      <td className="inv-mono" style={{ padding: "8px 10px", fontSize: 12, fontWeight: 700 }}>{r.balance}</td>
                      <td className="inv-mono inv-ink-soft" style={{ padding: "8px 10px", fontSize: 11.5 }}>{formatQ(r.costUnit)}</td>
                      <td className="inv-mono" style={{ padding: "8px 10px", fontSize: 11.5, fontWeight: 600 }}>{formatQ(r.valorSaldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   LOGIN
   ========================================================================= */

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showHints, setShowHints] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const user = USERS.find((u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
    if (!user) { setError("Usuario o contraseña incorrectos."); return; }
    setError("");
    onLogin(user);
  };

  return (
    <div className="inv-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <GlobalStyles />
      <div className="inv-fade" style={{ width: "min(400px, 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 26 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--teal))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Boxes size={18} color="#fff" strokeWidth={2.25} />
          </div>
          <div>
            <div className="inv-display" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>INTERMEDIC</div>
            <div className="inv-ink-faint" style={{ fontSize: 11, marginTop: 2 }}>Sistema de Inventario</div>
          </div>
        </div>

        <form onSubmit={submit} className="inv-card" style={{ padding: 28 }}>
          <h1 className="inv-display" style={{ fontSize: 19, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>Iniciar sesión</h1>
          <p className="inv-ink-soft" style={{ fontSize: 13, textAlign: "center", marginBottom: 22 }}>Acceso restringido según el perfil de cada usuario.</p>

          <div className="inv-field">
            <label className="inv-label">Usuario</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "10px 12px", fontSize: 13.5 }} placeholder="Ej. rixchel" autoFocus />
          </div>
          <div className="inv-field">
            <label className="inv-label">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "10px 12px", fontSize: 13.5 }} placeholder="••••••••" />
          </div>

          {error && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--red)", marginBottom: 14 }}><AlertTriangle size={13} /> {error}</div>}

          <button type="submit" className="inv-btn inv-btn-primary inv-focus" style={{ width: "100%", padding: 12, fontSize: 13.5, marginTop: 4 }}>Ingresar</button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button type="button" onClick={() => setShowHints(!showHints)} className="inv-ink-faint inv-focus" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>
            {showHints ? "Ocultar" : "Ver"} credenciales de prueba (prototipo)
          </button>
          {showHints && (
            <div className="inv-card" style={{ marginTop: 10, padding: 14, textAlign: "left" }}>
              {USERS.map((u) => (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }} className="inv-border-b">
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{u.name} <span className="inv-ink-faint" style={{ fontWeight: 400 }}>· {u.role}</span></div>
                    <div className="inv-mono inv-ink-faint" style={{ fontSize: 11 }}>{u.username} / {u.password}</div>
                  </div>
                  <button type="button" onClick={() => { setUsername(u.username); setPassword(u.password); }} className="inv-btn inv-btn-outline inv-focus" style={{ padding: "5px 10px", fontSize: 11 }}>Usar</button>
                </div>
              ))}
              <div className="inv-ink-faint" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
                Esto es solo para este prototipo. En producción, la autenticación se maneja en el backend (NestJS) con JWT, refresh tokens y contraseñas cifradas (bcrypt) — nunca contraseñas visibles en el frontend.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SIDEBAR + TOPBAR
   ========================================================================= */

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Administrador", "Vendedor"] },
  { id: "productos", label: "Productos", icon: Package, roles: ["Administrador", "Vendedor"] },
  { id: "movimientos", label: "Movimientos", icon: ArrowLeftRight, roles: ["Administrador", "Vendedor"] },
  { id: "bodegas", label: "Bodegas", icon: Warehouse, roles: ["Administrador"] },
  { id: "proveedores", label: "Proveedores", icon: Truck, roles: ["Administrador"] },
  { id: "lotes", label: "Lotes y vencimientos", icon: Layers, roles: ["Administrador", "Vendedor"] },
  { id: "conteo", label: "Conteo físico", icon: ClipboardList, roles: ["Administrador"] },
  { id: "reportes", label: "Reportes", icon: BarChart3, roles: ["Administrador"] },
];

function Sidebar({ view, setView, mobileOpen, setMobileOpen, warehouseFilter, setWarehouseFilter, currentUser, onLogout }) {
  const visibleNav = NAV.filter((n) => n.roles.includes(currentUser.role));
  return (
    <>
      <aside className="inv-scrollbar-none" style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 236, background: "var(--sidebar)", padding: "20px 14px",
        display: "flex", flexDirection: "column", zIndex: 50, overflowY: "auto",
      }} id="inv-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 22 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, var(--primary), var(--teal))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Boxes size={15} color="#fff" strokeWidth={2.25} />
          </div>
          <div>
            <div className="inv-display" style={{ color: "#fff", fontSize: 15, fontWeight: 700, lineHeight: 1 }}>INTERMEDIC</div>
            <div style={{ color: "var(--sidebar-ink)", fontSize: 10.5, marginTop: 2 }}>Inventario</div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="inv-focus" style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--sidebar-ink)", cursor: "pointer", display: "none" }} id="inv-sidebar-close"><X size={16} /></button>
        </div>

        <div style={{ padding: "0 8px", marginBottom: 16 }}>
          <div style={{ color: "var(--sidebar-ink)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Bodega activa</div>
          <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} className="inv-focus" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 12.5, padding: "7px 8px" }}>
            <option value="Todas">Todas las bodegas</option>
            {WH_NAMES.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {visibleNav.map((n) => (
            <button key={n.id} onClick={() => { setView(n.id); setMobileOpen(false); }} className={`inv-sidebar-link inv-focus ${view === n.id ? "active" : ""}`}>
              <n.icon size={16} /> {n.label}
            </button>
          ))}
        </nav>

        {currentUser.role === "Vendedor" && (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 9, padding: 10, marginBottom: 10 }}>
            <div style={{ color: "var(--sidebar-ink)", fontSize: 11, lineHeight: 1.5 }}>Tu perfil solo puede registrar <strong style={{ color: "#fff" }}>salidas por venta</strong>. Para entradas, ajustes o cambios de precio, contacta al administrador.</div>
          </div>
        )}

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14, marginTop: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px" }}>
            <div className="inv-mono" style={{ width: 28, height: 28, borderRadius: "50%", background: currentUser.color, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{currentUser.initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser.name}</div>
              <div style={{ color: "var(--sidebar-ink)", fontSize: 11 }}>{currentUser.role}</div>
            </div>
            <button onClick={onLogout} className="inv-focus" aria-label="Cerrar sesión" style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0 }}>
              <LogOut size={14} style={{ color: "var(--sidebar-ink)" }} />
            </button>
          </div>
        </div>
      </aside>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 45, display: "none" }} id="inv-sidebar-backdrop" />}
      <style>{`
        @media (max-width: 900px) {
          #inv-sidebar { transform: translateX(${mobileOpen ? "0" : "-100%"}); transition: transform .25s ease; }
          #inv-sidebar-close { display: flex !important; }
          #inv-sidebar-backdrop { display: block !important; }
        }
        @media (min-width: 901px) { #inv-sidebar { transform: none !important; } }
      `}</style>
    </>
  );
}

function GlobalSearch({ products, suppliers, onGoto }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    const out = [];
    products.forEach((p) => (p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || p.barcode.includes(s)) && out.push({ kind: "Producto", label: p.name, sub: p.sku, go: () => onGoto("productos", p) }));
    suppliers.forEach((sp) => sp.name.toLowerCase().includes(s) && out.push({ kind: "Proveedor", label: sp.name, sub: sp.category, go: () => onGoto("proveedores") }));
    return out.slice(0, 8);
  }, [q, products, suppliers]);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, maxWidth: 380 }}>
      <Search size={15} className="inv-ink-faint" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Buscar por producto, SKU, código de barras…" className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px 9px 34px", fontSize: 13.5 }} />
      {open && q.trim() && (
        <div className="inv-surface inv-border inv-shadow-lg inv-scrollbar-none" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, borderRadius: 10, padding: 6, zIndex: 60, maxHeight: 320, overflowY: "auto" }}>
          {results.length === 0 ? <div className="inv-ink-faint" style={{ padding: 10, fontSize: 12.5 }}>Sin resultados para "{q}"</div> : results.map((r, i) => (
            <button key={i} onClick={() => { r.go(); setOpen(false); setQ(""); }} className="inv-focus" style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "9px 10px", background: "none", border: "none", borderRadius: 7, cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
              <span style={{ fontSize: 13 }}>{r.label} <span className="inv-ink-faint" style={{ fontSize: 11.5 }}>· {r.sub}</span></span>
              <span className="inv-mono inv-ink-faint" style={{ fontSize: 10.5 }}>{r.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Topbar({ dark, setDark, setMobileOpen, openModal, products, suppliers, onGoto, alertCount, role }) {
  const [addOpen, setAddOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setAddOpen(false));
  const options = role === "Administrador"
    ? [["Entrada", "Entrada"], ["Salida", "Salida"], ["Transferencia", "Transferencia"], ["Ajuste", "Ajuste"], ["Producto", "producto"]]
    : [["Registrar salida (venta)", "Salida"]];
  return (
    <div className="inv-border-b inv-surface" style={{ position: "sticky", top: 0, zIndex: 30, height: 64, display: "flex", alignItems: "center", gap: 14, padding: "0 22px" }}>
      <button onClick={() => setMobileOpen(true)} className="inv-icon-btn inv-focus" style={{ width: 34, height: 34, display: "none" }} id="inv-menu-btn" aria-label="Abrir menú"><Menu size={16} /></button>
      <GlobalSearch products={products} suppliers={suppliers} onGoto={onGoto} />
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setDark(!dark)} className="inv-icon-btn inv-focus" style={{ width: 34, height: 34 }} aria-label="Tema">{dark ? <Sun size={15} /> : <Moon size={15} />}</button>
        <button className="inv-icon-btn inv-focus" style={{ width: 34, height: 34, position: "relative" }} aria-label="Alertas">
          <Bell size={15} />
          {alertCount > 0 && <span className="inv-mono" style={{ position: "absolute", top: -4, right: -4, background: "var(--red)", color: "#fff", fontSize: 10, borderRadius: 999, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{alertCount}</span>}
        </button>
        <div ref={ref} style={{ position: "relative" }}>
          <button onClick={() => setAddOpen(!addOpen)} className="inv-btn inv-btn-primary inv-focus" style={{ padding: "9px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={15} /> {role === "Administrador" ? "Nuevo" : "Registrar venta"} <ChevronDown size={13} />
          </button>
          {addOpen && (
            <div className="inv-surface inv-border inv-shadow-lg" style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", borderRadius: 10, padding: 6, width: 210, zIndex: 40 }}>
              {options.map(([label, key]) => (
                <button key={key} onClick={() => { setAddOpen(false); openModal(key); }} className="inv-focus" style={{ width: "100%", textAlign: "left", padding: "8px 10px", background: "none", border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { #inv-menu-btn { display: flex !important; } }`}</style>
    </div>
  );
}

/* =========================================================================
   DASHBOARD
   ========================================================================= */

function Dashboard({ products, movements, warehouseFilter, setView, role, currentUser }) {
  const isAdmin = role === "Administrador";
  const inWh = (p) => stockInWarehouse(p, warehouseFilter);
  const totalValue = products.reduce((s, p) => s + inWh(p) * p.costProm, 0);
  const lowStock = products.filter((p) => inWh(p) <= p.stockMin);
  const expiring = products.flatMap((p) => (p.lotes || []).filter((l) => (warehouseFilter === "Todas" || l.warehouse === warehouseFilter) && daysUntil(l.vencimiento) <= 60).map((l) => ({ ...l, product: p })));
  const relevantMoves = isAdmin ? movements : movements.filter((m) => m.user === currentUser.name);
  const recentMoves = [...relevantMoves].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const myTodaySales = movements.filter((m) => m.type === "Salida" && m.user === currentUser.name && m.date === TODAY).length;

  const byCategory = useMemo(() => {
    const map = {};
    products.forEach((p) => { map[p.category] = (map[p.category] || 0) + inWh(p) * p.costProm; });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [products, warehouseFilter]);

  const byWarehouse = WAREHOUSES.map((w, i) => ({ name: w.name, value: products.reduce((s, p) => s + (p.warehouses[w.name] || 0) * p.costProm, 0), color: ["#0057D9", "#00998A", "#C9600A", "#7C5CFF"][i] }));

  return (
    <div className="inv-fade">
      <ViewHeader title="Dashboard" desc={isAdmin ? `Resumen general del inventario ${warehouseFilter === "Todas" ? "— todas las bodegas" : `— ${warehouseFilter}`}.` : `Bienvenido, ${currentUser.name}. Aquí puedes ver el stock y registrar tus ventas.`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }} className="inv-kpi-grid">
        {isAdmin ? (
          <KpiCard label="Valor total en inventario" value={formatQ(totalValue)} delta={`${products.length} productos activos`} icon={DollarSign} accent="#00998A" />
        ) : (
          <KpiCard label="Tus ventas registradas hoy" value={myTodaySales} delta="Salidas por venta" icon={ArrowUpFromLine} accent="#00998A" />
        )}
        <KpiCard label="Stock bajo el mínimo" value={lowStock.length} delta="Requieren reposición" tone="var(--red)" icon={AlertTriangle} accent="#D65959" />
        <KpiCard label="Lotes por vencer (60 días)" value={expiring.length} delta="Revisar antes de despachar" tone="var(--amber)" icon={CalendarClock} accent="#C9600A" />
        <KpiCard label={isAdmin ? "Movimientos (30 días)" : "Tus salidas (30 días)"} value={relevantMoves.filter((m) => daysUntil(m.date) >= -30).length} delta={isAdmin ? "Entradas, salidas y ajustes" : "Ventas registradas"} icon={ArrowLeftRight} accent="#0057D9" />
      </div>

      {isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }} className="inv-dash-grid">
          <div className="inv-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Valor de inventario por categoría</div>
            <div className="inv-ink-faint" style={{ fontSize: 12, marginBottom: 10 }}>Top 6 categorías (Q)</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCategory} layout="vertical" margin={{ left: 10, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--line)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatQ(v)} contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }} />
                <Bar dataKey="value" fill="#0057D9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="inv-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Distribución por bodega</div>
            <div className="inv-ink-faint" style={{ fontSize: 12, marginBottom: 10 }}>Valor total (Q)</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={byWarehouse} dataKey="value" nameKey="name" innerRadius={40} outerRadius={64} paddingAngle={2}>
                  {byWarehouse.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatQ(v)} contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
              {byWarehouse.map((w) => (
                <div key={w.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: w.color }} /><span className="inv-ink-soft" style={{ flex: 1 }}>{w.name}</span><span className="inv-mono" style={{ fontWeight: 600 }}>{formatQ(w.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="inv-dash-grid2">
        <div className="inv-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Stock bajo el mínimo</div>
            <button onClick={() => setView("productos")} className="inv-primary" style={{ fontSize: 12.5, background: "none", border: "none", cursor: "pointer" }}>Ver productos</button>
          </div>
          {lowStock.length === 0 ? <div className="inv-ink-faint" style={{ fontSize: 13 }}>Todos los productos están dentro de su rango.</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {lowStock.slice(0, 5).map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--red-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><AlertTriangle size={14} style={{ color: "var(--red)" }} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 500 }} className="inv-line-clamp">{p.name}</div><div className="inv-ink-faint inv-mono" style={{ fontSize: 11 }}>{p.sku}</div></div>
                  <span className="inv-mono" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--red)" }}>{inWh(p)}/{p.stockMin}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="inv-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{isAdmin ? "Movimientos recientes" : "Tus últimas ventas registradas"}</div>
            <button onClick={() => setView("movimientos")} className="inv-primary" style={{ fontSize: 12.5, background: "none", border: "none", cursor: "pointer" }}>Ver todos</button>
          </div>
          {recentMoves.length === 0 ? <div className="inv-ink-faint" style={{ fontSize: 13 }}>Aún no has registrado ventas.</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentMoves.map((m) => {
              const t = MOVE_TYPE_MAP[m.type]; const Icon = t.icon;
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={14} style={{ color: t.fg }} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{m.type} · {m.sku}</div><div className="inv-ink-faint" style={{ fontSize: 11 }}>{m.ref || "—"}</div></div>
                  <span className="inv-mono inv-ink-faint" style={{ fontSize: 11.5 }}>{formatDateShort(m.date)}</span>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 1100px) { .inv-kpi-grid { grid-template-columns: repeat(2,1fr) !important; } .inv-dash-grid { grid-template-columns: 1fr !important; } .inv-dash-grid2 { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px) { .inv-kpi-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

/* =========================================================================
   MOVIMIENTOS
   ========================================================================= */

function MovementsView({ movements, products, warehouseFilter, onNew, role, currentUser }) {
  const isAdmin = role === "Administrador";
  const [typeFilter, setTypeFilter] = useState("Todos");
  const types = isAdmin ? ["Todos", "Entrada", "Salida", "Transferencia", "Ajuste"] : ["Salida"];

  const baseMovements = isAdmin ? movements : movements.filter((m) => m.user === currentUser.name && m.type === "Salida");

  const filtered = [...baseMovements]
    .filter((m) => typeFilter === "Todos" || m.type === typeFilter)
    .filter((m) => warehouseFilter === "Todas" || m.from === warehouseFilter || m.to === warehouseFilter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const productName = (sku) => products.find((p) => p.sku === sku)?.name || sku;

  return (
    <div className="inv-fade">
      <ViewHeader title={isAdmin ? "Movimientos" : "Mis ventas registradas"} desc={isAdmin ? "Entradas, salidas, transferencias y ajustes de inventario." : "Historial de salidas por venta que has registrado."}
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {isAdmin && <button onClick={() => onNew("Entrada")} className="inv-btn inv-btn-outline inv-focus" style={{ padding: "9px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><ArrowDownToLine size={14} /> Entrada</button>}
            <button onClick={() => onNew("Salida")} className={`inv-btn ${isAdmin ? "inv-btn-outline" : "inv-btn-primary"} inv-focus`} style={{ padding: "9px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><ArrowUpFromLine size={14} /> {isAdmin ? "Salida" : "Registrar venta"}</button>
            {isAdmin && <button onClick={() => onNew("Transferencia")} className="inv-btn inv-btn-outline inv-focus" style={{ padding: "9px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><ArrowLeftRight size={14} /> Transferencia</button>}
            {isAdmin && <button onClick={() => onNew("Ajuste")} className="inv-btn inv-btn-primary inv-focus" style={{ padding: "9px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><RefreshCw size={14} /> Ajuste</button>}
          </div>
        } />

      {isAdmin && (
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className="inv-focus" style={{ padding: "7px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: "1px solid " + (typeFilter === t ? "var(--primary)" : "var(--line)"), background: typeFilter === t ? "var(--primary-soft)" : "var(--surface)", color: typeFilter === t ? "var(--primary)" : "var(--ink-soft)" }}>{t}</button>
        ))}
      </div>
      )}

      <div className="inv-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead><tr className="inv-border-b inv-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase" }}>
            {["Fecha", "Tipo", "Producto", "Cantidad", "Origen → Destino", "Referencia", "Usuario"].map((h) => <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((m) => {
              const t = MOVE_TYPE_MAP[m.type]; const Icon = t.icon;
              return (
                <tr key={m.id} className="inv-table-row inv-border-b">
                  <td className="inv-mono inv-ink-faint" style={{ padding: "12px 16px", fontSize: 12 }}>{formatDateShort(m.date)}</td>
                  <td style={{ padding: "12px 16px" }}><span className="inv-badge" style={{ background: t.bg, color: t.fg }}><Icon size={11} /> {m.type}</span></td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500 }} className="inv-line-clamp">{productName(m.sku)}</td>
                  <td className="inv-mono" style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>{Math.abs(m.qty)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="inv-ink-soft">{m.from || "—"} {m.to ? `→ ${m.to}` : ""}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="inv-ink-soft inv-line-clamp">{m.ref || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="inv-ink-soft">{m.user}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 40, textAlign: "center" }} className="inv-ink-faint">Sin movimientos para este filtro.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   BODEGAS
   ========================================================================= */

function WarehousesView({ products }) {
  return (
    <div className="inv-fade">
      <ViewHeader title="Bodegas y sucursales" desc="Distribución del inventario por ubicación física." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="inv-wh-grid">
        {WAREHOUSES.map((w) => {
          const items = products.filter((p) => (p.warehouses[w.name] || 0) > 0);
          const totalUnits = items.reduce((s, p) => s + p.warehouses[w.name], 0);
          const totalValue = items.reduce((s, p) => s + p.warehouses[w.name] * p.costProm, 0);
          const top = [...items].sort((a, b) => b.warehouses[w.name] * b.costProm - a.warehouses[w.name] * a.costProm).slice(0, 4);
          return (
            <div key={w.id} className="inv-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Warehouse size={19} className="inv-primary" /></div>
                <div><div style={{ fontSize: 15, fontWeight: 700 }}>{w.name}</div><div className="inv-ink-faint" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> {w.city} · {w.type}</div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div className="inv-card" style={{ padding: 12, background: "var(--bg)" }}><div className="inv-ink-faint" style={{ fontSize: 10.5 }}>Productos distintos</div><div className="inv-mono" style={{ fontSize: 16, fontWeight: 700 }}>{items.length}</div></div>
                <div className="inv-card" style={{ padding: 12, background: "var(--bg)" }}><div className="inv-ink-faint" style={{ fontSize: 10.5 }}>Valor total</div><div className="inv-mono" style={{ fontSize: 16, fontWeight: 700 }}>{formatQ(totalValue)}</div></div>
              </div>
              <div className="inv-ink-faint" style={{ fontSize: 11.5, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".03em" }}>Top productos por valor</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {top.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span className="inv-line-clamp" style={{ maxWidth: 220 }}>{p.name}</span>
                    <span className="inv-mono inv-ink-soft">{p.warehouses[w.name]} {p.unit}s</span>
                  </div>
                ))}
                {top.length === 0 && <div className="inv-ink-faint" style={{ fontSize: 12 }}>Sin existencias registradas.</div>}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@media (max-width: 860px) { .inv-wh-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

/* =========================================================================
   PROVEEDORES
   ========================================================================= */

function SuppliersView({ products }) {
  return (
    <div className="inv-fade">
      <ViewHeader title="Proveedores" desc="Proveedores registrados y los productos que distribuyen para Intermedic."
        action={<button className="inv-btn inv-btn-primary inv-focus" style={{ padding: "10px 16px", fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Nuevo proveedor</button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="inv-sup-grid">
        {SUPPLIERS.map((s) => {
          const items = products.filter((p) => p.supplier === s.name);
          return (
            <div key={s.id} className="inv-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--teal-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Truck size={18} style={{ color: "var(--teal)" }} /></div>
                  <div><div style={{ fontSize: 14.5, fontWeight: 700 }}>{s.name}</div><div className="inv-ink-faint" style={{ fontSize: 12 }}>{s.category}</div></div>
                </div>
                <span className="inv-badge" style={{ background: "var(--bg)", color: "var(--ink-soft)" }}>{items.length} producto{items.length !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }} className="inv-ink-soft"><Building2 size={13} /> {s.contact}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }} className="inv-ink-soft"><Mail size={13} /> {s.email}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }} className="inv-ink-soft"><Phone size={13} /> {s.phone}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }} className="inv-ink-soft"><Clock size={13} /> Tiempo de entrega: {s.leadTime}</div>
              </div>
              {items.length > 0 && (
                <div className="inv-border-t" style={{ paddingTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {items.slice(0, 4).map((p) => <span key={p.id} className="inv-mono inv-ink-faint" style={{ fontSize: 10.5, background: "var(--bg)", borderRadius: 6, padding: "3px 7px" }}>{p.sku}</span>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`@media (max-width: 860px) { .inv-sup-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

/* =========================================================================
   LOTES Y VENCIMIENTOS
   ========================================================================= */

function LotsView({ products, warehouseFilter }) {
  const [statusFilter, setStatusFilter] = useState("Todos");
  const allLots = products.flatMap((p) => (p.lotes || []).map((l) => ({ ...l, product: p })))
    .filter((l) => warehouseFilter === "Todas" || l.warehouse === warehouseFilter)
    .map((l) => { const d = daysUntil(l.vencimiento); const status = d < 0 ? "Vencido" : d <= 30 ? "Vence pronto" : d <= 60 ? "Por vencer" : "Vigente"; return { ...l, d, status }; })
    .sort((a, b) => a.d - b.d);

  const statusMap = { Vencido: { bg: "var(--red-soft)", fg: "var(--red)" }, "Vence pronto": { bg: "var(--red-soft)", fg: "var(--red)" }, "Por vencer": { bg: "var(--amber-soft)", fg: "var(--amber)" }, Vigente: { bg: "var(--teal-soft)", fg: "var(--teal)" } };
  const filtered = statusFilter === "Todos" ? allLots : allLots.filter((l) => l.status === statusFilter);

  return (
    <div className="inv-fade">
      <ViewHeader title="Lotes y vencimientos" desc="Trazabilidad de lotes de productos perecederos o con fecha de expiración." />
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {["Todos", "Vence pronto", "Por vencer", "Vigente", "Vencido"].map((t) => (
          <button key={t} onClick={() => setStatusFilter(t)} className="inv-focus" style={{ padding: "7px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: "1px solid " + (statusFilter === t ? "var(--primary)" : "var(--line)"), background: statusFilter === t ? "var(--primary-soft)" : "var(--surface)", color: statusFilter === t ? "var(--primary)" : "var(--ink-soft)" }}>{t}</button>
        ))}
      </div>
      <div className="inv-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead><tr className="inv-border-b inv-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase" }}>
            {["Producto", "Lote", "Bodega", "Cantidad", "Vencimiento", "Días restantes", "Estado"].map((h) => <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={i} className="inv-table-row inv-border-b">
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500 }} className="inv-line-clamp">{l.product.name}</td>
                <td className="inv-mono" style={{ padding: "12px 16px", fontSize: 12.5 }}>{l.lote}</td>
                <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="inv-ink-soft">{l.warehouse}</td>
                <td className="inv-mono" style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>{l.qty} {l.product.unit}s</td>
                <td className="inv-mono inv-ink-soft" style={{ padding: "12px 16px", fontSize: 12.5 }}>{formatDateShort(l.vencimiento)}</td>
                <td className="inv-mono" style={{ padding: "12px 16px", fontSize: 12.5, fontWeight: 600, color: l.d < 0 ? "var(--red)" : l.d <= 30 ? "var(--red)" : l.d <= 60 ? "var(--amber)" : "var(--ink-soft)" }}>{l.d < 0 ? `Vencido hace ${-l.d} días` : `${l.d} días`}</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={l.status} map={statusMap} /></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 40, textAlign: "center" }} className="inv-ink-faint">Sin lotes para este filtro.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   CONTEO FÍSICO
   ========================================================================= */

function PhysicalCountView({ products, warehouseFilter, onApply }) {
  const wh = warehouseFilter === "Todas" ? WH_NAMES[0] : warehouseFilter;
  const [selectedWh, setSelectedWh] = useState(wh);
  const relevant = products.filter((p) => (p.warehouses[selectedWh] || 0) > 0 || true);
  const [counts, setCounts] = useState({});
  const [applied, setApplied] = useState(false);

  const setCount = (id, v) => setCounts((c) => ({ ...c, [id]: v }));
  const rows = relevant.map((p) => {
    const sistema = p.warehouses[selectedWh] || 0;
    const contadoRaw = counts[p.id];
    const contado = contadoRaw === undefined || contadoRaw === "" ? sistema : Number(contadoRaw);
    return { p, sistema, contado, diff: contado - sistema };
  });
  const withDiff = rows.filter((r) => r.diff !== 0);

  const apply = () => {
    onApply(selectedWh, withDiff);
    setApplied(true);
    setCounts({});
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="inv-fade">
      <ViewHeader title="Conteo físico" desc="Compare el stock del sistema contra el conteo real y genere ajustes automáticamente."
        action={
          <select value={selectedWh} onChange={(e) => setSelectedWh(e.target.value)} className="inv-input inv-focus" style={{ padding: "9px 12px", fontSize: 13 }}>
            {WH_NAMES.map((w) => <option key={w}>{w}</option>)}
          </select>
        } />

      {applied && (
        <div className="inv-card" style={{ padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, background: "var(--teal-soft)", border: "1px solid var(--teal)" }}>
          <Check size={16} style={{ color: "var(--teal)" }} /> <span style={{ fontSize: 13, color: "var(--teal)", fontWeight: 600 }}>Ajustes aplicados correctamente al inventario.</span>
        </div>
      )}

      <div className="inv-card" style={{ overflowX: "auto", marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
          <thead><tr className="inv-border-b inv-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase" }}>
            {["Producto", "SKU", "Stock sistema", "Stock contado", "Diferencia"].map((h) => <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.p.id} className="inv-border-b">
                <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 500 }} className="inv-line-clamp">{r.p.name}</td>
                <td className="inv-mono inv-ink-faint" style={{ padding: "10px 16px", fontSize: 12 }}>{r.p.sku}</td>
                <td className="inv-mono" style={{ padding: "10px 16px", fontSize: 13 }}>{r.sistema}</td>
                <td style={{ padding: "10px 16px" }}>
                  <input type="number" placeholder={String(r.sistema)} value={counts[r.p.id] ?? ""} onChange={(e) => setCount(r.p.id, e.target.value)} className="inv-input inv-focus" style={{ width: 90, padding: "6px 8px", fontSize: 13 }} />
                </td>
                <td className="inv-mono" style={{ padding: "10px 16px", fontSize: 13, fontWeight: 700, color: r.diff === 0 ? "var(--ink-faint)" : r.diff > 0 ? "var(--teal)" : "var(--red)" }}>{r.diff > 0 ? `+${r.diff}` : r.diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="inv-ink-soft" style={{ fontSize: 13 }}>{withDiff.length} producto{withDiff.length !== 1 ? "s" : ""} con diferencia detectada.</span>
        <button onClick={apply} disabled={withDiff.length === 0} className="inv-btn inv-btn-primary inv-focus" style={{ padding: "11px 20px", fontSize: 13.5 }}>Aplicar ajustes ({withDiff.length})</button>
      </div>
    </div>
  );
}

/* =========================================================================
   REPORTES
   ========================================================================= */

function ReportsView({ products, warehouseFilter }) {
  const [importPreview, setImportPreview] = useState(null);
  const fileRef = useRef(null);

  const valuation = products.map((p) => ({ ...p, stock: stockInWarehouse(p, warehouseFilter), value: stockInWarehouse(p, warehouseFilter) * p.costProm }));
  const totalValue = valuation.reduce((s, p) => s + p.value, 0);

  const exportValuation = () => downloadCSV(
    `inventario_valorizado_${TODAY}.csv`,
    ["SKU", "Producto", "Categoría", "Marca", "Stock", "Costo Promedio", "Valor Total"],
    valuation.map((p) => [p.sku, p.name, p.category, p.brand, p.stock, p.costProm.toFixed(2), p.value.toFixed(2)])
  );

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target.result);
      const lines = text.split(/\r?\n/).filter(Boolean).slice(0, 6);
      const rows = lines.map((l) => l.split(","));
      setImportPreview(rows);
    };
    reader.readAsText(file);
  };

  return (
    <div className="inv-fade">
      <ViewHeader title="Reportes" desc="Valorización de inventario, e importación / exportación de datos." />

      <div className="inv-card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Valor total del inventario</div>
            <div className="inv-ink-faint" style={{ fontSize: 12 }}>{warehouseFilter === "Todas" ? "Todas las bodegas" : warehouseFilter} · costo promedio ponderado</div>
          </div>
          <div className="inv-mono inv-display" style={{ fontSize: 26, fontWeight: 700 }}>{formatQ(totalValue)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="inv-rep-grid">
        <div className="inv-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Download size={16} className="inv-primary" />
            <div style={{ fontSize: 14, fontWeight: 700 }}>Exportar a Excel (CSV)</div>
          </div>
          <p className="inv-ink-soft" style={{ fontSize: 13, marginBottom: 14 }}>Descarga el inventario valorizado completo, listo para abrir en Excel o Google Sheets.</p>
          <button onClick={exportValuation} className="inv-btn inv-btn-primary inv-focus" style={{ padding: "10px 18px", fontSize: 13.5 }}>Descargar CSV</button>
        </div>
        <div className="inv-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Upload size={16} className="inv-primary" />
            <div style={{ fontSize: 14, fontWeight: 700 }}>Importar desde Excel (CSV)</div>
          </div>
          <p className="inv-ink-soft" style={{ fontSize: 13, marginBottom: 14 }}>Suba un archivo CSV para previsualizar su contenido antes de fusionarlo al catálogo.</p>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} className="inv-btn inv-btn-outline inv-focus" style={{ padding: "10px 18px", fontSize: 13.5 }}>Seleccionar archivo</button>
          {importPreview && (
            <div style={{ marginTop: 14, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                <tbody>
                  {importPreview.map((row, i) => (
                    <tr key={i} className="inv-border-b">{row.map((cell, j) => <td key={j} style={{ padding: "5px 8px", fontWeight: i === 0 ? 700 : 400 }} className={i === 0 ? "" : "inv-ink-soft"}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
              <div className="inv-ink-faint" style={{ fontSize: 11, marginTop: 6 }}>Vista previa — la fusión con el catálogo se confirma manualmente.</div>
            </div>
          )}
        </div>
      </div>

      <div className="inv-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead><tr className="inv-border-b inv-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase" }}>
            {["SKU", "Producto", "Categoría", "Stock", "Costo prom.", "Valor"].map((h) => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {valuation.sort((a, b) => b.value - a.value).map((p) => (
              <tr key={p.id} className="inv-border-b">
                <td className="inv-mono inv-ink-faint" style={{ padding: "9px 12px", fontSize: 12 }}>{p.sku}</td>
                <td style={{ padding: "9px 12px", fontSize: 13 }} className="inv-line-clamp">{p.name}</td>
                <td style={{ padding: "9px 12px", fontSize: 12.5 }} className="inv-ink-soft">{p.category}</td>
                <td className="inv-mono" style={{ padding: "9px 12px", fontSize: 13 }}>{p.stock}</td>
                <td className="inv-mono inv-ink-soft" style={{ padding: "9px 12px", fontSize: 12.5 }}>{formatQ(p.costProm)}</td>
                <td className="inv-mono" style={{ padding: "9px 12px", fontSize: 13, fontWeight: 700 }}>{formatQ(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`@media (max-width: 900px) { .inv-rep-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

/* =========================================================================
   FORM MODAL genérico + MODAL DE MOVIMIENTO + NUEVO PRODUCTO
   ========================================================================= */

function FormModal({ title, desc, onClose, onSubmit, submitLabel = "Guardar", children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.55)" }} />
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="inv-surface inv-shadow-lg inv-fade inv-scrollbar-none" style={{ position: "relative", width: "min(460px,100%)", maxHeight: "88vh", overflowY: "auto", borderRadius: 16, padding: 26 }}>
        <button type="button" onClick={onClose} className="inv-icon-btn inv-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>
        <h3 className="inv-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, paddingRight: 30 }}>{title}</h3>
        {desc && <p className="inv-ink-soft" style={{ fontSize: 12.5, marginBottom: 18 }}>{desc}</p>}
        <div>{children}</div>
        <button type="submit" className="inv-btn inv-btn-primary inv-focus" style={{ width: "100%", padding: 12, fontSize: 13.5, marginTop: 6 }}>{submitLabel}</button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="inv-field"><label className="inv-label">{label}</label>{children}</div>;
}

const MOVE_META = {
  Entrada: { title: "Nueva entrada", desc: "Registre el ingreso de mercadería a una bodega.", needsCost: true, needsFrom: false, needsTo: true },
  Salida: { title: "Nueva salida", desc: "Registre la salida de mercadería por venta, consumo o merma.", needsCost: false, needsFrom: true, needsTo: false },
  Transferencia: { title: "Nueva transferencia", desc: "Mueva existencias entre bodegas o sucursales.", needsCost: false, needsFrom: true, needsTo: true },
  Ajuste: { title: "Nuevo ajuste", desc: "Corrija existencias por conteo físico, daño u otra causa.", needsCost: false, needsFrom: true, needsTo: false, hasSign: true },
};

function MovementModal({ type, products, onClose, onCreate }) {
  const meta = MOVE_META[type];
  const [form, setForm] = useState({ sku: products[0]?.sku || "", qty: "", from: WH_NAMES[0], to: WH_NAMES[1] || WH_NAMES[0], cost: "", ref: "", sign: "positivo" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const product = products.find((p) => p.sku === form.sku);
  const available = product ? (product.warehouses[form.from] || 0) : 0;
  const exceeds = (type === "Salida" || type === "Transferencia" || (type === "Ajuste" && form.sign === "negativo")) && Number(form.qty) > available;

  return (
    <FormModal title={meta.title} desc={meta.desc} onClose={onClose} submitLabel={`Registrar ${type.toLowerCase()}`}
      onSubmit={() => {
        if (!form.sku || !form.qty) return;
        let qty = Math.abs(Number(form.qty));
        if (type === "Salida" || (type === "Ajuste" && form.sign === "negativo")) qty = -qty;
        onCreate({ type, sku: form.sku, qty, from: meta.needsFrom ? form.from : null, to: meta.needsTo ? form.to : null, cost: meta.needsCost ? Number(form.cost) : null, ref: form.ref });
        onClose();
      }}>
      <Field label="Producto">
        <select value={form.sku} onChange={(e) => set("sku", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>
          {products.map((p) => <option key={p.id} value={p.sku}>{p.sku} — {p.name}</option>)}
        </select>
      </Field>
      {type === "Ajuste" && (
        <Field label="Tipo de ajuste">
          <div style={{ display: "flex", gap: 4, background: "var(--bg)", borderRadius: 8, padding: 3 }}>
            {[["positivo", "Suma (+)"], ["negativo", "Resta (−)"]].map(([v, l]) => (
              <button key={v} type="button" onClick={() => set("sign", v)} style={{ flex: 1, padding: "7px 10px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer", background: form.sign === v ? "var(--surface)" : "none", color: form.sign === v ? "var(--primary)" : "var(--ink-faint)" }}>{l}</button>
            ))}
          </div>
        </Field>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <Field label={`Cantidad (${product?.unit || "unidad"})`}><input required type="number" min="1" value={form.qty} onChange={(e) => set("qty", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
        {meta.needsCost && <Field label="Costo unitario (Q)"><input required type="number" min="0" value={form.cost} onChange={(e) => set("cost", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder={product ? String(product.ultimoCosto) : ""} /></Field>}
      </div>
      {meta.needsFrom && (
        <Field label={type === "Transferencia" ? "Bodega origen" : "Bodega"}>
          <select value={form.from} onChange={(e) => set("from", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{WH_NAMES.map((w) => <option key={w}>{w}</option>)}</select>
          {product && <div className="inv-ink-faint" style={{ fontSize: 11.5, marginTop: 5 }}>Disponible: {available} {product.unit}s</div>}
        </Field>
      )}
      {meta.needsTo && (
        <Field label={type === "Transferencia" ? "Bodega destino" : "Bodega destino"}>
          <select value={form.to} onChange={(e) => set("to", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{WH_NAMES.map((w) => <option key={w}>{w}</option>)}</select>
        </Field>
      )}
      <Field label="Referencia / motivo"><input value={form.ref} onChange={(e) => set("ref", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Orden de compra, venta, motivo del ajuste…" /></Field>
      {exceeds && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--red)", marginTop: -6, marginBottom: 10 }}><AlertTriangle size={13} /> La cantidad excede el disponible en esa bodega ({available}).</div>}
    </FormModal>
  );
}

const CATEGORIES_INV = [...new Set(PRODUCTS.map((p) => p.category))];

function AddProductModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", sku: "", category: CATEGORIES_INV[0], brand: "", supplier: SUPPLIERS[0].name, unit: "unidad", cost: "", stockMin: 1, stockMax: 10, warehouse: WH_NAMES[0], initialQty: 0 });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <FormModal title="Nuevo producto" desc="Registre un producto en el catálogo de inventario." onClose={onClose} submitLabel="Crear producto"
      onSubmit={() => { if (!form.name.trim() || !form.sku.trim()) return; onCreate(form); onClose(); }}>
      <Field label="Nombre del producto"><input required value={form.name} onChange={(e) => set("name", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Oxímetro de Pulso Digital" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="SKU"><input required value={form.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. OXI-DIG" /></Field>
        <Field label="Marca"><input value={form.brand} onChange={(e) => set("brand", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Categoría"><select value={form.category} onChange={(e) => set("category", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{CATEGORIES_INV.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Proveedor"><select value={form.supplier} onChange={(e) => set("supplier", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{SUPPLIERS.map((s) => <option key={s.id}>{s.name}</option>)}</select></Field>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Unidad"><input value={form.unit} onChange={(e) => set("unit", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="unidad, caja, par…" /></Field>
        <Field label="Costo (Q)"><input required type="number" min="0" value={form.cost} onChange={(e) => set("cost", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Stock mínimo"><input type="number" min="0" value={form.stockMin} onChange={(e) => set("stockMin", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
        <Field label="Stock máximo"><input type="number" min="0" value={form.stockMax} onChange={(e) => set("stockMax", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Bodega inicial"><select value={form.warehouse} onChange={(e) => set("warehouse", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{WH_NAMES.map((w) => <option key={w}>{w}</option>)}</select></Field>
        <Field label="Cantidad inicial"><input type="number" min="0" value={form.initialQty} onChange={(e) => set("initialQty", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
      </div>
    </FormModal>
  );
}

function EditPriceModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({ costProm: product.costProm, ultimoCosto: product.ultimoCosto, stockMin: product.stockMin, stockMax: product.stockMax });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <FormModal title="Editar precio / costo" desc={product.name} onClose={onClose} submitLabel="Guardar cambios"
      onSubmit={() => onSave(product.sku, { costProm: Number(form.costProm), ultimoCosto: Number(form.ultimoCosto), stockMin: Number(form.stockMin), stockMax: Number(form.stockMax) })}>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Costo promedio (Q)"><input required type="number" min="0" step="0.01" value={form.costProm} onChange={(e) => set("costProm", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
        <Field label="Último costo (Q)"><input required type="number" min="0" step="0.01" value={form.ultimoCosto} onChange={(e) => set("ultimoCosto", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Stock mínimo"><input type="number" min="0" value={form.stockMin} onChange={(e) => set("stockMin", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
        <Field label="Stock máximo"><input type="number" min="0" value={form.stockMax} onChange={(e) => set("stockMax", e.target.value)} className="inv-input inv-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
      </div>
      <div className="inv-ink-faint" style={{ fontSize: 11.5, marginTop: -6 }}>Este cambio corrige el costo directamente, sin generar un movimiento de entrada.</div>
    </FormModal>
  );
}

/* =========================================================================
   MAIN APP
   ========================================================================= */

export default function IntermedicInventario() {
  const [currentUser, setCurrentUser] = useState(null);
  const [dark, setDark] = useState(false);
  const [view, setView] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(true);
  const [warehouseFilter, setWarehouseFilter] = useState("Todas");

  const [products, setProducts] = useState(PRODUCTS);
  const [movements, setMovements] = useState(MOVEMENTS);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceEditProduct, setPriceEditProduct] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // "Entrada" | "Salida" | "Transferencia" | "Ajuste" | "producto"

  if (!currentUser) {
    return <LoginScreen onLogin={(u) => setCurrentUser(u)} />;
  }
  const role = currentUser.role;
  const isAdmin = role === "Administrador";

  const handleLogout = () => {
    setCurrentUser(null);
    setView("dashboard");
    setMobileOpen(false);
    setActiveModal(null);
    setSelectedProduct(null);
  };

  const goto = (targetView, item) => {
    if (!isAdmin && !["dashboard", "productos", "movimientos", "lotes"].includes(targetView)) return;
    setView(targetView);
    if (targetView === "productos" && item) setSelectedProduct(item);
  };

  const applyMovement = (m) => {
    if (!isAdmin && m.type !== "Salida") return; // los vendedores solo registran salidas
    setProducts((prev) => prev.map((p) => {
      if (p.sku !== m.sku) return p;
      const warehouses = { ...p.warehouses };
      let costProm = p.costProm, ultimoCosto = p.ultimoCosto;
      if (m.type === "Entrada" || (m.type === "Ajuste" && m.qty > 0)) {
        const qty = Math.abs(m.qty);
        const oldTotal = totalStock(p);
        const cost = m.cost ?? costProm;
        costProm = oldTotal + qty === 0 ? cost : ((oldTotal * costProm) + (qty * cost)) / (oldTotal + qty);
        if (m.cost) ultimoCosto = cost;
        warehouses[m.to] = (warehouses[m.to] || 0) + qty;
      } else if (m.type === "Salida" || (m.type === "Ajuste" && m.qty < 0)) {
        const qty = Math.abs(m.qty);
        warehouses[m.from] = Math.max(0, (warehouses[m.from] || 0) - qty);
      } else if (m.type === "Transferencia") {
        const qty = Math.abs(m.qty);
        warehouses[m.from] = Math.max(0, (warehouses[m.from] || 0) - qty);
        warehouses[m.to] = (warehouses[m.to] || 0) + qty;
      }
      return { ...p, warehouses, costProm, ultimoCosto };
    }));
    setMovements((prev) => [...prev, mv(TODAY, m.type, m.sku, m.qty, { from: m.from, to: m.to, cost: m.cost, ref: m.ref, user: currentUser.name })]);
  };

  const applyPhysicalCount = (warehouse, diffs) => {
    if (!isAdmin) return;
    diffs.forEach((r) => applyMovement({ type: "Ajuste", sku: r.p.sku, qty: r.diff, from: warehouse, ref: "Conteo físico — ajuste automático" }));
  };

  const createProduct = (f) => {
    if (!isAdmin) return;
    const newProduct = {
      id: "p" + Date.now(), sku: f.sku, barcode: "750" + Math.floor(1000000000 + Math.random() * 8999999999),
      name: f.name, category: f.category, brand: f.brand || "Genérico", supplier: f.supplier, unit: f.unit || "unidad",
      costProm: Number(f.cost) || 0, ultimoCosto: Number(f.cost) || 0, stockMin: Number(f.stockMin) || 0, stockMax: Number(f.stockMax) || 10,
      serialized: false, warehouses: { [f.warehouse]: Number(f.initialQty) || 0 },
    };
    setProducts((prev) => [newProduct, ...prev]);
    if (Number(f.initialQty) > 0) {
      setMovements((prev) => [...prev, mv(TODAY, "Entrada", f.sku, Number(f.initialQty), { to: f.warehouse, cost: Number(f.cost) || 0, ref: "Alta de producto", user: currentUser.name })]);
    }
  };

  const savePrice = (sku, changes) => {
    if (!isAdmin) return;
    setProducts((prev) => prev.map((p) => (p.sku === sku ? { ...p, ...changes } : p)));
    setPriceEditProduct(null);
  };

  const lowStockCount = products.filter((p) => stockInWarehouse(p, warehouseFilter) <= p.stockMin).length;
  const expiringCount = products.flatMap((p) => (p.lotes || []).filter((l) => (warehouseFilter === "Todas" || l.warehouse === warehouseFilter) && daysUntil(l.vencimiento) <= 30)).length;
  const alertCount = lowStockCount + expiringCount;

  return (
    <div className={`inv-root${dark ? " inv-dark" : ""}`} style={{ display: "flex" }}>
      <GlobalStyles />
      <Sidebar view={view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} warehouseFilter={warehouseFilter} setWarehouseFilter={setWarehouseFilter} currentUser={currentUser} onLogout={handleLogout} />
      <div style={{ flex: 1, minWidth: 0, marginLeft: 236 }} className="inv-main">
        <Topbar dark={dark} setDark={setDark} setMobileOpen={setMobileOpen} openModal={setActiveModal} products={products} suppliers={SUPPLIERS} onGoto={goto} alertCount={alertCount} role={role} />
        <div style={{ padding: "24px 26px 60px" }}>
          {view === "dashboard" && <Dashboard products={products} movements={movements} warehouseFilter={warehouseFilter} setView={setView} role={role} currentUser={currentUser} />}
          {view === "productos" && <ProductsView products={products} warehouseFilter={warehouseFilter} onOpen={setSelectedProduct} onNew={() => setActiveModal("producto")} role={role} />}
          {view === "movimientos" && <MovementsView movements={movements} products={products} warehouseFilter={warehouseFilter} onNew={setActiveModal} role={role} currentUser={currentUser} />}
          {view === "bodegas" && isAdmin && <WarehousesView products={products} />}
          {view === "proveedores" && isAdmin && <SuppliersView products={products} />}
          {view === "lotes" && <LotsView products={products} warehouseFilter={warehouseFilter} />}
          {view === "conteo" && isAdmin && <PhysicalCountView products={products} warehouseFilter={warehouseFilter} onApply={applyPhysicalCount} />}
          {view === "reportes" && isAdmin && <ReportsView products={products} warehouseFilter={warehouseFilter} />}
        </div>
      </div>

      <ProductDetail product={selectedProduct} movements={movements} onClose={() => setSelectedProduct(null)} role={role} onEditPrice={(p) => setPriceEditProduct(p)} />

      {["Entrada", "Salida", "Transferencia", "Ajuste"].includes(activeModal) && (isAdmin || activeModal === "Salida") && (
        <MovementModal type={activeModal} products={products} onClose={() => setActiveModal(null)} onCreate={applyMovement} />
      )}
      {activeModal === "producto" && isAdmin && <AddProductModal onClose={() => setActiveModal(null)} onCreate={createProduct} />}
      {priceEditProduct && isAdmin && <EditPriceModal product={priceEditProduct} onClose={() => setPriceEditProduct(null)} onSave={savePrice} />}

      <style>{`@media (max-width: 900px) { .inv-main { margin-left: 0 !important; } }`}</style>
    </div>
  );
}
