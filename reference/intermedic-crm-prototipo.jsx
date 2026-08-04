import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LayoutDashboard, Users, Building2, Columns3, FileText, CheckSquare, BarChart3,
  Search, Bell, Plus, ChevronDown, MoreHorizontal, Phone, Mail, MessageSquare,
  ArrowUpRight, ArrowDownRight, Filter, Clock, Briefcase, TrendingUp, Target,
  UserPlus, MapPin, Tag, X, Check, Edit3, Trash2, ChevronLeft, ChevronRight,
  Sun, Moon, Menu, GripVertical, AlertCircle, Calendar as CalendarIcon,
  DollarSign, Star, Send, StickyNote, History, ChevronsUpDown, LogOut,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

/* =========================================================================
   MOCK DATA
   ========================================================================= */

const REPS = ["Ana López", "Carlos Méndez", "María Fernanda Ruiz", "Diego Castillo"];
const REP_COLORS = { "Ana López": "#0057D9", "Carlos Méndez": "#00998A", "María Fernanda Ruiz": "#C9600A", "Diego Castillo": "#7C5CFF" };
const initials = (name) => name.split(" ").map((n) => n[0]).slice(0, 2).join("");

const INITIAL_COMPANIES = [
  { id: "c1", name: "Hospital Regional Altiplano", sector: "Hospital", contacts: 4, city: "Quetzaltenango", rep: "Ana López" },
  { id: "c2", name: "Clínica Vida Nueva", sector: "Clínica", contacts: 2, city: "Ciudad de Guatemala", rep: "Carlos Méndez" },
  { id: "c3", name: "Laboratorio Clínico Central", sector: "Laboratorio", contacts: 3, city: "Ciudad de Guatemala", rep: "María Fernanda Ruiz" },
  { id: "c4", name: "Centro de Diagnóstico Quetzal", sector: "Clínica", contacts: 2, city: "Antigua Guatemala", rep: "Diego Castillo" },
  { id: "c5", name: "Clínica Dental Sonrisas", sector: "Odontología", contacts: 1, city: "Ciudad de Guatemala", rep: "Ana López" },
  { id: "c6", name: "Veterinaria Fauna Sur", sector: "Veterinaria", contacts: 1, city: "Escuintla", rep: "Carlos Méndez" },
  { id: "c7", name: "Hospital Privado del Valle", sector: "Hospital", contacts: 3, city: "Ciudad de Guatemala", rep: "María Fernanda Ruiz" },
  { id: "c8", name: "Clínica San Rafael", sector: "Clínica", contacts: 2, city: "Mixco", rep: "Diego Castillo" },
];

const INITIAL_CONTACTS = [
  { id: "ct1", name: "Rodrigo Paz", role: "Jefe de Compras", company: "Hospital Regional Altiplano", email: "rpaz@altiplano.gt", phone: "+502 5511 2201", lastContact: "2026-07-28", status: "Activo" },
  { id: "ct2", name: "Elena Sian", role: "Administradora", company: "Clínica Vida Nueva", email: "esian@vidanueva.gt", phone: "+502 4433 8890", lastContact: "2026-07-30", status: "Activo" },
  { id: "ct3", name: "Manuel Ortiz", role: "Gerente de Operaciones", company: "Laboratorio Clínico Central", email: "mortiz@labcentral.gt", phone: "+502 5567 1120", lastContact: "2026-07-22", status: "Activo" },
  { id: "ct4", name: "Sofía Reyes", role: "Directora Médica", company: "Centro de Diagnóstico Quetzal", email: "sreyes@quetzal.gt", phone: "+502 3321 4470", lastContact: "2026-07-15", status: "Inactivo" },
  { id: "ct5", name: "Pablo Estrada", role: "Odontólogo Titular", company: "Clínica Dental Sonrisas", email: "pestrada@sonrisas.gt", phone: "+502 4412 9987", lastContact: "2026-07-29", status: "Activo" },
  { id: "ct6", name: "Lucía Barrios", role: "Médica Veterinaria", company: "Veterinaria Fauna Sur", email: "lbarrios@faunasur.gt", phone: "+502 5589 3345", lastContact: "2026-07-10", status: "Activo" },
  { id: "ct7", name: "Jefa de Compras", role: "Jefa de Compras", company: "Hospital Privado del Valle", email: "compras@hpvalle.gt", phone: "+502 2244 5678", lastContact: "2026-08-01", status: "Activo" },
  { id: "ct8", name: "Coord. de Bioseguridad", role: "Coordinador de Bioseguridad", company: "Clínica San Rafael", email: "bioseguridad@sanrafael.gt", phone: "+502 2255 8899", lastContact: "2026-07-26", status: "Activo" },
];

const STAGES = ["Prospección", "Calificación", "Propuesta enviada", "Negociación", "Ganado", "Perdido"];
const STAGE_COLOR = {
  "Prospección": "var(--ink-faint)", "Calificación": "var(--primary)", "Propuesta enviada": "var(--amber)",
  "Negociación": "#7C5CFF", "Ganado": "var(--teal)", "Perdido": "#D65959",
};

let dealSeq = 1;
const mkDeal = (title, company, contact, value, stage, rep, days) => ({
  id: "d" + dealSeq++, title, company, contact, value, stage, rep,
  closeDate: new Date(Date.now() + days * 86400000).toISOString().slice(0, 10),
});

const INITIAL_DEALS = [
  mkDeal("Monitores de signos vitales x8", "Hospital Regional Altiplano", "Rodrigo Paz", 148000, "Negociación", "Ana López", 6),
  mkDeal("Camas hospitalarias eléctricas x12", "Hospital Privado del Valle", "Jefa de Compras", 222000, "Propuesta enviada", "María Fernanda Ruiz", 10),
  mkDeal("Autoclave de mesa 24L", "Clínica Vida Nueva", "Elena Sian", 24900, "Calificación", "Carlos Méndez", 14),
  mkDeal("Set instrumental quirúrgico x6", "Clínica San Rafael", "Coord. de Bioseguridad", 37200, "Prospección", "Diego Castillo", 21),
  mkDeal("Ecógrafo portátil Doppler color", "Centro de Diagnóstico Quetzal", "Sofía Reyes", 89000, "Propuesta enviada", "Diego Castillo", 9),
  mkDeal("Microscopios binoculares x4", "Laboratorio Clínico Central", "Manuel Ortiz", 15200, "Ganado", "María Fernanda Ruiz", -3),
  mkDeal("Sillas de ruedas ortopédicas x10", "Hospital Regional Altiplano", "Rodrigo Paz", 14500, "Ganado", "Ana López", -8),
  mkDeal("Ventilador de transporte", "Hospital Privado del Valle", "Jefa de Compras", 96000, "Negociación", "María Fernanda Ruiz", 4),
  mkDeal("Insumos descartables — pedido trimestral", "Clínica Dental Sonrisas", "Pablo Estrada", 8600, "Calificación", "Ana López", 12),
  mkDeal("Camillas de exploración x5", "Veterinaria Fauna Sur", "Lucía Barrios", 20500, "Prospección", "Carlos Méndez", 18),
  mkDeal("DEA para área pública", "Clínica Vida Nueva", "Elena Sian", 31000, "Perdido", "Carlos Méndez", -12),
  mkDeal("Bombas de infusión reacondicionadas x6", "Laboratorio Clínico Central", "Manuel Ortiz", 33600, "Propuesta enviada", "María Fernanda Ruiz", 7),
];

const LEADS = [
  { id: "l1", name: "Hospital San Marcos", contact: "Ing. Federico Ruano", source: "Sitio web", status: "Nuevo", date: "2026-08-01", rep: null },
  { id: "l2", name: "Clínica Bienestar Total", contact: "Dra. Ivonne Solís", source: "WhatsApp", status: "Contactado", date: "2026-07-31", rep: "Carlos Méndez" },
  { id: "l3", name: "Laboratorios del Norte", contact: "Lic. Herbert Castañeda", source: "Referido", status: "Calificado", date: "2026-07-29", rep: "María Fernanda Ruiz" },
  { id: "l4", name: "Consultorio Dr. Aguilar", contact: "Dr. José Aguilar", source: "Llamada entrante", status: "Nuevo", date: "2026-07-30", rep: null },
  { id: "l5", name: "Veterinaria Los Álamos", contact: "Dra. Karen Xitumul", source: "Feria / evento", status: "Descartado", date: "2026-07-20", rep: "Diego Castillo" },
  { id: "l6", name: "Clínica Odontológica Del Pilar", contact: "Dr. Marvin Chacón", source: "Sitio web", status: "Contactado", date: "2026-07-27", rep: "Ana López" },
  { id: "l7", name: "Centro Médico Familiar Sur", contact: "Lcda. Paola Miranda", source: "Referido", status: "Calificado", date: "2026-07-24", rep: "Ana López" },
  { id: "l8", name: "Hospital Municipal Cobán", contact: "Ing. Sergio Tzul", source: "Sitio web", status: "Nuevo", date: "2026-08-02", rep: null },
];

const INITIAL_QUOTES = [
  { id: "COT-2026-0141", company: "Hospital Regional Altiplano", contact: "Rodrigo Paz", items: 3, total: 148000, status: "Enviada", date: "2026-07-29", rep: "Ana López" },
  { id: "COT-2026-0142", company: "Hospital Privado del Valle", contact: "Jefa de Compras", items: 5, total: 222000, status: "Aprobada", date: "2026-07-24", rep: "María Fernanda Ruiz" },
  { id: "COT-2026-0143", company: "Clínica Vida Nueva", contact: "Elena Sian", items: 1, total: 24900, status: "Enviada", date: "2026-07-30", rep: "Carlos Méndez" },
  { id: "COT-2026-0144", company: "Laboratorio Clínico Central", contact: "Manuel Ortiz", items: 4, total: 15200, status: "Aprobada", date: "2026-07-18", rep: "María Fernanda Ruiz" },
  { id: "COT-2026-0145", company: "Clínica San Rafael", contact: "Coord. de Bioseguridad", items: 6, total: 37200, status: "Borrador", date: "2026-08-01", rep: "Diego Castillo" },
  { id: "COT-2026-0146", company: "Clínica Vida Nueva", contact: "Elena Sian", items: 1, total: 31000, status: "Rechazada", date: "2026-07-10", rep: "Carlos Méndez" },
  { id: "COT-2026-0147", company: "Centro de Diagnóstico Quetzal", contact: "Sofía Reyes", items: 1, total: 89000, status: "Vencida", date: "2026-06-15", rep: "Diego Castillo" },
  { id: "COT-2026-0148", company: "Clínica Dental Sonrisas", contact: "Pablo Estrada", items: 8, total: 8600, status: "Enviada", date: "2026-07-31", rep: "Ana López" },
];

let taskSeq = 1;
const mkTask = (title, type, company, due, priority, rep, done = false) => ({ id: "t" + taskSeq++, title, type, company, due, priority, rep, done });
const INITIAL_TASKS = [
  mkTask("Llamar para confirmar propuesta de camas hospitalarias", "Llamada", "Hospital Privado del Valle", "2026-08-02", "Alta", "María Fernanda Ruiz"),
  mkTask("Enviar ficha técnica del ecógrafo portátil", "Correo", "Centro de Diagnóstico Quetzal", "2026-08-02", "Media", "Diego Castillo"),
  mkTask("Reunión de seguimiento — pedido trimestral", "Reunión", "Clínica Dental Sonrisas", "2026-08-03", "Media", "Ana López"),
  mkTask("Dar seguimiento a lead: Hospital San Marcos", "Seguimiento", "Hospital San Marcos", "2026-08-02", "Alta", "Ana López"),
  mkTask("Confirmar fecha de instalación de autoclave", "Llamada", "Clínica Vida Nueva", "2026-08-04", "Baja", "Carlos Méndez"),
  mkTask("Preparar cotización — set instrumental quirúrgico", "Seguimiento", "Clínica San Rafael", "2026-08-05", "Media", "Diego Castillo"),
  mkTask("Llamar a lead calificado: Laboratorios del Norte", "Llamada", "Laboratorios del Norte", "2026-07-31", "Alta", "María Fernanda Ruiz", false),
  mkTask("Enviar recordatorio de cotización vencida", "Correo", "Centro de Diagnóstico Quetzal", "2026-07-30", "Media", "Diego Castillo", false),
  mkTask("Confirmar recepción de camillas", "Correo", "Veterinaria Fauna Sur", "2026-07-29", "Baja", "Carlos Méndez", true),
  mkTask("Renovar contacto — Hospital Regional Altiplano", "Seguimiento", "Hospital Regional Altiplano", "2026-08-06", "Baja", "Ana López"),
];

const SALES_MONTHLY = [
  { mes: "Mar", ventas: 312000 }, { mes: "Abr", ventas: 289000 }, { mes: "May", ventas: 355000 },
  { mes: "Jun", ventas: 298000 }, { mes: "Jul", ventas: 402000 }, { mes: "Ago*", ventas: 210000 },
];
const LEADS_BY_SOURCE = [
  { name: "Sitio web", value: 34, color: "#0057D9" }, { name: "WhatsApp", value: 21, color: "#00998A" },
  { name: "Referido", value: 26, color: "#C9600A" }, { name: "Llamada entrante", value: 12, color: "#7C5CFF" },
  { name: "Feria / evento", value: 7, color: "#D65959" },
];

/* =========================================================================
   HELPERS
   ========================================================================= */

const formatQ = (n) => `Q ${n.toLocaleString("es-GT")}`;
const formatDateShort = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-GT", { day: "2-digit", month: "short" });
const daysUntil = (iso) => Math.round((new Date(iso + "T00:00:00") - new Date(new Date().toISOString().slice(0, 10) + "T00:00:00")) / 86400000);

function useOutsideClose(ref, onClose) {
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

/* =========================================================================
   GLOBAL STYLES (same design system as the corporate site)
   ========================================================================= */

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

      .crm-root {
        --bg: #F4F7F9; --surface: #FFFFFF; --sidebar: #0B1B2B; --sidebar-ink: #C7D3DE; --sidebar-ink-active: #FFFFFF;
        --ink: #0B1B2B; --ink-soft: #55677A; --ink-faint: #8494A3; --line: #E2E8ED; --line-strong: #C9D3DB;
        --primary: #0057D9; --primary-soft: #E9F0FE; --teal: #00998A; --teal-soft: #E3F6F2;
        --amber: #C9600A; --amber-soft: #FCEEE1; --red: #D65959; --red-soft: #FBEAEA;
        --shadow: 0 1px 2px rgba(11,27,43,0.04), 0 8px 20px rgba(11,27,43,0.06);
        --shadow-lg: 0 4px 8px rgba(11,27,43,0.08), 0 24px 48px rgba(11,27,43,0.14);
        font-family: 'Inter', system-ui, sans-serif; color: var(--ink); background: var(--bg); min-height: 100vh;
      }
      .crm-root.crm-dark {
        --bg: #08131F; --surface: #0F2135; --sidebar: #060D16; --sidebar-ink: #7C8FA1; --sidebar-ink-active: #FFFFFF;
        --ink: #E9F1F8; --ink-soft: #9FB2C4; --ink-faint: #6E8397; --line: #1D3245; --line-strong: #294763;
        --primary: #4C90FF; --primary-soft: #142E4C; --teal: #35D6BF; --teal-soft: #0E2D2A;
        --amber: #FFA35C; --amber-soft: #2E2013; --red: #FF7A7A; --red-soft: #331A1A;
        --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.35);
        --shadow-lg: 0 4px 8px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.55);
      }
      .crm-root * { box-sizing: border-box; }
      .crm-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.01em; }
      .crm-mono { font-family: 'IBM Plex Mono', monospace; }
      .crm-ink { color: var(--ink); } .crm-ink-soft { color: var(--ink-soft); } .crm-ink-faint { color: var(--ink-faint); }
      .crm-primary { color: var(--primary); }
      .crm-surface { background: var(--surface); }
      .crm-border { border: 1px solid var(--line); } .crm-border-t { border-top: 1px solid var(--line); } .crm-border-b { border-bottom: 1px solid var(--line); }
      .crm-shadow { box-shadow: var(--shadow); } .crm-shadow-lg { box-shadow: var(--shadow-lg); }
      .crm-card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; }
      .crm-focus:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

      .crm-btn { font-weight: 600; border-radius: 9px; cursor: pointer; transition: all .15s ease; white-space: nowrap; }
      .crm-btn-primary { background: var(--primary); color: #fff; border: 1px solid var(--primary); }
      .crm-btn-primary:hover { filter: brightness(1.08); }
      .crm-btn-outline { background: transparent; color: var(--ink); border: 1px solid var(--line-strong); }
      .crm-btn-outline:hover { border-color: var(--primary); color: var(--primary); }
      .crm-btn-ghost { background: transparent; color: var(--ink-soft); border: 1px solid transparent; }
      .crm-btn-ghost:hover { background: var(--bg); color: var(--ink); }
      .crm-icon-btn { background: var(--surface); border: 1px solid var(--line); border-radius: 9px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
      .crm-icon-btn:hover { border-color: var(--primary); color: var(--primary); }

      .crm-input { background: var(--surface); border: 1px solid var(--line-strong); border-radius: 9px; color: var(--ink); outline: none; font-family: 'Inter', sans-serif; transition: border-color .15s, box-shadow .15s; }
      .crm-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
      .crm-input::placeholder { color: var(--ink-faint); }

      .crm-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
      .crm-table-row:hover { background: var(--bg); }
      .crm-scrollbar-none::-webkit-scrollbar { display: none; } .crm-scrollbar-none { scrollbar-width: none; }
      .crm-fade { animation: crmFade .35s ease both; }
      @keyframes crmFade { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: none; } }
      @media (prefers-reduced-motion: reduce) { .crm-fade { animation: none; } }

      .crm-sidebar-link { display: flex; align-items: center; gap: 11px; padding: 9px 12px; border-radius: 9px; color: var(--sidebar-ink); font-size: 13.5px; font-weight: 500; cursor: pointer; transition: all .15s; border: none; background: none; width: 100%; text-align: left; }
      .crm-sidebar-link:hover { background: rgba(255,255,255,0.06); color: var(--sidebar-ink-active); }
      .crm-sidebar-link.active { background: var(--primary); color: #fff; }

      .crm-kanban-col::-webkit-scrollbar { width: 6px; } .crm-kanban-col::-webkit-scrollbar-thumb { background: var(--line-strong); border-radius: 4px; }
      .crm-drag-over { background: var(--primary-soft) !important; border-color: var(--primary) !important; }
      .crm-deal-card { cursor: grab; transition: box-shadow .15s, transform .15s; }
      .crm-deal-card:active { cursor: grabbing; }
      .crm-deal-card.dragging { opacity: .4; }
      .crm-line-clamp { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      .crm-label { font-size: 12px; font-weight: 600; color: var(--ink-soft); margin-bottom: 6px; display: block; }
      .crm-field { margin-bottom: 14px; }
    `}</style>
  );
}

/* =========================================================================
   SMALL PIECES
   ========================================================================= */

function Avatar({ name, size = 26 }) {
  const color = REP_COLORS[name] || "#55677A";
  return (
    <div className="crm-mono" style={{ width: size, height: size, borderRadius: "50%", background: color, color: "#fff", fontSize: size * 0.4, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {initials(name)}
    </div>
  );
}

function StatusBadge({ status, map }) {
  const c = map[status] || { bg: "var(--bg)", fg: "var(--ink-faint)" };
  return <span className="crm-badge" style={{ background: c.bg, color: c.fg }}>{status}</span>;
}

const LEAD_STATUS_MAP = {
  "Nuevo": { bg: "var(--primary-soft)", fg: "var(--primary)" }, "Contactado": { bg: "var(--amber-soft)", fg: "var(--amber)" },
  "Calificado": { bg: "var(--teal-soft)", fg: "var(--teal)" }, "Descartado": { bg: "var(--red-soft)", fg: "var(--red)" },
};
const QUOTE_STATUS_MAP = {
  "Borrador": { bg: "var(--bg)", fg: "var(--ink-faint)" }, "Enviada": { bg: "var(--primary-soft)", fg: "var(--primary)" },
  "Aprobada": { bg: "var(--teal-soft)", fg: "var(--teal)" }, "Rechazada": { bg: "var(--red-soft)", fg: "var(--red)" },
  "Vencida": { bg: "var(--amber-soft)", fg: "var(--amber)" },
};
const PRIORITY_MAP = {
  "Alta": { bg: "var(--red-soft)", fg: "var(--red)" }, "Media": { bg: "var(--amber-soft)", fg: "var(--amber)" }, "Baja": { bg: "var(--teal-soft)", fg: "var(--teal)" },
};

function KpiCard({ label, value, delta, positive, icon: Icon, accent }) {
  return (
    <div className="crm-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span className="crm-ink-faint crm-mono" style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: accent + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div className="crm-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{value}</div>
      {delta && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: positive ? "var(--teal)" : "var(--red)" }}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {delta}
        </div>
      )}
    </div>
  );
}

function ViewHeader({ title, desc, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 className="crm-display" style={{ fontSize: 23, fontWeight: 700, marginBottom: 4 }}>{title}</h1>
        {desc && <p className="crm-ink-soft" style={{ fontSize: 13.5 }}>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

/* =========================================================================
   SIDEBAR + TOPBAR
   ========================================================================= */

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: UserPlus },
  { id: "pipeline", label: "Pipeline", icon: Columns3 },
  { id: "empresas", label: "Empresas", icon: Building2 },
  { id: "contactos", label: "Contactos", icon: Users },
  { id: "cotizaciones", label: "Cotizaciones", icon: FileText },
  { id: "tareas", label: "Tareas", icon: CheckSquare },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
];

function Sidebar({ view, setView, mobileOpen, setMobileOpen, role, setRole }) {
  const visibleNav = NAV.filter((n) => !(role === "Ventas" && n.id === "reportes"));
  return (
    <>
      <aside className="crm-scrollbar-none" style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 232, background: "var(--sidebar)", padding: "20px 14px",
        display: "flex", flexDirection: "column", zIndex: 50, transform: mobileOpen ? "none" : undefined, overflowY: "auto",
      }} id="crm-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 26 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, var(--primary), var(--teal))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Target size={15} color="#fff" strokeWidth={2.25} />
          </div>
          <div>
            <div className="crm-display" style={{ color: "#fff", fontSize: 15, fontWeight: 700, lineHeight: 1 }}>INTERMEDIC</div>
            <div style={{ color: "var(--sidebar-ink)", fontSize: 10.5, marginTop: 2 }}>CRM</div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="crm-focus" style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--sidebar-ink)", cursor: "pointer", display: "none" }} id="crm-sidebar-close"><X size={16} /></button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {visibleNav.map((n) => (
            <button key={n.id} onClick={() => { setView(n.id); setMobileOpen(false); }} className={`crm-sidebar-link crm-focus ${view === n.id ? "active" : ""}`}>
              <n.icon size={16} /> {n.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14, marginTop: 14 }}>
          <div style={{ padding: "0 8px", marginBottom: 10 }}>
            <div style={{ color: "var(--sidebar-ink)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Rol activo</div>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="crm-focus" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 12.5, padding: "7px 8px" }}>
              <option>Administrador</option><option>Gerente</option><option>Ventas</option>
            </select>
            {role === "Ventas" && <div style={{ color: "var(--sidebar-ink)", fontSize: 10.5, marginTop: 6, lineHeight: 1.4 }}>Solo ve sus propios leads, negocios y tareas.</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px" }}>
            <Avatar name="Ana López" size={28} />
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Ana López</div>
              <div style={{ color: "var(--sidebar-ink)", fontSize: 11 }}>Ejecutiva de ventas</div>
            </div>
            <LogOut size={14} style={{ color: "var(--sidebar-ink)", marginLeft: "auto", flexShrink: 0 }} />
          </div>
        </div>
      </aside>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 45, display: "none" }} id="crm-sidebar-backdrop" />}
      <style>{`
        @media (max-width: 900px) {
          #crm-sidebar { transform: translateX(${mobileOpen ? "0" : "-100%"}); transition: transform .25s ease; }
          #crm-sidebar-close { display: flex !important; }
          #crm-sidebar-backdrop { display: block !important; }
        }
      `}</style>
    </>
  );
}

function GlobalSearch({ companies, contacts, leads, quotes, onGoto }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    const out = [];
    companies.forEach((c) => c.name.toLowerCase().includes(s) && out.push({ kind: "Empresa", label: c.name, sub: c.sector, go: () => onGoto("empresas") }));
    contacts.forEach((c) => (c.name.toLowerCase().includes(s) || c.company.toLowerCase().includes(s)) && out.push({ kind: "Contacto", label: c.name, sub: c.company, go: () => onGoto("contactos", c) }));
    leads.forEach((l) => l.name.toLowerCase().includes(s) && out.push({ kind: "Lead", label: l.name, sub: l.status, go: () => onGoto("leads") }));
    quotes.forEach((qt) => (qt.id.toLowerCase().includes(s) || qt.company.toLowerCase().includes(s)) && out.push({ kind: "Cotización", label: qt.id, sub: qt.company, go: () => onGoto("cotizaciones") }));
    return out.slice(0, 8);
  }, [q, companies, contacts, leads, quotes]);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, maxWidth: 380 }}>
      <Search size={15} className="crm-ink-faint" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Buscar leads, empresas, contactos, cotizaciones…" className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px 9px 34px", fontSize: 13.5 }} />
      {open && q.trim() && (
        <div className="crm-surface crm-border crm-shadow-lg crm-scrollbar-none" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, borderRadius: 10, padding: 6, zIndex: 60, maxHeight: 320, overflowY: "auto" }}>
          {results.length === 0 ? <div className="crm-ink-faint" style={{ padding: 10, fontSize: 12.5 }}>Sin resultados para "{q}"</div> : results.map((r, i) => (
            <button key={i} onClick={() => { r.go(); setOpen(false); setQ(""); }} className="crm-focus" style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "9px 10px", background: "none", border: "none", borderRadius: 7, cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
              <span style={{ fontSize: 13 }}>{r.label} <span className="crm-ink-faint" style={{ fontSize: 11.5 }}>· {r.sub}</span></span>
              <span className="crm-mono crm-ink-faint" style={{ fontSize: 10.5 }}>{r.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Topbar({ dark, setDark, setMobileOpen, openModal, companies, contacts, leads, quotes, onGoto }) {
  const [addOpen, setAddOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setAddOpen(false));
  return (
    <div className="crm-border-b crm-surface" style={{ position: "sticky", top: 0, zIndex: 30, height: 64, display: "flex", alignItems: "center", gap: 14, padding: "0 22px" }}>
      <button onClick={() => setMobileOpen(true)} className="crm-icon-btn crm-focus" style={{ width: 34, height: 34, display: "none" }} id="crm-menu-btn" aria-label="Abrir menú"><Menu size={16} /></button>
      <GlobalSearch companies={companies} contacts={contacts} leads={leads} quotes={quotes} onGoto={onGoto} />
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setDark(!dark)} className="crm-icon-btn crm-focus" style={{ width: 34, height: 34 }} aria-label="Tema">{dark ? <Sun size={15} /> : <Moon size={15} />}</button>
        <button className="crm-icon-btn crm-focus" style={{ width: 34, height: 34, position: "relative" }} aria-label="Notificaciones">
          <Bell size={15} />
          <span style={{ position: "absolute", top: 6, right: 7, width: 6, height: 6, borderRadius: "50%", background: "var(--red)" }} />
        </button>
        <div ref={ref} style={{ position: "relative" }}>
          <button onClick={() => setAddOpen(!addOpen)} className="crm-btn crm-btn-primary crm-focus" style={{ padding: "9px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={15} /> Nuevo <ChevronDown size={13} />
          </button>
          {addOpen && (
            <div className="crm-surface crm-border crm-shadow-lg" style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", borderRadius: 10, padding: 6, width: 180, zIndex: 40 }}>
              {[["Lead", "lead"], ["Empresa", "company"], ["Contacto", "contact"], ["Cotización", "quote"], ["Tarea", "task"]].map(([label, key]) => (
                <button key={key} onClick={() => { setAddOpen(false); openModal(key); }} className="crm-focus" style={{ width: "100%", textAlign: "left", padding: "8px 10px", background: "none", border: "none", borderRadius: 7, fontSize: 13, cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>{label}</button>
              ))}
            </div>
          )}
        </div>
        <Avatar name="Ana López" size={32} />
      </div>
      <style>{`@media (max-width: 900px) { #crm-menu-btn { display: flex !important; } }`}</style>
    </div>
  );
}

/* =========================================================================
   DASHBOARD
   ========================================================================= */

function Funnel({ deals }) {
  const totals = STAGES.slice(0, 4).map((s) => ({ stage: s, count: deals.filter((d) => d.stage === s).length }));
  const max = Math.max(...totals.map((t) => t.count), 1);
  return (
    <div className="crm-card" style={{ padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Embudo de ventas</div>
      <div className="crm-ink-faint" style={{ fontSize: 12, marginBottom: 18 }}>Negocios activos por etapa</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {totals.map((t) => (
          <div key={t.stage}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
              <span className="crm-ink-soft">{t.stage}</span><span className="crm-mono" style={{ fontWeight: 600 }}>{t.count}</span>
            </div>
            <div style={{ height: 8, borderRadius: 6, background: "var(--bg)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(t.count / max) * 100}%`, background: STAGE_COLOR[t.stage], borderRadius: 6, transition: "width .4s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ tasks, deals, leads, quotes, reps, setView }) {
  const won = deals.filter((d) => d.stage === "Ganado");
  const wonTotal = won.reduce((s, d) => s + d.value, 0);
  const openDeals = deals.filter((d) => d.stage !== "Ganado" && d.stage !== "Perdido");
  const pipelineValue = openDeals.reduce((s, d) => s + d.value, 0);
  const newLeads = leads.filter((l) => l.status === "Nuevo").length;
  const pendingQuotes = quotes.filter((q) => q.status === "Enviada").length;
  const dueToday = tasks.filter((t) => !t.done && daysUntil(t.due) <= 0);

  const repTotals = reps.map((r) => ({ rep: r, total: deals.filter((d) => d.rep === r && d.stage === "Ganado").reduce((s, d) => s + d.value, 0) })).sort((a, b) => b.total - a.total);

  return (
    <div className="crm-fade">
      <ViewHeader title="Dashboard" desc="Resumen general de ventas, leads y actividad — en tiempo real." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }} className="crm-kpi-grid">
        <KpiCard label="Ventas cerradas (mes)" value={formatQ(wonTotal)} delta="+18% vs. julio" positive icon={DollarSign} accent="#00998A" />
        <KpiCard label="Valor en pipeline" value={formatQ(pipelineValue)} delta={`${openDeals.length} negocios abiertos`} positive icon={TrendingUp} accent="#0057D9" />
        <KpiCard label="Leads nuevos" value={newLeads} delta="Últimos 7 días" positive icon={UserPlus} accent="#C9600A" />
        <KpiCard label="Cotizaciones pendientes" value={pendingQuotes} delta="Requieren seguimiento" icon={FileText} accent="#D65959" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }} className="crm-dash-grid">
        <div className="crm-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Ventas mensuales</div>
          <div className="crm-ink-faint" style={{ fontSize: 12, marginBottom: 10 }}>Últimos 6 meses (Q)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SALES_MONTHLY} margin={{ left: -18, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--ink-faint)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => formatQ(v)} contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }} />
              <Bar dataKey="ventas" fill="#0057D9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Funnel deals={deals} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="crm-dash-grid2">
        <div className="crm-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Tareas de hoy</div>
            <button onClick={() => setView("tareas")} className="crm-primary" style={{ fontSize: 12.5, background: "none", border: "none", cursor: "pointer" }}>Ver todas</button>
          </div>
          {dueToday.length === 0 ? <div className="crm-ink-faint" style={{ fontSize: 13 }}>No hay tareas pendientes para hoy.</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dueToday.slice(0, 5).map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="crm-badge" style={{ background: PRIORITY_MAP[t.priority].bg, color: PRIORITY_MAP[t.priority].fg }}>{t.priority}</span>
                  <span style={{ fontSize: 13, flex: 1 }} className="crm-line-clamp">{t.title}</span>
                  <Avatar name={t.rep} size={22} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="crm-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Ranking de vendedores (ganado)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {repTotals.map((r, i) => (
              <div key={r.rep} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="crm-mono crm-ink-faint" style={{ fontSize: 12, width: 14 }}>{i + 1}</span>
                <Avatar name={r.rep} size={24} />
                <span style={{ fontSize: 13, flex: 1 }}>{r.rep}</span>
                <span className="crm-mono" style={{ fontSize: 13, fontWeight: 600 }}>{formatQ(r.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1100px) { .crm-kpi-grid { grid-template-columns: repeat(2,1fr) !important; } .crm-dash-grid { grid-template-columns: 1fr !important; } .crm-dash-grid2 { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px) { .crm-kpi-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

/* =========================================================================
   LEADS
   ========================================================================= */

function LeadsView({ leads, setLeads, onNew, onConvert }) {
  const [filter, setFilter] = useState("Todos");
  const tabs = ["Todos", "Nuevo", "Contactado", "Calificado", "Descartado"];
  const filtered = filter === "Todos" ? leads : leads.filter((l) => l.status === filter);

  const assign = (id, rep) => setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, rep, status: l.status === "Nuevo" ? "Contactado" : l.status } : l)));
  const setStatus = (id, status) => setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));

  return (
    <div className="crm-fade">
      <ViewHeader title="Leads" desc="Prospectos captados desde el sitio web, WhatsApp, referidos y más."
        action={<button onClick={onNew} className="crm-btn crm-btn-primary crm-focus" style={{ padding: "10px 16px", fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Nuevo lead</button>} />

      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setFilter(t)} className="crm-focus" style={{
            padding: "7px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            border: "1px solid " + (filter === t ? "var(--primary)" : "var(--line)"), background: filter === t ? "var(--primary-soft)" : "var(--surface)", color: filter === t ? "var(--primary)" : "var(--ink-soft)",
          }}>{t} {t !== "Todos" && <span className="crm-mono">({leads.filter((l) => l.status === t).length})</span>}</button>
        ))}
      </div>

      <div className="crm-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
          <thead><tr className="crm-border-b crm-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".03em" }}>
            {["Empresa / lead", "Contacto", "Origen", "Fecha", "Estado", "Vendedor", ""].map((h) => <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="crm-table-row crm-border-b" style={{ transition: "background .1s" }}>
                <td style={{ padding: "12px 16px", fontSize: 13.5, fontWeight: 600 }}>{l.name}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }} className="crm-ink-soft">{l.contact}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }} className="crm-ink-soft">{l.source}</td>
                <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="crm-mono crm-ink-faint">{formatDateShort(l.date)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value)} disabled={l.converted} className="crm-focus" style={{ border: "none", background: LEAD_STATUS_MAP[l.status].bg, color: LEAD_STATUS_MAP[l.status].fg, fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "4px 10px", cursor: l.converted ? "default" : "pointer" }}>
                    {["Nuevo", "Contactado", "Calificado", "Descartado"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <select value={l.rep || ""} onChange={(e) => assign(l.id, e.target.value)} className="crm-input crm-focus" style={{ fontSize: 12.5, padding: "5px 8px" }}>
                    <option value="">Sin asignar</option>
                    {REPS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <button onClick={() => onConvert(l)} className="crm-btn crm-btn-outline crm-focus" style={{ padding: "6px 12px", fontSize: 12 }} disabled={l.status === "Descartado" || l.converted}>
                    {l.converted ? "Convertido ✓" : "Convertir"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   PIPELINE (KANBAN)
   ========================================================================= */

function DealCard({ deal, onDragStart, dragging, onOpen }) {
  const d = daysUntil(deal.closeDate);
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onClick={() => onOpen(deal)}
      className={`crm-card crm-deal-card ${dragging ? "dragging" : ""}`}
      style={{ padding: 13, marginBottom: 10 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>{deal.title}</span>
        <GripVertical size={13} className="crm-ink-faint" style={{ flexShrink: 0, marginTop: 2 }} />
      </div>
      <div className="crm-ink-faint" style={{ fontSize: 11.5, marginBottom: 10 }}>{deal.company}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="crm-mono" style={{ fontSize: 13, fontWeight: 700 }}>{formatQ(deal.value)}</span>
        <Avatar name={deal.rep} size={22} />
      </div>
      {deal.stage !== "Ganado" && deal.stage !== "Perdido" && (
        <div className="crm-ink-faint" style={{ fontSize: 10.5, marginTop: 6 }}>{d >= 0 ? `Cierra en ${d} días` : `Vencido hace ${-d} días`}</div>
      )}
    </div>
  );
}

function PipelineView({ deals, setDeals, onOpenDeal }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overStage, setOverStage] = useState(null);

  const onDrop = (stage) => {
    if (draggingId) setDeals((ds) => ds.map((d) => (d.id === draggingId ? { ...d, stage } : d)));
    setDraggingId(null); setOverStage(null);
  };

  return (
    <div className="crm-fade">
      <ViewHeader title="Pipeline" desc="Arrastre las tarjetas para mover un negocio de etapa." />
      <div className="crm-scrollbar-none" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
        {STAGES.map((stage) => {
          const items = deals.filter((d) => d.stage === stage);
          const total = items.reduce((s, d) => s + d.value, 0);
          return (
            <div
              key={stage}
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
              onDragLeave={() => setOverStage(null)}
              onDrop={() => onDrop(stage)}
              className={`crm-kanban-col ${overStage === stage ? "crm-drag-over" : ""}`}
              style={{ minWidth: 250, width: 250, flexShrink: 0, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 14, padding: 12, maxHeight: "calc(100vh - 210px)", overflowY: "auto" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, position: "sticky", top: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: STAGE_COLOR[stage] }} />
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{stage}</span>
                <span className="crm-mono crm-ink-faint" style={{ fontSize: 11, marginLeft: "auto" }}>{items.length}</span>
              </div>
              <div className="crm-mono crm-ink-faint" style={{ fontSize: 11, marginBottom: 12 }}>{formatQ(total)}</div>
              {items.map((deal) => (
                <DealCard key={deal.id} deal={deal} dragging={draggingId === deal.id} onOpen={onOpenDeal}
                  onDragStart={(e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = "move"; }} />
              ))}
              {items.length === 0 && <div className="crm-ink-faint" style={{ fontSize: 12, textAlign: "center", padding: "20px 0" }}>Sin negocios</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DealDetail({ deal, onClose }) {
  if (!deal) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.5)" }} />
      <div className="crm-surface crm-shadow-lg crm-fade" style={{ position: "relative", width: "min(460px,100%)", borderRadius: 16, padding: 26 }}>
        <button onClick={onClose} className="crm-icon-btn crm-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }}><X size={14} /></button>
        <span className="crm-badge" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>{deal.stage}</span>
        <h3 className="crm-display" style={{ fontSize: 19, fontWeight: 700, margin: "12px 0 4px" }}>{deal.title}</h3>
        <div className="crm-ink-soft" style={{ fontSize: 13, marginBottom: 18 }}>{deal.company} · {deal.contact}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
          <div><div className="crm-ink-faint" style={{ fontSize: 11.5 }}>Valor</div><div className="crm-mono" style={{ fontSize: 16, fontWeight: 700 }}>{formatQ(deal.value)}</div></div>
          <div><div className="crm-ink-faint" style={{ fontSize: 11.5 }}>Cierre estimado</div><div style={{ fontSize: 14, fontWeight: 600 }}>{formatDateShort(deal.closeDate)}</div></div>
          <div><div className="crm-ink-faint" style={{ fontSize: 11.5 }}>Vendedor</div><div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}><Avatar name={deal.rep} size={20} /><span style={{ fontSize: 13 }}>{deal.rep}</span></div></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="crm-btn crm-btn-primary crm-focus" style={{ flex: 1, padding: 11, fontSize: 13.5 }}>Crear cotización</button>
          <button className="crm-btn crm-btn-outline crm-focus" style={{ padding: "11px 16px", fontSize: 13.5 }}>Añadir nota</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   EMPRESAS
   ========================================================================= */

function CompaniesView({ companies, deals, onNew, onOpen }) {
  return (
    <div className="crm-fade">
      <ViewHeader title="Empresas" desc="Instituciones y clientes con los que trabaja Intermedic."
        action={<button onClick={onNew} className="crm-btn crm-btn-primary crm-focus" style={{ padding: "10px 16px", fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Nueva empresa</button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }} className="crm-comp-grid">
        {companies.map((c) => {
          const companyDeals = deals.filter((d) => d.company === c.name);
          const openValue = companyDeals.filter((d) => d.stage !== "Ganado" && d.stage !== "Perdido").reduce((s, d) => s + d.value, 0);
          return (
            <div key={c.id} onClick={() => onOpen && onOpen(c)} className="crm-card" style={{ padding: 18, cursor: onOpen ? "pointer" : "default" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={17} className="crm-primary" /></div>
                <span className="crm-badge" style={{ background: "var(--bg)", color: "var(--ink-soft)" }}>{c.sector}</span>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
              <div className="crm-ink-faint" style={{ fontSize: 12, marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {c.city || "—"}</div>
              <div className="crm-border-t" style={{ paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                <span className="crm-ink-soft">{c.contacts} contacto{c.contacts !== 1 ? "s" : ""}</span>
                <span className="crm-mono" style={{ fontWeight: 600 }}>{formatQ(openValue)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}><Avatar name={c.rep} size={20} /><span className="crm-ink-faint" style={{ fontSize: 12 }}>{c.rep}</span></div>
            </div>
          );
        })}
      </div>
      <style>{`@media (max-width: 900px) { .crm-comp-grid { grid-template-columns: repeat(2,1fr) !important; } } @media (max-width: 560px) { .crm-comp-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function CompanyDetail({ company, deals, contacts, onClose }) {
  if (!company) return null;
  const companyDeals = deals.filter((d) => d.company === company.name);
  const companyContacts = contacts.filter((c) => c.company === company.name);
  const openValue = companyDeals.filter((d) => d.stage !== "Ganado" && d.stage !== "Perdido").reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.5)" }} />
      <div className="crm-surface crm-shadow-lg crm-scrollbar-none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(460px,100%)", overflowY: "auto", padding: 26 }}>
        <button onClick={onClose} className="crm-icon-btn crm-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }}><X size={14} /></button>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Building2 size={21} className="crm-primary" /></div>
        <h3 className="crm-display" style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>{company.name}</h3>
        <div className="crm-ink-soft" style={{ fontSize: 13, marginBottom: 10 }}>{company.sector} · {company.city || "—"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}><Avatar name={company.rep} size={22} /><span style={{ fontSize: 13 }}>{company.rep}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
          <div className="crm-card" style={{ padding: 14 }}><div className="crm-ink-faint" style={{ fontSize: 11.5 }}>Valor en pipeline</div><div className="crm-mono" style={{ fontSize: 16, fontWeight: 700 }}>{formatQ(openValue)}</div></div>
          <div className="crm-card" style={{ padding: 14 }}><div className="crm-ink-faint" style={{ fontSize: 11.5 }}>Negocios</div><div className="crm-mono" style={{ fontSize: 16, fontWeight: 700 }}>{companyDeals.length}</div></div>
        </div>

        <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>Contactos ({companyContacts.length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          {companyContacts.length === 0 && <div className="crm-ink-faint" style={{ fontSize: 13 }}>Sin contactos registrados.</div>}
          {companyContacts.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={c.name} size={26} />
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div><div className="crm-ink-faint" style={{ fontSize: 11.5 }}>{c.role}</div></div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>Negocios</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {companyDeals.length === 0 && <div className="crm-ink-faint" style={{ fontSize: 13 }}>Sin negocios registrados.</div>}
          {companyDeals.map((d) => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
              <span className="crm-line-clamp" style={{ maxWidth: 240 }}>{d.title}</span>
              <span className="crm-badge" style={{ background: "var(--bg)", color: STAGE_COLOR[d.stage] }}>{d.stage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   CONTACTOS
   ========================================================================= */

function ContactDetail({ contact, onClose }) {
  const [tab, setTab] = useState("historial");
  const [note, setNote] = useState("");
  const [log, setLog] = useState([
    { type: "Llamada", text: "Se confirmó interés en propuesta de equipo hospitalario.", date: "2026-07-28", rep: "Ana López" },
    { type: "Correo", text: "Se envió ficha técnica solicitada.", date: "2026-07-24", rep: "Ana López" },
    { type: "Nota", text: "Prefiere comunicación por correo antes de las 3pm.", date: "2026-07-20", rep: "Ana López" },
  ]);
  if (!contact) return null;
  const addNote = () => { if (!note.trim()) return; setLog([{ type: "Nota", text: note, date: new Date().toISOString().slice(0, 10), rep: "Ana López" }, ...log]); setNote(""); };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.5)" }} />
      <div className="crm-surface crm-shadow-lg crm-scrollbar-none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(480px,100%)", overflowY: "auto", padding: 26 }}>
        <button onClick={onClose} className="crm-icon-btn crm-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }}><X size={14} /></button>
        <Avatar name={contact.name} size={52} />
        <h3 className="crm-display" style={{ fontSize: 19, fontWeight: 700, margin: "14px 0 2px" }}>{contact.name}</h3>
        <div className="crm-ink-soft" style={{ fontSize: 13, marginBottom: 4 }}>{contact.role} · {contact.company}</div>
        <StatusBadge status={contact.status} map={{ Activo: { bg: "var(--teal-soft)", fg: "var(--teal)" }, Inactivo: { bg: "var(--bg)", fg: "var(--ink-faint)" } }} />

        <div style={{ display: "flex", gap: 10, margin: "18px 0" }}>
          <a href={`mailto:${contact.email}`} className="crm-btn crm-btn-outline crm-focus" style={{ flex: 1, padding: 10, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none" }}><Mail size={14} /> Correo</a>
          <a href={`tel:${contact.phone}`} className="crm-btn crm-btn-outline crm-focus" style={{ flex: 1, padding: 10, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none" }}><Phone size={14} /> Llamar</a>
        </div>

        <div className="crm-border-b" style={{ display: "flex", gap: 18, marginBottom: 16 }}>
          {[["historial", "Historial"], ["info", "Información"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="crm-focus" style={{ background: "none", border: "none", padding: "0 0 10px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: tab === k ? "var(--primary)" : "var(--ink-faint)", borderBottom: tab === k ? "2px solid var(--primary)" : "2px solid transparent" }}>{l}</button>
          ))}
        </div>

        {tab === "info" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["Correo", contact.email], ["Teléfono", contact.phone], ["Empresa", contact.company], ["Último contacto", formatDateShort(contact.lastContact)]].map(([k, v]) => (
              <div key={k} className="crm-border-b" style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, fontSize: 13 }}><span className="crm-ink-faint">{k}</span><span style={{ fontWeight: 500 }}>{v}</span></div>
            ))}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Añadir una nota…" className="crm-input crm-focus" style={{ flex: 1, padding: "9px 12px", fontSize: 13 }} onKeyDown={(e) => e.key === "Enter" && addNote()} />
              <button onClick={addNote} className="crm-btn crm-btn-primary crm-focus" style={{ padding: "0 14px" }}><Send size={14} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {log.map((l, i) => {
                const Icon = { Llamada: Phone, Correo: Mail, Nota: StickyNote, Reunión: Users }[l.type] || History;
                return (
                  <div key={i} style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={13} className="crm-ink-soft" /></div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>{l.type} · <span className="crm-ink-faint" style={{ fontWeight: 400 }}>{formatDateShort(l.date)}</span></div>
                      <div className="crm-ink-soft" style={{ fontSize: 13, lineHeight: 1.5 }}>{l.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ContactsView({ contacts, onOpen, onNew }) {
  return (
    <div className="crm-fade">
      <ViewHeader title="Contactos" desc="Personas de contacto en cada empresa cliente."
        action={<button onClick={onNew} className="crm-btn crm-btn-primary crm-focus" style={{ padding: "10px 16px", fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Nuevo contacto</button>} />
      <div className="crm-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
          <thead><tr className="crm-border-b crm-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase" }}>
            {["Contacto", "Empresa", "Correo", "Último contacto", "Estado", ""].map((h) => <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} onClick={() => onOpen(c)} className="crm-table-row crm-border-b" style={{ cursor: "pointer" }}>
                <td style={{ padding: "12px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={c.name} size={26} /><div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</div><div className="crm-ink-faint" style={{ fontSize: 11.5 }}>{c.role}</div></div></div></td>
                <td style={{ padding: "12px 16px", fontSize: 13 }} className="crm-ink-soft">{c.company}</td>
                <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="crm-mono crm-ink-faint">{c.email}</td>
                <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="crm-mono crm-ink-faint">{formatDateShort(c.lastContact)}</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={c.status} map={{ Activo: { bg: "var(--teal-soft)", fg: "var(--teal)" }, Inactivo: { bg: "var(--bg)", fg: "var(--ink-faint)" } }} /></td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}><MoreHorizontal size={16} className="crm-ink-faint" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   COTIZACIONES
   ========================================================================= */

function QuotesView({ quotes, onNew }) {
  const [statusFilter, setStatusFilter] = useState("Todas");
  const tabs = ["Todas", "Borrador", "Enviada", "Aprobada", "Rechazada", "Vencida"];
  const filtered = statusFilter === "Todas" ? quotes : quotes.filter((q) => q.status === statusFilter);
  const total = filtered.reduce((s, q) => s + q.total, 0);
  return (
    <div className="crm-fade">
      <ViewHeader title="Cotizaciones" desc="Propuestas enviadas a clientes y su estado actual."
        action={<button onClick={onNew} className="crm-btn crm-btn-primary crm-focus" style={{ padding: "10px 16px", fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Nueva cotización</button>} />

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setStatusFilter(t)} className="crm-focus" style={{ padding: "7px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: "1px solid " + (statusFilter === t ? "var(--primary)" : "var(--line)"), background: statusFilter === t ? "var(--primary-soft)" : "var(--surface)", color: statusFilter === t ? "var(--primary)" : "var(--ink-soft)" }}>{t}</button>
        ))}
      </div>

      <div className="crm-card" style={{ overflowX: "auto", marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead><tr className="crm-border-b crm-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase" }}>
            {["No. Cotización", "Empresa", "Ítems", "Total", "Estado", "Fecha", "Vendedor"].map((h) => <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q.id} className="crm-table-row crm-border-b" style={{ cursor: "pointer" }}>
                <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="crm-mono">{q.id}</td>
                <td style={{ padding: "12px 16px", fontSize: 13.5, fontWeight: 500 }}>{q.company}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }} className="crm-ink-soft">{q.items}</td>
                <td style={{ padding: "12px 16px", fontSize: 13.5, fontWeight: 700 }} className="crm-mono">{formatQ(q.total)}</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={q.status} map={QUOTE_STATUS_MAP} /></td>
                <td style={{ padding: "12px 16px", fontSize: 12.5 }} className="crm-mono crm-ink-faint">{formatDateShort(q.date)}</td>
                <td style={{ padding: "12px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar name={q.rep} size={20} /><span className="crm-ink-soft" style={{ fontSize: 12.5 }}>{q.rep}</span></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: "right", fontSize: 13 }} className="crm-ink-soft">Total mostrado: <span className="crm-mono crm-ink" style={{ fontWeight: 700 }}>{formatQ(total)}</span></div>
    </div>
  );
}

/* =========================================================================
   TAREAS
   ========================================================================= */

function WeeklyAgenda({ tasks }) {
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
  const dayLabel = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("es-GT", { weekday: "short", day: "2-digit" });
  return (
    <div className="crm-card" style={{ padding: 18, marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <CalendarIcon size={15} className="crm-primary" />
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>Agenda de la semana</span>
      </div>
      <div className="crm-scrollbar-none" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(120px,1fr))", gap: 10, overflowX: "auto" }}>
        {days.map((iso) => {
          const items = tasks.filter((t) => t.due === iso && !t.done);
          const isToday = iso === days[0];
          return (
            <div key={iso} style={{ background: "var(--bg)", borderRadius: 10, padding: 10, minHeight: 96, border: isToday ? "1px solid var(--primary)" : "1px solid transparent" }}>
              <div className="crm-mono" style={{ fontSize: 11, fontWeight: 700, textTransform: "capitalize", color: isToday ? "var(--primary)" : "var(--ink-faint)", marginBottom: 8 }}>{dayLabel(iso)}</div>
              {items.length === 0 ? <div className="crm-ink-faint" style={{ fontSize: 11 }}>—</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {items.slice(0, 3).map((t) => (
                    <div key={t.id} style={{ fontSize: 11, padding: "4px 6px", borderRadius: 6, background: PRIORITY_MAP[t.priority].bg, color: PRIORITY_MAP[t.priority].fg }} className="crm-line-clamp">{t.title}</div>
                  ))}
                  {items.length > 3 && <div className="crm-ink-faint" style={{ fontSize: 10.5 }}>+{items.length - 3} más</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TasksView({ tasks, setTasks, onNew }) {
  const toggle = (id) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const overdue = tasks.filter((t) => !t.done && daysUntil(t.due) < 0);
  const today = tasks.filter((t) => !t.done && daysUntil(t.due) === 0);
  const upcoming = tasks.filter((t) => !t.done && daysUntil(t.due) > 0);
  const done = tasks.filter((t) => t.done);

  const Group = ({ label, items, tone }) => items.length > 0 && (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: tone }}>{label}</span>
        <span className="crm-mono crm-ink-faint" style={{ fontSize: 11.5 }}>({items.length})</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((t) => (
          <div key={t.id} className="crm-card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => toggle(t.id)} className="crm-focus" style={{ width: 19, height: 19, borderRadius: 6, border: "1.5px solid var(--line-strong)", background: t.done ? "var(--teal)" : "none", borderColor: t.done ? "var(--teal)" : undefined, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              {t.done && <Check size={12} color="#fff" strokeWidth={3} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--ink-faint)" : "var(--ink)" }}>{t.title}</div>
              <div className="crm-ink-faint" style={{ fontSize: 11.5, marginTop: 2 }}>{t.type} · {t.company}</div>
            </div>
            <span className="crm-badge" style={{ background: PRIORITY_MAP[t.priority].bg, color: PRIORITY_MAP[t.priority].fg }}>{t.priority}</span>
            <span className="crm-mono crm-ink-faint" style={{ fontSize: 11.5, width: 56, textAlign: "right" }}>{formatDateShort(t.due)}</span>
            <Avatar name={t.rep} size={24} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="crm-fade">
      <ViewHeader title="Tareas y seguimiento" desc="Llamadas, correos, reuniones y recordatorios pendientes."
        action={<button onClick={onNew} className="crm-btn crm-btn-primary crm-focus" style={{ padding: "10px 16px", fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Nueva tarea</button>} />
      <WeeklyAgenda tasks={tasks} />
      <Group label="Vencidas" items={overdue} tone="var(--red)" />
      <Group label="Hoy" items={today} tone="var(--primary)" />
      <Group label="Próximas" items={upcoming} tone="var(--ink-soft)" />
      <Group label="Completadas" items={done} tone="var(--ink-faint)" />
    </div>
  );
}

/* =========================================================================
   REPORTES
   ========================================================================= */

function ReportsView({ deals, reps }) {
  return (
    <div className="crm-fade">
      <ViewHeader title="Reportes" desc="Indicadores clave de ventas, leads y desempeño del equipo." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="crm-rep-grid">
        <div className="crm-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Tendencia de ventas</div>
          <div className="crm-ink-faint" style={{ fontSize: 12, marginBottom: 10 }}>Ingresos cerrados por mes (Q)</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={SALES_MONTHLY} margin={{ left: -18, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--ink-faint)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => formatQ(v)} contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }} />
              <Line type="monotone" dataKey="ventas" stroke="#00998A" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="crm-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Leads por origen</div>
          <div className="crm-ink-faint" style={{ fontSize: 12, marginBottom: 10 }}>Distribución de los últimos 90 días</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={LEADS_BY_SOURCE} dataKey="value" nameKey="name" innerRadius={44} outerRadius={72} paddingAngle={2}>
                  {LEADS_BY_SOURCE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LEADS_BY_SOURCE.map((s) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} /><span className="crm-ink-soft">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="crm-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Desempeño por vendedor</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr className="crm-border-b crm-ink-faint" style={{ fontSize: 11.5, textTransform: "uppercase" }}>{["Vendedor", "Negocios ganados", "Valor cerrado", "En pipeline"].map((h) => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700 }}>{h}</th>)}</tr></thead>
          <tbody>
            {reps.map((r) => {
              const won = deals.filter((d) => d.rep === r && d.stage === "Ganado");
              const open = deals.filter((d) => d.rep === r && d.stage !== "Ganado" && d.stage !== "Perdido");
              return (
                <tr key={r} className="crm-border-b">
                  <td style={{ padding: "10px 12px" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={r} size={22} /><span style={{ fontSize: 13 }}>{r}</span></div></td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{won.length}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600 }} className="crm-mono">{formatQ(won.reduce((s, d) => s + d.value, 0))}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }} className="crm-mono crm-ink-soft">{formatQ(open.reduce((s, d) => s + d.value, 0))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`@media (max-width: 900px) { .crm-rep-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

/* =========================================================================
   FORM MODAL (genérico) + FORMULARIOS DE CREACIÓN
   ========================================================================= */

function FormModal({ title, desc, onClose, onSubmit, submitLabel = "Guardar", children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.55)" }} />
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        className="crm-surface crm-shadow-lg crm-fade crm-scrollbar-none"
        style={{ position: "relative", width: "min(440px,100%)", maxHeight: "88vh", overflowY: "auto", borderRadius: 16, padding: 26 }}
      >
        <button type="button" onClick={onClose} className="crm-icon-btn crm-focus" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>
        <h3 className="crm-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, paddingRight: 30 }}>{title}</h3>
        {desc && <p className="crm-ink-soft" style={{ fontSize: 12.5, marginBottom: 18 }}>{desc}</p>}
        <div>{children}</div>
        <button type="submit" className="crm-btn crm-btn-primary crm-focus" style={{ width: "100%", padding: 12, fontSize: 13.5, marginTop: 6 }}>{submitLabel}</button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="crm-field"><label className="crm-label">{label}</label>{children}</div>;
}

const SOURCES = ["Sitio web", "WhatsApp", "Referido", "Llamada entrante", "Feria / evento"];
const SECTORS_LIST = ["Hospital", "Clínica", "Odontología", "Veterinaria", "Laboratorio"];

function AddLeadModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", contact: "", source: SOURCES[0], rep: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <FormModal title="Nuevo lead" desc="Registre un prospecto captado por cualquier canal." onClose={onClose} submitLabel="Crear lead"
      onSubmit={() => { if (!form.name.trim()) return; onCreate(form); onClose(); }}>
      <Field label="Empresa o nombre del prospecto"><input required value={form.name} onChange={(e) => set("name", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Hospital San Marcos" /></Field>
      <Field label="Persona de contacto"><input value={form.contact} onChange={(e) => set("contact", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Dr. Federico Ruano" /></Field>
      <Field label="Origen"><select value={form.source} onChange={(e) => set("source", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></Field>
      <Field label="Vendedor asignado (opcional)"><select value={form.rep} onChange={(e) => set("rep", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}><option value="">Sin asignar</option>{REPS.map((r) => <option key={r}>{r}</option>)}</select></Field>
    </FormModal>
  );
}

function AddTaskModal({ onClose, onCreate, companies }) {
  const [form, setForm] = useState({ title: "", type: "Llamada", company: companies[0]?.name || "", due: new Date().toISOString().slice(0, 10), priority: "Media", rep: REPS[0] });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <FormModal title="Nueva tarea" desc="Cree un recordatorio de seguimiento, llamada o reunión." onClose={onClose} submitLabel="Crear tarea"
      onSubmit={() => { if (!form.title.trim()) return; onCreate(form); onClose(); }}>
      <Field label="Título"><input required value={form.title} onChange={(e) => set("title", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Llamar para confirmar entrega" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Tipo"><select value={form.type} onChange={(e) => set("type", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{["Llamada", "Correo", "Reunión", "Seguimiento"].map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Prioridad"><select value={form.priority} onChange={(e) => set("priority", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{["Alta", "Media", "Baja"].map((p) => <option key={p}>{p}</option>)}</select></Field>
      </div>
      <Field label="Empresa relacionada"><select value={form.company} onChange={(e) => set("company", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{companies.map((c) => <option key={c.id}>{c.name}</option>)}</select></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Fecha límite"><input type="date" value={form.due} onChange={(e) => set("due", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
        <Field label="Vendedor"><select value={form.rep} onChange={(e) => set("rep", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{REPS.map((r) => <option key={r}>{r}</option>)}</select></Field>
      </div>
    </FormModal>
  );
}

function AddCompanyModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", sector: SECTORS_LIST[0], city: "", rep: REPS[0] });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <FormModal title="Nueva empresa" desc="Registre una institución cliente o prospecto." onClose={onClose} submitLabel="Crear empresa"
      onSubmit={() => { if (!form.name.trim()) return; onCreate(form); onClose(); }}>
      <Field label="Nombre de la empresa"><input required value={form.name} onChange={(e) => set("name", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Clínica del Norte" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Sector"><select value={form.sector} onChange={(e) => set("sector", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{SECTORS_LIST.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Ciudad"><input value={form.city} onChange={(e) => set("city", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Ciudad de Guatemala" /></Field>
      </div>
      <Field label="Vendedor asignado"><select value={form.rep} onChange={(e) => set("rep", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{REPS.map((r) => <option key={r}>{r}</option>)}</select></Field>
    </FormModal>
  );
}

function AddContactModal({ onClose, onCreate, companies }) {
  const [form, setForm] = useState({ name: "", role: "", company: companies[0]?.name || "", email: "", phone: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <FormModal title="Nuevo contacto" desc="Registre una persona de contacto dentro de una empresa." onClose={onClose} submitLabel="Crear contacto"
      onSubmit={() => { if (!form.name.trim()) return; onCreate(form); onClose(); }}>
      <Field label="Nombre completo"><input required value={form.name} onChange={(e) => set("name", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Dra. Karen Xitumul" /></Field>
      <Field label="Cargo"><input value={form.role} onChange={(e) => set("role", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. Jefa de Compras" /></Field>
      <Field label="Empresa"><select value={form.company} onChange={(e) => set("company", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{companies.map((c) => <option key={c.id}>{c.name}</option>)}</select></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Correo"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
        <Field label="Teléfono"><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="+502…" /></Field>
      </div>
    </FormModal>
  );
}

function AddQuoteModal({ onClose, onCreate, companies }) {
  const [form, setForm] = useState({ company: companies[0]?.name || "", contact: "", items: 1, total: "", rep: REPS[0] });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <FormModal title="Nueva cotización" desc="Genere una propuesta comercial para un cliente." onClose={onClose} submitLabel="Crear cotización"
      onSubmit={() => { if (!form.total) return; onCreate(form); onClose(); }}>
      <Field label="Empresa"><select value={form.company} onChange={(e) => set("company", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{companies.map((c) => <option key={c.id}>{c.name}</option>)}</select></Field>
      <Field label="Contacto"><input value={form.contact} onChange={(e) => set("contact", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Nombre del contacto" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="No. de ítems"><input type="number" min="1" value={form.items} onChange={(e) => set("items", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} /></Field>
        <Field label="Total (Q)"><input required type="number" min="0" value={form.total} onChange={(e) => set("total", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }} placeholder="Ej. 24900" /></Field>
      </div>
      <Field label="Vendedor"><select value={form.rep} onChange={(e) => set("rep", e.target.value)} className="crm-input crm-focus" style={{ width: "100%", padding: "9px 12px", fontSize: 13.5 }}>{REPS.map((r) => <option key={r}>{r}</option>)}</select></Field>
    </FormModal>
  );
}

/* =========================================================================
   MAIN APP
   ========================================================================= */

export default function IntermedicCRM() {
  const [dark, setDark] = useState(false);
  const [view, setView] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState("Administrador");
  const currentUser = "Ana López";

  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [leads, setLeads] = useState(LEADS);
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'lead' | 'task' | 'company' | 'contact' | 'quote'

  const isVentas = role === "Ventas";
  const visibleDeals = isVentas ? deals.filter((d) => d.rep === currentUser) : deals;
  const visibleLeads = isVentas ? leads.filter((l) => l.rep === currentUser || !l.rep) : leads;
  const visibleTasks = isVentas ? tasks.filter((t) => t.rep === currentUser) : tasks;

  const goto = (targetView, item) => {
    setView(targetView);
    if (targetView === "contactos" && item) setSelectedContact(item);
  };

  /* ---- creators ---- */
  const createLead = (f) => setLeads((ls) => [{ id: "l" + Date.now(), name: f.name, contact: f.contact || "—", source: f.source, status: "Nuevo", date: new Date().toISOString().slice(0, 10), rep: f.rep || null }, ...ls]);

  const createTask = (f) => setTasks((ts) => [{ id: "t" + Date.now(), title: f.title, type: f.type, company: f.company, due: f.due, priority: f.priority, rep: f.rep, done: false }, ...ts]);

  const createCompany = (f) => setCompanies((cs) => [{ id: "c" + Date.now(), name: f.name, sector: f.sector, contacts: 0, city: f.city, rep: f.rep }, ...cs]);

  const createContact = (f) => {
    setContacts((cts) => [{ id: "ct" + Date.now(), name: f.name, role: f.role || "—", company: f.company, email: f.email || "—", phone: f.phone || "—", lastContact: new Date().toISOString().slice(0, 10), status: "Activo" }, ...cts]);
    setCompanies((cs) => cs.map((c) => (c.name === f.company ? { ...c, contacts: c.contacts + 1 } : c)));
  };

  const createQuote = (f) => {
    const n = quotes.length + 141;
    setQuotes((qs) => [{ id: `COT-2026-0${n}`, company: f.company, contact: f.contact || "—", items: Number(f.items) || 1, total: Number(f.total) || 0, status: "Borrador", date: new Date().toISOString().slice(0, 10), rep: f.rep }, ...qs]);
  };

  /* ---- convert lead -> company + contact + deal ---- */
  const convertLead = (lead) => {
    const companyName = lead.name;
    let company = companies.find((c) => c.name === companyName);
    if (!company) {
      company = { id: "c" + Date.now(), name: companyName, sector: "Prospecto", contacts: 0, city: "", rep: lead.rep || currentUser };
      setCompanies((cs) => [company, ...cs]);
    }
    if (lead.contact && lead.contact !== "—") {
      setContacts((cts) => [{ id: "ct" + Date.now(), name: lead.contact, role: "Contacto principal", company: companyName, email: "—", phone: "—", lastContact: new Date().toISOString().slice(0, 10), status: "Activo" }, ...cts]);
      setCompanies((cs) => cs.map((c) => (c.name === companyName ? { ...c, contacts: c.contacts + 1 } : c)));
    }
    setDeals((ds) => [mkDeal(`Nuevo negocio — ${companyName}`, companyName, lead.contact || "—", 0, "Prospección", lead.rep || currentUser, 30), ...ds]);
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, status: "Calificado", converted: true } : l)));
  };

  return (
    <div className={`crm-root${dark ? " crm-dark" : ""}`} style={{ display: "flex" }}>
      <GlobalStyles />
      <Sidebar view={view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} role={role} setRole={setRole} />
      <div style={{ flex: 1, minWidth: 0, marginLeft: 232 }} className="crm-main">
        <Topbar dark={dark} setDark={setDark} setMobileOpen={setMobileOpen} openModal={setActiveModal} companies={companies} contacts={contacts} leads={leads} quotes={quotes} onGoto={goto} />
        <div style={{ padding: "24px 26px 60px" }}>
          {view === "dashboard" && <Dashboard tasks={visibleTasks} deals={visibleDeals} leads={visibleLeads} quotes={quotes} reps={isVentas ? [currentUser] : REPS} setView={setView} />}
          {view === "leads" && <LeadsView leads={visibleLeads} setLeads={setLeads} onNew={() => setActiveModal("lead")} onConvert={convertLead} />}
          {view === "pipeline" && <PipelineView deals={visibleDeals} setDeals={setDeals} onOpenDeal={setSelectedDeal} />}
          {view === "empresas" && <CompaniesView companies={companies} deals={deals} onNew={() => setActiveModal("company")} onOpen={setSelectedCompany} />}
          {view === "contactos" && <ContactsView contacts={contacts} onOpen={setSelectedContact} onNew={() => setActiveModal("contact")} />}
          {view === "cotizaciones" && <QuotesView quotes={quotes} onNew={() => setActiveModal("quote")} />}
          {view === "tareas" && <TasksView tasks={visibleTasks} setTasks={setTasks} onNew={() => setActiveModal("task")} />}
          {view === "reportes" && !isVentas && <ReportsView deals={deals} reps={REPS} />}
        </div>
      </div>

      <ContactDetail contact={selectedContact} onClose={() => setSelectedContact(null)} />
      <CompanyDetail company={selectedCompany} deals={deals} contacts={contacts} onClose={() => setSelectedCompany(null)} />
      <DealDetail deal={selectedDeal} onClose={() => setSelectedDeal(null)} />

      {activeModal === "lead" && <AddLeadModal onClose={() => setActiveModal(null)} onCreate={createLead} />}
      {activeModal === "task" && <AddTaskModal onClose={() => setActiveModal(null)} onCreate={createTask} companies={companies} />}
      {activeModal === "company" && <AddCompanyModal onClose={() => setActiveModal(null)} onCreate={createCompany} />}
      {activeModal === "contact" && <AddContactModal onClose={() => setActiveModal(null)} onCreate={createContact} companies={companies} />}
      {activeModal === "quote" && <AddQuoteModal onClose={() => setActiveModal(null)} onCreate={createQuote} companies={companies} />}

      <style>{`@media (max-width: 900px) { .crm-main { margin-left: 0 !important; } }`}</style>
    </div>
  );
}
