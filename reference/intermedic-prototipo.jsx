import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Menu, X, Moon, Sun, ChevronDown, ChevronRight, ChevronLeft, Heart,
  Scale, MapPin, Phone, Mail, MessageCircle, Star, ArrowRight, Grid3x3, List,
  SlidersHorizontal, Check, Package, Truck, Clock, Award, Users, Building2,
  Stethoscope, Activity, HeartPulse, Syringe, Thermometer, Microscope,
  BedDouble, Wind, ShieldCheck, FlaskConical, Bone, Scissors, Plus, Minus,
  FileText, Download, Monitor, Shirt, Wrench, Headphones, GraduationCap,
  PawPrint, Smile, User, Quote, Sparkles, Tag, ExternalLink,
} from "lucide-react";

/* =========================================================================
   DATA
   ========================================================================= */

const CATEGORIES = [
  { id: "equipo-medico", name: "Equipo médico", icon: Stethoscope },
  { id: "equipo-hospitalario", name: "Equipo hospitalario", icon: BedDouble },
  { id: "instrumental", name: "Instrumental quirúrgico", icon: Scissors },
  { id: "diagnostico", name: "Diagnóstico", icon: Activity },
  { id: "mobiliario", name: "Mobiliario médico", icon: Package },
  { id: "laboratorio", name: "Equipo de laboratorio", icon: FlaskConical },
  { id: "insumos", name: "Insumos médicos", icon: Syringe },
  { id: "rehabilitacion", name: "Rehabilitación", icon: HeartPulse },
  { id: "ortopedia", name: "Ortopedia", icon: Bone },
  { id: "cuidado-paciente", name: "Cuidado del paciente", icon: Heart },
  { id: "monitores", name: "Monitores", icon: Monitor },
  { id: "esterilizadores", name: "Esterilizadores", icon: ShieldCheck },
  { id: "respiratorio", name: "Equipo respiratorio", icon: Wind },
  { id: "descartable", name: "Material descartable", icon: Package },
  { id: "uniformes", name: "Uniformes médicos", icon: Shirt },
  { id: "accesorios", name: "Accesorios", icon: Plus },
];

const BRANDS = ["Mindray", "Philips", "GE Healthcare", "Dräger", "B. Braun", "Welch Allyn", "Getinge", "3M"];

const PRODUCTS = [
  { id: "p1", name: "Monitor de Signos Vitales Serie V8", cat: "monitores", catName: "Monitores", brand: "Mindray", usage: "Nuevo", price: null, badge: "Destacado", stock: "in", delivery: "5–7 días hábiles", img: ["#0057D9", "#00B39E"], desc: "Monitor multiparamétrico de cabecera con pantalla táctil de 12.1\", medición no invasiva de SpO2, ECG, PANI, temperatura y respiración, pensado para áreas críticas y de hospitalización.", specs: [["Pantalla", "12.1\" táctil capacitiva"], ["Parámetros", "ECG, SpO2, PANI, Temp, Resp"], ["Batería", "Hasta 4 horas"], ["Conectividad", "HL7 / Red hospitalaria"], ["Peso", "4.8 kg"]] },
  { id: "p2", name: "Cama Hospitalaria Eléctrica 3 Posiciones", cat: "equipo-hospitalario", catName: "Equipo hospitalario", brand: "Welch Allyn", usage: "Nuevo", price: 18500, badge: null, stock: "in", delivery: "10–15 días hábiles", img: ["#0B1B2B", "#2C4A63"], desc: "Cama hospitalaria de accionamiento eléctrico con ajuste de respaldo, elevación y posición Trendelenburg, barandales abatibles y ruedas con freno centralizado.", specs: [["Posiciones", "3 motores eléctricos"], ["Capacidad", "180 kg"], ["Barandales", "Abatibles, aluminio"], ["Colchón", "Incluido, espuma alta densidad"], ["Garantía", "24 meses"]] },
  { id: "p3", name: "Set de Instrumental Quirúrgico General (32 pzs)", cat: "instrumental", catName: "Instrumental quirúrgico", brand: "B. Braun", usage: "Nuevo", price: 6200, badge: null, stock: "in", delivery: "7–10 días hábiles", img: ["#00B39E", "#0057D9"], desc: "Set completo de instrumental en acero quirúrgico inoxidable para procedimientos generales, incluye estuche de esterilización rígido.", specs: [["Piezas", "32"], ["Material", "Acero inoxidable AISI 420"], ["Esterilización", "Autoclave a vapor"], ["Estuche", "Rígido, con bandeja perforada"]] },
  { id: "p4", name: "Ecógrafo Portátil Doppler Color", cat: "diagnostico", catName: "Diagnóstico", brand: "Mindray", usage: "Nuevo", price: null, badge: "Destacado", stock: "in", delivery: "8–12 días hábiles", img: ["#0057D9", "#08131F"], desc: "Sistema de ultrasonido portátil con Doppler color, ideal para consultorio, medicina general y urgencias. Incluye transductor convexo y lineal.", specs: [["Transductores", "Convexo + lineal"], ["Pantalla", "15\" LED"], ["Modos", "B, M, Doppler color, PW"], ["Batería", "60 min de autonomía"]] },
  { id: "p5", name: "Autoclave de Mesa 24L", cat: "esterilizadores", catName: "Esterilizadores", brand: "Getinge", usage: "Nuevo", price: 24900, badge: null, stock: "low", delivery: "15–20 días hábiles", img: ["#08131F", "#00B39E"], desc: "Autoclave de mesa de clase B para esterilización de instrumental sólido, hueco y textiles, con ciclos programables e impresora integrada.", specs: [["Capacidad", "24 litros"], ["Clase", "B (EN 13060)"], ["Ciclos", "6 programables"], ["Registro", "Impresora térmica integrada"]] },
  { id: "p6", name: "Ventilador de Transporte", cat: "respiratorio", catName: "Equipo respiratorio", brand: "Dräger", usage: "Nuevo", price: null, badge: "Nuevo", stock: "in", delivery: "10–14 días hábiles", img: ["#0057D9", "#2C4A63"], desc: "Ventilador compacto para transporte intra y extrahospitalario, con batería de larga duración y modos volumétricos y de presión.", specs: [["Modos", "VCV, PCV, SIMV, CPAP"], ["Batería", "Hasta 8 horas"], ["Peso", "3.2 kg"], ["Alarmas", "Configurables, visuales y sonoras"]] },
  { id: "p7", name: "Silla de Ruedas Ortopédica Reforzada", cat: "ortopedia", catName: "Ortopedia", brand: "Genérico", usage: "Nuevo", price: 1450, badge: null, stock: "in", delivery: "3–5 días hábiles", img: ["#00B39E", "#0B1B2B"], desc: "Silla de ruedas plegable de estructura reforzada en acero, apoyapiés removibles y frenos de seguridad en ambas ruedas traseras.", specs: [["Capacidad", "135 kg"], ["Estructura", "Acero reforzado"], ["Plegable", "Sí, tipo tijera"], ["Ruedas", "24\" traseras, giratorias delanteras"]] },
  { id: "p8", name: "Microscopio Binocular de Laboratorio", cat: "laboratorio", catName: "Equipo de laboratorio", brand: "Genérico", usage: "Nuevo", price: 3800, badge: null, stock: "in", delivery: "5–8 días hábiles", img: ["#0B1B2B", "#0057D9"], desc: "Microscopio binocular para laboratorio clínico, óptica acromática, iluminación LED y revólver cuádruple.", specs: [["Oculares", "WF10x"], ["Objetivos", "4x, 10x, 40x, 100x"], ["Iluminación", "LED regulable"], ["Enfoque", "Coaxial macro/micrométrico"]] },
  { id: "p9", name: "Bomba de Infusión Volumétrica", cat: "cuidado-paciente", catName: "Cuidado del paciente", brand: "B. Braun", usage: "Reacondicionado", price: 5600, badge: "Promoción", stock: "in", delivery: "5–7 días hábiles", img: ["#00B39E", "#0057D9"], desc: "Bomba de infusión volumétrica reacondicionada y certificada, con sistema de detección de aire y oclusión.", specs: [["Rango de flujo", "0.1–999 ml/h"], ["Detección de aire", "Sí"], ["Batería", "4 horas de respaldo"], ["Certificación", "Revisión técnica Intermedic"]] },
  { id: "p10", name: "Guantes de Nitrilo sin Polvo (Caja 100)", cat: "descartable", catName: "Material descartable", brand: "3M", usage: "Nuevo", price: 85, badge: null, stock: "in", delivery: "2–4 días hábiles", img: ["#0057D9", "#00B39E"], desc: "Guantes de examinación de nitrilo, sin polvo, alta resistencia a punción, disponibles en tallas S a XL.", specs: [["Material", "Nitrilo"], ["Empaque", "100 unidades"], ["Tallas", "S, M, L, XL"], ["Uso", "Examinación / no estéril"]] },
  { id: "p11", name: "Uniforme Quirúrgico Antifluido (Par)", cat: "uniformes", catName: "Uniformes médicos", brand: "Genérico", usage: "Nuevo", price: 210, badge: null, stock: "in", delivery: "3–5 días hábiles", img: ["#0B1B2B", "#00B39E"], desc: "Conjunto de filipina y pantalón en tela antifluido, transpirable, disponible en varias tallas y colores institucionales.", specs: [["Tela", "Antifluido 65/35"], ["Piezas", "Filipina + pantalón"], ["Tallas", "XS a XXL"], ["Colores", "Bajo pedido institucional"]] },
  { id: "p12", name: "Camilla de Exploración Ajustable", cat: "mobiliario", catName: "Mobiliario médico", brand: "Genérico", usage: "Nuevo", price: 4100, badge: null, stock: "in", delivery: "6–9 días hábiles", img: ["#0057D9", "#08131F"], desc: "Camilla de exploración con respaldo ajustable, tapiz antibacterial y estructura metálica con acabado epóxico.", specs: [["Respaldo", "Ajustable manual"], ["Capacidad", "160 kg"], ["Tapiz", "Antibacterial, sin costuras"], ["Rodapié", "Con papelera incluida"]] },
  { id: "p13", name: "Desfibrilador Externo Automático (DEA)", cat: "diagnostico", catName: "Diagnóstico", brand: "Philips", usage: "Nuevo", price: null, badge: "Nuevo", stock: "in", delivery: "8–10 días hábiles", img: ["#0057D9", "#00B39E"], desc: "DEA de uso público y clínico con instrucciones por voz, autoanálisis de ritmo y electrodos de fácil colocación.", specs: [["Guía", "Instrucciones por voz"], ["Electrodos", "Adulto / pediátrico"], ["Autonomía batería", "Hasta 300 descargas / 4 años standby"], ["Certificación", "Uso clínico y público"]] },
  { id: "p14", name: "Andador Ortopédico Plegable", cat: "rehabilitacion", catName: "Rehabilitación", brand: "Genérico", usage: "Nuevo", price: 690, badge: null, stock: "low", delivery: "3–5 días hábiles", img: ["#00B39E", "#0B1B2B"], desc: "Andador plegable en aluminio ligero con altura ajustable, ideal para rehabilitación y apoyo en el adulto mayor.", specs: [["Material", "Aluminio"], ["Peso", "2.1 kg"], ["Altura", "Ajustable, 5 posiciones"], ["Capacidad", "120 kg"]] },
];

const SECTORS = [
  { name: "Hospitales", icon: Building2, desc: "Equipamiento integral para áreas críticas, hospitalización y quirófano." },
  { name: "Clínicas y consultorios", icon: Stethoscope, desc: "Soluciones de diagnóstico y mobiliario para la práctica ambulatoria." },
  { name: "Odontólogos", icon: Smile, desc: "Instrumental e insumos específicos para consultorio dental." },
  { name: "Veterinarios", icon: PawPrint, desc: "Equipo de diagnóstico y quirúrgico adaptado a medicina veterinaria." },
  { name: "Laboratorios", icon: Microscope, desc: "Instrumentación analítica y de procesamiento de muestras." },
  { name: "Pacientes y particulares", icon: User, desc: "Equipo de cuidado y movilidad para el hogar." },
];

const SERVICES = [
  { name: "Asesoría especializada", icon: Users, desc: "Acompañamiento técnico para elegir el equipo correcto según su presupuesto y necesidad clínica." },
  { name: "Mantenimiento", icon: Wrench, desc: "Planes de mantenimiento preventivo y correctivo con técnicos certificados." },
  { name: "Soporte técnico", icon: Headphones, desc: "Atención postventa directa, con tiempos de respuesta definidos por contrato." },
  { name: "Instalación", icon: Truck, desc: "Instalación y puesta en marcha de equipo en sitio, en todo el país." },
  { name: "Capacitación", icon: GraduationCap, desc: "Capacitación al personal clínico y técnico para el uso correcto del equipo." },
];

const TESTIMONIALS = [
  { quote: "El tiempo de respuesta y el soporte postventa marcaron la diferencia frente a otros proveedores que ya conocíamos.", name: "Jefa de Compras", org: "Hospital Privado del Valle" },
  { quote: "Nos ayudaron a planificar el reemplazo de todo el equipo de monitoreo sin detener la operación del área.", org: "Clínica San Rafael", name: "Coordinador de Bioseguridad" },
  { quote: "La asesoría técnica antes de comprar fue tan valiosa como el equipo mismo.", org: "Laboratorio Clínico Central", name: "Gerente de Operaciones" },
];

const BLOG_POSTS = [
  { title: "Cómo elegir el monitor de signos vitales adecuado para su clínica", tag: "Guías", read: "6 min" },
  { title: "Mantenimiento preventivo: la clave para alargar la vida útil de su equipo", tag: "Mantenimiento", read: "4 min" },
  { title: "Diagnóstico portátil: la tendencia que está llegando a más consultorios", tag: "Tendencias", read: "5 min" },
];

const FAQS = [
  { q: "¿Cómo solicito una cotización?", a: "Puede solicitarla directamente desde la ficha de cada producto, desde el catálogo, o escribiéndonos por WhatsApp. Respondemos la mayoría de cotizaciones en menos de 24 horas hábiles." },
  { q: "¿Cuál es el tiempo de entrega?", a: "Depende del equipo: los insumos y mobiliario en bodega se entregan en 2 a 5 días hábiles; el equipo especializado de importación puede tomar de 10 a 20 días hábiles. El tiempo estimado aparece en cada ficha de producto." },
  { q: "¿Qué significa 'equipo reacondicionado'?", a: "Es equipo usado que pasó por un proceso de revisión, limpieza, calibración y certificación técnica interna antes de salir a la venta, con garantía propia de Intermedic." },
  { q: "¿Ofrecen garantía?", a: "Sí. El equipo nuevo conserva la garantía del fabricante; el equipo reacondicionado incluye garantía de Intermedic según el tipo de producto." },
  { q: "¿Dan cobertura fuera de la capital?", a: "Sí, distribuimos, instalamos y damos soporte técnico en todo Guatemala." },
];

/* =========================================================================
   HELPERS
   ========================================================================= */

const formatQ = (n) => `Q ${n.toLocaleString("es-GT")}`;

function useOutsideClose(ref, onClose) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

/* =========================================================================
   GLOBAL STYLES
   ========================================================================= */

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

      .im-root {
        --bg: #FFFFFF;
        --bg-soft: #F4F7F9;
        --surface: #FFFFFF;
        --ink: #0B1B2B;
        --ink-soft: #55677A;
        --ink-faint: #8494A3;
        --line: #E2E8ED;
        --line-strong: #C9D3DB;
        --primary: #0057D9;
        --primary-ink: #FFFFFF;
        --primary-soft: #E9F0FE;
        --teal: #00998A;
        --teal-soft: #E3F6F2;
        --amber: #C9600A;
        --amber-soft: #FCEEE1;
        --shadow: 0 1px 2px rgba(11,27,43,0.04), 0 8px 24px rgba(11,27,43,0.06);
        --shadow-lg: 0 4px 8px rgba(11,27,43,0.06), 0 24px 48px rgba(11,27,43,0.10);
        font-family: 'Inter', system-ui, sans-serif;
        color: var(--ink);
        background: var(--bg);
        min-height: 100vh;
        scroll-behavior: smooth;
      }
      .im-root.im-dark {
        --bg: #081420;
        --bg-soft: #0D1D2C;
        --surface: #0F2135;
        --ink: #E9F1F8;
        --ink-soft: #9FB2C4;
        --ink-faint: #6E8397;
        --line: #1D3245;
        --line-strong: #294763;
        --primary: #4C90FF;
        --primary-ink: #071224;
        --primary-soft: #142E4C;
        --teal: #35D6BF;
        --teal-soft: #0E2D2A;
        --amber: #FFA35C;
        --amber-soft: #2E2013;
        --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.35);
        --shadow-lg: 0 4px 8px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.5);
      }
      .im-root * { box-sizing: border-box; }
      .im-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.01em; }
      .im-mono { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0; }
      .im-container { max-width: 1360px; margin: 0 auto; padding: 0 24px; }
      @media (max-width: 640px) { .im-container { padding: 0 18px; } }

      .im-bg { background: var(--bg); }
      .im-bg-soft { background: var(--bg-soft); }
      .im-surface { background: var(--surface); }
      .im-ink { color: var(--ink); }
      .im-ink-soft { color: var(--ink-soft); }
      .im-ink-faint { color: var(--ink-faint); }
      .im-primary { color: var(--primary); }
      .im-border { border: 1px solid var(--line); }
      .im-border-t { border-top: 1px solid var(--line); }
      .im-border-b { border-bottom: 1px solid var(--line); }
      .im-shadow { box-shadow: var(--shadow); }
      .im-shadow-lg { box-shadow: var(--shadow-lg); }

      .im-btn { font-family: 'Inter', sans-serif; font-weight: 600; border-radius: 10px; transition: all .18s ease; cursor: pointer; white-space: nowrap; }
      .im-btn:disabled { opacity: .5; cursor: not-allowed; }
      .im-btn-primary { background: var(--primary); color: var(--primary-ink); border: 1px solid var(--primary); }
      .im-btn-primary:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
      .im-btn-outline { background: transparent; color: var(--ink); border: 1px solid var(--line-strong); }
      .im-btn-outline:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
      .im-btn-ghost { background: transparent; color: var(--ink-soft); border: 1px solid transparent; }
      .im-btn-ghost:hover:not(:disabled) { background: var(--bg-soft); color: var(--ink); }
      .im-btn-icon { background: var(--surface); border: 1px solid var(--line); border-radius: 999px; display:flex; align-items:center; justify-content:center; transition: all .15s ease; cursor:pointer; }
      .im-btn-icon:hover { border-color: var(--primary); color: var(--primary); }
      .im-btn-icon.active { background: var(--primary-soft); color: var(--primary); border-color: var(--primary); }

      .im-card { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; transition: box-shadow .2s ease, transform .2s ease, border-color .2s ease; }
      .im-card:hover { box-shadow: var(--shadow-lg); border-color: var(--line-strong); transform: translateY(-2px); }

      .im-badge { font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; padding: 4px 9px; border-radius: 999px; display: inline-flex; align-items:center; gap:4px; }
      .im-badge-new { background: var(--teal-soft); color: var(--teal); }
      .im-badge-promo { background: var(--amber-soft); color: var(--amber); }
      .im-badge-featured { background: var(--primary-soft); color: var(--primary); }

      .im-nav-glass { background: color-mix(in srgb, var(--bg) 82%, transparent); backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%); }

      .im-hero-visual { position: relative; overflow: hidden; border-radius: 24px; background: linear-gradient(155deg, var(--bg-soft) 0%, var(--surface) 60%); }
      .im-scan-grid { position:absolute; inset:0; background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 28px 28px; opacity: .55; }
      .im-scanline { position:absolute; left:0; right:0; height:2px; background: linear-gradient(90deg, transparent, var(--teal), var(--primary), transparent); box-shadow: 0 0 16px 2px var(--teal); animation: im-scan 3.6s ease-in-out infinite; opacity: .85; }
      @keyframes im-scan { 0% { top: 6%; opacity: 0; } 10% { opacity: .9; } 50% { top: 92%; opacity: .9; } 60% { opacity: 0; } 100% { top: 92%; opacity: 0; } }
      @media (prefers-reduced-motion: reduce) { .im-scanline { animation: none; top: 50%; } }

      .im-tick-divider { display:flex; align-items:center; justify-content:center; gap:3px; padding: 6px 0; }
      .im-tick { width:1px; background: var(--line-strong); }
      .im-tick.short { height: 6px; }
      .im-tick.long { height: 12px; }
      .im-tick.dot { width:4px; height:4px; border-radius:50%; background: var(--primary); align-self:center; margin: 0 6px; }

      .im-fade-up { animation: im-fadeUp .6s ease both; }
      @keyframes im-fadeUp { from { opacity:0; transform: translateY(14px);} to { opacity:1; transform:none; } }
      @media (prefers-reduced-motion: reduce) { .im-fade-up { animation:none; } }

      .im-input { font-family:'Inter',sans-serif; background: var(--surface); border:1px solid var(--line-strong); border-radius: 10px; color: var(--ink); outline:none; transition: border-color .15s ease, box-shadow .15s ease; }
      .im-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
      .im-input::placeholder { color: var(--ink-faint); }

      .im-checkbox { width:16px; height:16px; border-radius:5px; border:1.5px solid var(--line-strong); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition: all .15s; }
      .im-checkbox.checked { background: var(--primary); border-color: var(--primary); }

      .im-focus:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

      .im-marquee-track { display:flex; gap:56px; animation: im-marquee 26s linear infinite; }
      .im-marquee-track:hover { animation-play-state: paused; }
      @keyframes im-marquee { from { transform: translateX(0);} to { transform: translateX(-50%); } }
      @media (prefers-reduced-motion: reduce) { .im-marquee-track { animation: none; } }

      .im-scrollbar-none::-webkit-scrollbar { display:none; }
      .im-scrollbar-none { -ms-overflow-style:none; scrollbar-width:none; }

      .im-line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

      .im-slideover { transition: transform .3s cubic-bezier(.16,1,.3,1); }
      .im-backdrop { transition: opacity .25s ease; }
    `}</style>
  );
}

/* =========================================================================
   SMALL UI PIECES
   ========================================================================= */

function TickDivider() {
  return (
    <div className="im-tick-divider" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`im-tick ${i === 2 ? "long" : "short"}`} />
      ))}
      <div className="im-tick dot" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={"b" + i} className={`im-tick ${i === 2 ? "long" : "short"}`} />
      ))}
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <div className="im-mono im-primary" style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, desc, align = "left" }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === "center" ? 620 : 560, margin: align === "center" ? "0 auto" : 0 }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="im-display" style={{ fontSize: "clamp(26px,3.2vw,38px)", fontWeight: 600, lineHeight: 1.15, marginBottom: 12 }}>{title}</h2>
      {desc && <p className="im-ink-soft" style={{ fontSize: 16, lineHeight: 1.6 }}>{desc}</p>}
    </div>
  );
}

function ProductVisual({ colors, icon: Icon, size = 1 }) {
  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 14, overflow: "hidden",
      background: `linear-gradient(135deg, ${colors[0]}1A, ${colors[1]}26)`,
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)", backgroundSize: "18px 18px", opacity: 0.5 }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 64 * size, height: 64 * size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, boxShadow: `0 8px 24px ${colors[0]}40`,
        }}>
          <Icon size={28 * size} color="#fff" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}

function catIcon(catId) {
  const c = CATEGORIES.find((c) => c.id === catId);
  return c ? c.icon : Package;
}

function StockBadge({ stock }) {
  if (stock === "low") return <span className="im-mono im-ink-faint" style={{ fontSize: 11.5 }}>· pocas unidades</span>;
  return <span className="im-mono im-ink-faint" style={{ fontSize: 11.5 }}>· en stock</span>;
}

/* =========================================================================
   HEADER
   ========================================================================= */

function Header({ dark, setDark, view, goHome, goCatalog, scrollHome, mobileMenu, setMobileMenu, openQuote, favCount, compareCount }) {
  return (
    <header className="im-nav-glass im-border-b" style={{ position: "sticky", top: 0, zIndex: 40 }}>
      <div className="im-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        <button onClick={goHome} className="im-focus" style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, var(--primary), var(--teal))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={18} color="#fff" strokeWidth={2.25} />
          </div>
          <span className="im-display" style={{ fontSize: 19, fontWeight: 700 }}>INTERMEDIC</span>
        </button>

        <nav className="im-ink-soft" style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 14.5, fontWeight: 500 }} aria-label="Navegación principal">
          <button onClick={goHome} className="im-focus" style={{ background: "none", border: "none", cursor: "pointer", color: view === "home" ? "var(--ink)" : "inherit" }}>Inicio</button>
          <button onClick={goCatalog} className="im-focus" style={{ background: "none", border: "none", cursor: "pointer", color: view === "catalog" ? "var(--ink)" : "inherit" }}>Catálogo</button>
          <button onClick={() => scrollHome("sectores")} className="im-focus im-hide-sm" style={{ background: "none", border: "none", cursor: "pointer" }}>Sectores</button>
          <button onClick={() => scrollHome("servicios")} className="im-focus im-hide-sm" style={{ background: "none", border: "none", cursor: "pointer" }}>Servicios</button>
          <button onClick={() => scrollHome("contacto")} className="im-focus im-hide-sm" style={{ background: "none", border: "none", cursor: "pointer" }}>Contacto</button>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setDark(!dark)} aria-label="Cambiar tema" className="im-btn-icon im-focus" style={{ width: 36, height: 36 }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={goCatalog} aria-label="Favoritos" className="im-btn-icon im-focus im-hide-sm" style={{ width: 36, height: 36, position: "relative" }}>
            <Heart size={16} />
            {favCount > 0 && <span className="im-mono" style={{ position: "absolute", top: -4, right: -4, background: "var(--primary)", color: "#fff", fontSize: 10, borderRadius: 999, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{favCount}</span>}
          </button>
          <button onClick={() => openQuote(null)} className="im-btn im-btn-primary im-focus im-hide-sm" style={{ padding: "9px 18px", fontSize: 14 }}>Cotizar</button>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="im-btn-icon im-focus" style={{ width: 36, height: 36, display: "none" }} aria-label="Menú">
            {mobileMenu ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .im-hide-sm { display: none !important; }
          header button[aria-label="Menú"] { display: flex !important; }
        }
      `}</style>
      {mobileMenu && (
        <div className="im-border-t im-bg" style={{ display: "none" }} />
      )}
    </header>
  );
}

/* =========================================================================
   SMART SEARCH
   ========================================================================= */

function SmartSearch({ value, onChange, onSubmit, variant = "hero" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));

  const matches = useMemo(() => {
    if (!value.trim()) return { products: [], cats: [] };
    const q = value.toLowerCase();
    const products = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.catName.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)).slice(0, 5);
    const cats = CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 3);
    return { products, cats };
  }, [value]);

  const big = variant === "hero";

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(value); setOpen(false); }} style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={big ? 19 : 16} className="im-ink-faint" style={{ position: "absolute", left: big ? 18 : 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={big ? "Busque por producto, categoría o marca — ej. \"monitor\", \"autoclave\", \"Philips\"" : "Buscar en el catálogo…"}
            className="im-input im-focus"
            style={{ width: "100%", padding: big ? "16px 16px 16px 50px" : "10px 14px 10px 40px", fontSize: big ? 15.5 : 14 }}
            aria-label="Buscar productos"
          />
        </div>
        <button type="submit" className="im-btn im-btn-primary im-focus" style={{ padding: big ? "0 26px" : "0 18px", fontSize: 14.5 }}>
          Buscar
        </button>
      </form>

      {open && value.trim() && (matches.products.length > 0 || matches.cats.length > 0) && (
        <div className="im-surface im-border im-shadow-lg" style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, borderRadius: 14, padding: 8, zIndex: 50, maxHeight: 380, overflowY: "auto" }}>
          {matches.cats.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <div className="im-ink-faint im-mono" style={{ fontSize: 11, padding: "6px 10px", textTransform: "uppercase", letterSpacing: ".05em" }}>Categorías</div>
              {matches.cats.map((c) => (
                <button key={c.id} onClick={() => { onSubmit(c.name); setOpen(false); }} className="im-focus" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", background: "none", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-soft)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                  <c.icon size={15} className="im-primary" />
                  <span style={{ fontSize: 14 }}>{c.name}</span>
                </button>
              ))}
            </div>
          )}
          {matches.products.length > 0 && (
            <div>
              <div className="im-ink-faint im-mono" style={{ fontSize: 11, padding: "6px 10px", textTransform: "uppercase", letterSpacing: ".05em" }}>Productos</div>
              {matches.products.map((p) => (
                <button key={p.id} onClick={() => { onSubmit(p.name); setOpen(false); }} className="im-focus" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", background: "none", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-soft)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: `linear-gradient(135deg, ${p.img[0]}, ${p.img[1]})`, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div className="im-ink-faint" style={{ fontSize: 12 }}>{p.catName} · {p.brand}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   HERO
   ========================================================================= */

function Hero({ search, setSearch, onSearchSubmit }) {
  return (
    <section className="im-container" style={{ paddingTop: 56, paddingBottom: 40 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center" }} className="im-hero-grid">
        <div className="im-fade-up">
          <Eyebrow>Distribuidor de equipo médico · Guatemala</Eyebrow>
          <h1 className="im-display" style={{ fontSize: "clamp(34px,4.6vw,54px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 20 }}>
            Equipamos la precisión<br />detrás de cada diagnóstico.
          </h1>
          <p className="im-ink-soft" style={{ fontSize: 17.5, lineHeight: 1.65, maxWidth: 480, marginBottom: 32 }}>
            Equipo médico, hospitalario y de laboratorio para hospitales, clínicas y profesionales de la salud en toda Guatemala — con asesoría técnica real, no solo catálogo.
          </p>
          <div style={{ marginBottom: 28 }}>
            <SmartSearch value={search} onChange={setSearch} onSubmit={onSearchSubmit} variant="hero" />
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[["+12,000", "equipos distribuidos"], ["+500", "instituciones atendidas"], ["20 años", "de trayectoria"]].map(([n, l]) => (
              <div key={l}>
                <div className="im-mono im-display" style={{ fontSize: 22, fontWeight: 700 }}>{n}</div>
                <div className="im-ink-faint" style={{ fontSize: 12.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="im-fade-up im-hero-visual" style={{ height: 460, animationDelay: ".1s" }}>
          <div className="im-scan-grid" />
          <div className="im-scanline" />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 220, height: 220 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--teal))", opacity: 0.14, filter: "blur(30px)" }} />
              <div style={{ position: "absolute", inset: 30, borderRadius: "50%", border: "1px solid var(--line-strong)" }} />
              <div style={{ position: "absolute", inset: 60, borderRadius: "50%", border: "1px solid var(--line-strong)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 84, height: 84, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--teal))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 32px rgba(0,87,217,0.35)" }}>
                  <HeartPulse size={38} color="#fff" strokeWidth={1.6} />
                </div>
              </div>
            </div>
          </div>
          <div className="im-mono im-ink-faint" style={{ position: "absolute", bottom: 18, left: 18, fontSize: 11 }}>SIST. DE MONITOREO · EN VIVO</div>
          <div className="im-mono im-ink-faint" style={{ position: "absolute", top: 18, right: 18, fontSize: 11 }}>GT-2026</div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .im-hero-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* =========================================================================
   CATEGORY GRID
   ========================================================================= */

function CategoryGrid({ onSelect }) {
  const shown = CATEGORIES.slice(0, 12);
  return (
    <section className="im-container" style={{ padding: "36px 24px 56px" }}>
      <SectionHeading eyebrow="Explore" title="Categorías" desc="Todo lo que necesita, organizado como su operación lo necesita." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginTop: 28 }} className="im-cat-grid">
        {shown.map((c) => (
          <button key={c.id} onClick={() => onSelect(c.id)} className="im-card im-focus" style={{ padding: "22px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", background: "var(--surface)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <c.icon size={20} className="im-primary" strokeWidth={1.75} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 500, textAlign: "center", lineHeight: 1.3 }}>{c.name}</span>
          </button>
        ))}
      </div>
      <style>{`
        @media (max-width: 980px) { .im-cat-grid { grid-template-columns: repeat(4,1fr) !important; } }
        @media (max-width: 620px) { .im-cat-grid { grid-template-columns: repeat(3,1fr) !important; } }
      `}</style>
    </section>
  );
}

/* =========================================================================
   BRAND MARQUEE
   ========================================================================= */

function BrandStrip() {
  const list = [...BRANDS, ...BRANDS];
  return (
    <section className="im-border-t im-border-b im-bg-soft" style={{ padding: "26px 0", overflow: "hidden" }}>
      <div className="im-container" style={{ marginBottom: 14 }}>
        <span className="im-ink-faint im-mono" style={{ fontSize: 12, letterSpacing: ".05em", textTransform: "uppercase" }}>Marcas que distribuimos</span>
      </div>
      <div className="im-scrollbar-none" style={{ overflow: "hidden" }}>
        <div className="im-marquee-track" style={{ width: "max-content" }}>
          {list.map((b, i) => (
            <span key={i} className="im-display im-ink-faint" style={{ fontSize: 22, fontWeight: 600, whiteSpace: "nowrap" }}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   PRODUCT CARD + ROWS
   ========================================================================= */

function ProductCard({ p, onOpen, isFav, toggleFav, isCompare, toggleCompare, listView }) {
  const Icon = catIcon(p.cat);
  if (listView) {
    return (
      <div className="im-card" style={{ display: "flex", gap: 18, padding: 16, alignItems: "center" }}>
        <div style={{ width: 108, flexShrink: 0 }}>
          <ProductVisual colors={p.img} icon={Icon} size={0.75} />
        </div>
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onOpen(p)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            {p.badge && <span className={`im-badge ${p.badge === "Nuevo" ? "im-badge-new" : p.badge === "Promoción" ? "im-badge-promo" : "im-badge-featured"}`}>{p.badge}</span>}
            <span className="im-ink-faint" style={{ fontSize: 12 }}>{p.catName} · {p.brand}</span>
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
          <div className="im-ink-faint" style={{ fontSize: 12.5 }}>{p.usage} <StockBadge stock={p.stock} /></div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="im-mono" style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{p.price ? formatQ(p.price) : "Cotizar"}</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button onClick={() => toggleFav(p.id)} className={`im-btn-icon im-focus ${isFav ? "active" : ""}`} style={{ width: 32, height: 32 }} aria-label="Favorito"><Heart size={14} fill={isFav ? "currentColor" : "none"} /></button>
            <button onClick={() => toggleCompare(p.id)} className={`im-btn-icon im-focus ${isCompare ? "active" : ""}`} style={{ width: 32, height: 32 }} aria-label="Comparar"><Scale size={14} /></button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="im-card" style={{ padding: 14, display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", cursor: "pointer" }} onClick={() => onOpen(p)}>
        <ProductVisual colors={p.img} icon={Icon} />
        {p.badge && <span className={`im-badge ${p.badge === "Nuevo" ? "im-badge-new" : p.badge === "Promoción" ? "im-badge-promo" : "im-badge-featured"}`} style={{ position: "absolute", top: 10, left: 10 }}>{p.badge}</span>}
        <button onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }} className={`im-btn-icon im-focus ${isFav ? "active" : ""}`} style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30 }} aria-label="Favorito">
          <Heart size={13} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      <div style={{ paddingTop: 14, cursor: "pointer", flex: 1 }} onClick={() => onOpen(p)}>
        <div className="im-ink-faint" style={{ fontSize: 11.5, marginBottom: 4 }}>{p.catName} · {p.brand}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.35, marginBottom: 6, minHeight: 38 }} className="im-line-clamp-2">{p.name}</div>
        <div className="im-ink-faint" style={{ fontSize: 11.5, marginBottom: 10 }}>{p.usage} <StockBadge stock={p.stock} /></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
        <span className="im-mono" style={{ fontSize: 14.5, fontWeight: 600 }}>{p.price ? formatQ(p.price) : "Cotizar"}</span>
        <button onClick={() => toggleCompare(p.id)} className={`im-btn-icon im-focus ${isCompare ? "active" : ""}`} style={{ width: 30, height: 30 }} aria-label="Comparar"><Scale size={13} /></button>
      </div>
    </div>
  );
}

function ProductRow({ title, eyebrow, desc, products, onSeeAll, onOpen, favorites = [], toggleFav, compareList = [], toggleCompare }) {
  return (
    <section className="im-container" style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26, gap: 20 }}>
        <SectionHeading eyebrow={eyebrow} title={title} desc={desc} />
        <button onClick={onSeeAll} className="im-btn im-btn-outline im-focus" style={{ padding: "10px 18px", fontSize: 13.5, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
          Ver todo <ArrowRight size={14} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="im-prod-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            p={p}
            onOpen={onOpen}
            isFav={favorites.includes(p.id)}
            toggleFav={toggleFav}
            isCompare={compareList.includes(p.id)}
            toggleCompare={toggleCompare}
          />
        ))}
      </div>
      <style>{`
        @media (max-width: 980px) { .im-prod-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .im-prod-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

/* =========================================================================
   SECTORS / SERVICES
   ========================================================================= */

function Sectors() {
  return (
    <section id="sectores" className="im-bg-soft" style={{ padding: "56px 0" }}>
      <div className="im-container">
        <SectionHeading eyebrow="A quién servimos" title="Sectores que atendemos" align="center" desc="Del hospital de tercer nivel al consultorio independiente." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 32 }} className="im-sector-grid">
          {SECTORS.map((s) => (
            <div key={s.name} className="im-card im-surface" style={{ padding: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--teal-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <s.icon size={19} style={{ color: "var(--teal)" }} strokeWidth={1.75} />
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 6 }}>{s.name}</div>
              <div className="im-ink-soft" style={{ fontSize: 13.5, lineHeight: 1.55 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .im-sector-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .im-sector-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function Services({ openQuote }) {
  return (
    <section id="servicios" className="im-container" style={{ padding: "56px 24px" }}>
      <SectionHeading eyebrow="Más que venta" title="Servicios" desc="Acompañamos el equipo durante todo su ciclo de vida." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginTop: 30 }} className="im-serv-grid">
        {SERVICES.map((s) => (
          <div key={s.name} className="im-card" style={{ padding: 20 }}>
            <s.icon size={22} className="im-primary" strokeWidth={1.6} style={{ marginBottom: 14 }} />
            <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 6 }}>{s.name}</div>
            <div className="im-ink-soft" style={{ fontSize: 13, lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, textAlign: "center" }}>
        <button onClick={() => openQuote(null)} className="im-btn im-btn-primary im-focus" style={{ padding: "12px 24px", fontSize: 14.5 }}>Hablar con un asesor</button>
      </div>
      <style>{`
        @media (max-width: 980px) { .im-serv-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 620px) { .im-serv-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </section>
  );
}

/* =========================================================================
   TESTIMONIALS / BLOG / FAQ / CONTACT
   ========================================================================= */

function Testimonials() {
  return (
    <section className="im-bg-soft" style={{ padding: "56px 0" }}>
      <div className="im-container">
        <SectionHeading eyebrow="Casos de éxito" title="Instituciones que confían en nosotros" align="center" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 32 }} className="im-test-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="im-card im-surface" style={{ padding: 24 }}>
              <Quote size={20} className="im-primary" style={{ marginBottom: 14, opacity: 0.5 }} />
              <p style={{ fontSize: 14.5, lineHeight: 1.6, marginBottom: 18 }}>"{t.quote}"</p>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
              <div className="im-ink-faint" style={{ fontSize: 12.5 }}>{t.org}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .im-test-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function Blog() {
  return (
    <section className="im-container" style={{ padding: "56px 24px" }}>
      <SectionHeading eyebrow="Recursos" title="Blog" desc="Guías prácticas para elegir, mantener y aprovechar mejor su equipo." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 28 }} className="im-blog-grid">
        {BLOG_POSTS.map((b, i) => (
          <div key={i} className="im-card" style={{ padding: 20, cursor: "pointer" }}>
            <div style={{ height: 120, borderRadius: 10, background: `linear-gradient(135deg, var(--primary-soft), var(--teal-soft))`, marginBottom: 16 }} />
            <span className="im-mono im-primary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em" }}>{b.tag} · {b.read}</span>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8, lineHeight: 1.4 }}>{b.title}</div>
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 860px) { .im-blog-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section className="im-bg-soft" style={{ padding: "56px 0" }}>
      <div className="im-container" style={{ maxWidth: 760 }}>
        <SectionHeading eyebrow="Dudas frecuentes" title="Preguntas frecuentes" align="center" />
        <div style={{ marginTop: 28 }}>
          {FAQS.map((f, i) => (
            <div key={i} className="im-border-b" style={{ padding: "18px 4px" }}>
              <button onClick={() => setOpenIdx(openIdx === i ? -1 : i)} className="im-focus" style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{f.q}</span>
                <ChevronDown size={17} className="im-ink-faint" style={{ transform: openIdx === i ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0, marginLeft: 12 }} />
              </button>
              {openIdx === i && <p className="im-ink-soft" style={{ fontSize: 14, lineHeight: 1.65, marginTop: 12, maxWidth: 640 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ openQuote }) {
  return (
    <section id="contacto" className="im-container" style={{ padding: "56px 24px" }}>
      <SectionHeading eyebrow="Contacto" title="Hablemos de su próximo proyecto" desc="Escríbanos y un asesor especializado le contactará en menos de 24 horas hábiles." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 32 }} className="im-contact-grid">
        <div className="im-card" style={{ padding: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={17} className="im-primary" /></div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Oficina central</div>
              <div className="im-ink-soft" style={{ fontSize: 13.5 }}>Zona 10, Ciudad de Guatemala</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--teal-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Phone size={17} style={{ color: "var(--teal)" }} /></div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Teléfono / WhatsApp</div>
              <div className="im-ink-soft im-mono" style={{ fontSize: 13.5 }}>+502 2200 0000</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--amber-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Mail size={17} style={{ color: "var(--amber)" }} /></div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Correo</div>
              <div className="im-ink-soft im-mono" style={{ fontSize: 13.5 }}>ventas@intermedic.gt</div>
            </div>
          </div>
          <button onClick={() => openQuote(null)} className="im-btn im-btn-primary im-focus" style={{ width: "100%", padding: "13px", fontSize: 14.5 }}>Solicitar cotización general</button>
        </div>
        <div className="im-card" style={{ position: "relative", overflow: "hidden", minHeight: 260 }}>
          <div className="im-scan-grid" />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <MapPin size={28} className="im-primary" />
            <span className="im-ink-faint im-mono" style={{ fontSize: 12 }}>Mapa · Zona 10, Guatemala</span>
            <span className="im-ink-faint" style={{ fontSize: 12 }}>Cobertura a nivel nacional</span>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 780px) { .im-contact-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* =========================================================================
   FOOTER
   ========================================================================= */

function Footer() {
  const cols = [
    { title: "Productos", items: CATEGORIES.slice(0, 5).map((c) => c.name) },
    { title: "Empresa", items: ["Nosotros", "Casos de éxito", "Blog", "Trabaja con nosotros"] },
    { title: "Soporte", items: ["Centro de ayuda", "Garantías", "Preguntas frecuentes", "Contacto"] },
  ];
  return (
    <footer className="im-border-t" style={{ background: "var(--bg-soft)", paddingTop: 52 }}>
      <div className="im-container im-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(3, 1fr)", gap: 32, paddingBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, var(--primary), var(--teal))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={15} color="#fff" />
            </div>
            <span className="im-display" style={{ fontSize: 17, fontWeight: 700 }}>INTERMEDIC</span>
          </div>
          <p className="im-ink-soft" style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 280, marginBottom: 18 }}>
            Distribución y venta de equipo médico, hospitalario y de laboratorio para instituciones y profesionales de la salud en Guatemala.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {["Suscribirse al boletín"].map(() => null)}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input placeholder="Su correo electrónico" className="im-input im-focus" style={{ flex: 1, padding: "10px 12px", fontSize: 13 }} />
            <button className="im-btn im-btn-primary im-focus" style={{ padding: "0 16px", fontSize: 13 }}>Suscribir</button>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".03em" }}>{c.title}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {c.items.map((it) => (
                <li key={it}><a href="#" className="im-ink-soft im-focus" style={{ fontSize: 13.5, textDecoration: "none" }}>{it}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="im-border-t" style={{ padding: "18px 0" }}>
        <div className="im-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span className="im-ink-faint" style={{ fontSize: 12.5 }}>© 2026 Intermedic, Guatemala. Todos los derechos reservados.</span>
          <div style={{ display: "flex", gap: 18 }}>
            <a href="#" className="im-ink-faint im-focus" style={{ fontSize: 12.5, textDecoration: "none" }}>Privacidad</a>
            <a href="#" className="im-ink-faint im-focus" style={{ fontSize: 12.5, textDecoration: "none" }}>Términos</a>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 860px) { .im-footer-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </footer>
  );
}

/* =========================================================================
   CATALOG PAGE
   ========================================================================= */

function FilterGroup({ title, options, selected, onToggle }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="im-border-b" style={{ padding: "16px 0" }}>
      <button onClick={() => setCollapsed(!collapsed)} className="im-focus" style={{ display: "flex", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", marginBottom: collapsed ? 0 : 12 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</span>
        <ChevronDown size={15} className="im-ink-faint" style={{ transform: collapsed ? "rotate(-90deg)" : "none", transition: "transform .2s" }} />
      </button>
      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <label key={opt} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", fontSize: 13.5 }}>
                <span onClick={() => onToggle(opt)} className={`im-checkbox ${checked ? "checked" : ""}`}>{checked && <Check size={11} color="#fff" strokeWidth={3} />}</span>
                <span className="im-ink-soft" style={{ color: checked ? "var(--ink)" : undefined }}>{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CatalogPage({ search, setSearch, filters, toggleFilter, clearFilters, sort, setSort, gridView, setGridView, onOpen, favorites, toggleFav, compareList, toggleCompare }) {
  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      const q = search.toLowerCase();
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.catName.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      const matchesCat = filters.category.length === 0 || filters.category.includes(p.catName);
      const matchesBrand = filters.brand.length === 0 || filters.brand.includes(p.brand);
      const matchesUsage = filters.usage.length === 0 || filters.usage.includes(p.usage);
      const matchesAvail = filters.availability.length === 0 || filters.availability.includes(p.stock === "in" ? "En stock" : "Pocas unidades");
      return matchesQ && matchesCat && matchesBrand && matchesUsage && matchesAvail;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999));
    if (sort === "price-desc") list = [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [search, filters, sort]);

  const activeFilterCount = filters.category.length + filters.brand.length + filters.usage.length + filters.availability.length;

  return (
    <div className="im-container im-fade-up" style={{ padding: "32px 24px 64px" }}>
      <div className="im-ink-faint" style={{ fontSize: 13, marginBottom: 8 }}>Inicio / <span className="im-ink">Catálogo</span></div>
      <h1 className="im-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Catálogo de productos</h1>
      <div style={{ marginBottom: 24 }}>
        <SmartSearch value={search} onChange={setSearch} onSubmit={setSearch} variant="header" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32 }} className="im-catalog-grid">
        <aside>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><SlidersHorizontal size={14} /> Filtros</span>
            {activeFilterCount > 0 && <button onClick={clearFilters} className="im-primary im-focus" style={{ fontSize: 12.5, background: "none", border: "none", cursor: "pointer" }}>Limpiar ({activeFilterCount})</button>}
          </div>
          <FilterGroup title="Categoría" options={[...new Set(PRODUCTS.map((p) => p.catName))]} selected={filters.category} onToggle={(v) => toggleFilter("category", v)} />
          <FilterGroup title="Marca" options={[...new Set(PRODUCTS.map((p) => p.brand))]} selected={filters.brand} onToggle={(v) => toggleFilter("brand", v)} />
          <FilterGroup title="Uso" options={["Nuevo", "Reacondicionado"]} selected={filters.usage} onToggle={(v) => toggleFilter("usage", v)} />
          <FilterGroup title="Disponibilidad" options={["En stock", "Pocas unidades"]} selected={filters.availability} onToggle={(v) => toggleFilter("availability", v)} />
        </aside>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
            <span className="im-ink-soft" style={{ fontSize: 13.5 }}>{filtered.length} producto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="im-input im-focus" style={{ padding: "8px 10px", fontSize: 13 }}>
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name">Nombre (A–Z)</option>
              </select>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setGridView("grid")} className={`im-btn-icon im-focus ${gridView === "grid" ? "active" : ""}`} style={{ width: 34, height: 34 }} aria-label="Vista de cuadrícula"><Grid3x3 size={14} /></button>
                <button onClick={() => setGridView("list")} className={`im-btn-icon im-focus ${gridView === "list" ? "active" : ""}`} style={{ width: 34, height: 34 }} aria-label="Vista de lista"><List size={14} /></button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="im-card" style={{ padding: 60, textAlign: "center" }}>
              <Search size={28} className="im-ink-faint" style={{ marginBottom: 14 }} />
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Sin resultados</div>
              <div className="im-ink-soft" style={{ fontSize: 13.5 }}>Ajuste su búsqueda o quite algunos filtros.</div>
            </div>
          ) : (
            <div style={gridView === "grid" ? { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 } : { display: "flex", flexDirection: "column", gap: 12 }} className={gridView === "grid" ? "im-cat-prod-grid" : ""}>
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} onOpen={onOpen} isFav={favorites.includes(p.id)} toggleFav={toggleFav} isCompare={compareList.includes(p.id)} toggleCompare={toggleCompare} listView={gridView === "list"} />
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .im-catalog-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 860px) { .im-cat-prod-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .im-cat-prod-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

/* =========================================================================
   PRODUCT DETAIL SLIDE-OVER
   ========================================================================= */

function ProductDetail({ product, onClose, isFav, toggleFav, openQuote, related }) {
  const [tab, setTab] = useState("desc");
  if (!product) return null;
  const Icon = catIcon(product.cat);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div className="im-backdrop" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.5)" }} />
      <div className="im-slideover im-surface im-shadow-lg im-scrollbar-none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(560px, 100%)", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span className="im-ink-faint" style={{ fontSize: 13 }}>{product.catName}</span>
          <button onClick={onClose} className="im-btn-icon im-focus" style={{ width: 32, height: 32 }} aria-label="Cerrar"><X size={15} /></button>
        </div>

        <ProductVisual colors={product.img} icon={Icon} size={1.3} />

        <div style={{ display: "flex", gap: 8, margin: "18px 0 8px", flexWrap: "wrap" }}>
          {product.badge && <span className={`im-badge ${product.badge === "Nuevo" ? "im-badge-new" : product.badge === "Promoción" ? "im-badge-promo" : "im-badge-featured"}`}>{product.badge}</span>}
          <span className="im-ink-faint" style={{ fontSize: 12.5 }}>{product.brand} · {product.usage}</span>
        </div>
        <h2 className="im-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{product.name}</h2>
        <div className="im-mono" style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{product.price ? formatQ(product.price) : "Precio bajo cotización"}</div>

        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <button onClick={() => openQuote(product)} className="im-btn im-btn-primary im-focus" style={{ flex: 1, padding: "12px", fontSize: 14 }}>Solicitar cotización</button>
          <button onClick={() => toggleFav(product.id)} className={`im-btn im-btn-outline im-focus ${isFav ? "active" : ""}`} style={{ padding: "12px 16px" }}><Heart size={15} fill={isFav ? "currentColor" : "none"} /></button>
        </div>

        <div className="im-border-b" style={{ display: "flex", gap: 20, marginBottom: 18 }}>
          {[["desc", "Descripción"], ["specs", "Especificaciones"], ["docs", "Documentos"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="im-focus" style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0 12px", fontSize: 13.5, fontWeight: 600, color: tab === k ? "var(--primary)" : "var(--ink-faint)", borderBottom: tab === k ? "2px solid var(--primary)" : "2px solid transparent" }}>{l}</button>
          ))}
        </div>

        {tab === "desc" && (
          <div>
            <p className="im-ink-soft" style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{product.desc}</p>
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Truck size={15} className="im-primary" /><span style={{ fontSize: 13 }}>{product.delivery}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Package size={15} className="im-primary" /><span style={{ fontSize: 13 }}>{product.stock === "in" ? "En stock" : "Pocas unidades"}</span></div>
            </div>
          </div>
        )}
        {tab === "specs" && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {product.specs.map(([k, v]) => (
                <tr key={k} className="im-border-b">
                  <td className="im-ink-faint" style={{ padding: "10px 0", fontSize: 13, width: "42%" }}>{k}</td>
                  <td style={{ padding: "10px 0", fontSize: 13, fontWeight: 500 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "docs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Ficha técnica (PDF)", "Manual de usuario (PDF)"].map((d) => (
              <div key={d} className="im-card" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}><FileText size={16} className="im-ink-faint" /><span style={{ fontSize: 13.5 }}>{d}</span></div>
                <Download size={15} className="im-ink-faint" />
              </div>
            ))}
            <span className="im-ink-faint" style={{ fontSize: 12, marginTop: 4 }}>Disponible al solicitar cotización.</span>
          </div>
        )}

        {related.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 14 }}>Productos relacionados</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {related.map((r) => (
                <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 9, background: `linear-gradient(135deg, ${r.img[0]}, ${r.img[1]})`, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, fontWeight: 500 }} className="im-line-clamp-2">{r.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   QUOTE MODAL
   ========================================================================= */

function QuoteModal({ product, onClose }) {
  const [sent, setSent] = useState(false);
  if (product === undefined) return null;
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
            <p className="im-ink-soft" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 22 }}>Un asesor de Intermedic revisará su solicitud y le contactará en menos de 24 horas hábiles.</p>
            <button onClick={onClose} className="im-btn im-btn-outline im-focus" style={{ padding: "10px 22px", fontSize: 13.5 }}>Cerrar</button>
          </div>
        ) : (
          <>
            <Eyebrow>Solicitar cotización</Eyebrow>
            <h3 className="im-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{product ? product.name : "Cotización general"}</h3>
            <p className="im-ink-soft" style={{ fontSize: 13.5, marginBottom: 20 }}>Complete el formulario y le enviaremos una propuesta a la medida.</p>
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input required placeholder="Nombre completo" className="im-input im-focus" style={{ padding: "11px 14px", fontSize: 13.5 }} />
              <input required placeholder="Institución / empresa" className="im-input im-focus" style={{ padding: "11px 14px", fontSize: 13.5 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input required type="email" placeholder="Correo electrónico" className="im-input im-focus" style={{ flex: 1, padding: "11px 14px", fontSize: 13.5 }} />
                <input required type="tel" placeholder="Teléfono" className="im-input im-focus" style={{ flex: 1, padding: "11px 14px", fontSize: 13.5 }} />
              </div>
              <input type="number" min="1" placeholder="Cantidad estimada" className="im-input im-focus" style={{ padding: "11px 14px", fontSize: 13.5 }} />
              <textarea placeholder="Mensaje (opcional)" rows={3} className="im-input im-focus" style={{ padding: "11px 14px", fontSize: 13.5, resize: "vertical", fontFamily: "inherit" }} />
              <button type="submit" className="im-btn im-btn-primary im-focus" style={{ padding: "13px", fontSize: 14.5, marginTop: 6 }}>Enviar solicitud</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   COMPARE BAR
   ========================================================================= */

function CompareBar({ ids, clear, remove, openCompare }) {
  if (ids.length === 0) return null;
  const items = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 55, display: "flex", justifyContent: "center", padding: 16 }}>
      <div className="im-surface im-shadow-lg im-border" style={{ borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, maxWidth: "94vw", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><Scale size={15} className="im-primary" /> Comparar ({items.length}/3)</span>
        <div style={{ display: "flex", gap: 6 }}>
          {items.map((it) => (
            <div key={it.id} className="im-mono" style={{ fontSize: 11.5, background: "var(--bg-soft)", borderRadius: 8, padding: "5px 8px", display: "flex", alignItems: "center", gap: 6 }}>
              {it.name.slice(0, 18)}…
              <button onClick={() => remove(it.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><X size={11} /></button>
            </div>
          ))}
        </div>
        <button onClick={openCompare} disabled={items.length < 2} className="im-btn im-btn-primary im-focus" style={{ padding: "9px 16px", fontSize: 13 }}>Comparar</button>
        <button onClick={clear} className="im-btn im-btn-ghost im-focus" style={{ padding: "9px 12px", fontSize: 13 }}>Limpiar</button>
      </div>
    </div>
  );
}

function CompareModal({ ids, onClose }) {
  const items = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  if (!ids.length) return null;
  const allSpecKeys = [...new Set(items.flatMap((i) => i.specs.map(([k]) => k)))];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="im-backdrop" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,16,26,0.55)" }} />
      <div className="im-surface im-shadow-lg im-fade-up im-scrollbar-none" style={{ position: "relative", width: "min(820px,100%)", maxHeight: "86vh", overflow: "auto", borderRadius: 18, padding: 28 }}>
        <button onClick={onClose} className="im-btn-icon im-focus" style={{ position: "absolute", top: 18, right: 18, width: 30, height: 30 }} aria-label="Cerrar"><X size={14} /></button>
        <h3 className="im-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Comparar productos</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
            <thead>
              <tr>
                <td style={{ width: 140 }} />
                {items.map((it) => (
                  <td key={it.id} style={{ padding: "0 12px 16px", minWidth: 160 }}>
                    <ProductVisual colors={it.img} icon={catIcon(it.cat)} size={0.7} />
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }} className="im-line-clamp-2">{it.name}</div>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="im-border-b">
                <td className="im-ink-faint" style={{ fontSize: 12.5, padding: "10px 0" }}>Precio</td>
                {items.map((it) => <td key={it.id} className="im-mono" style={{ fontSize: 13, padding: "10px 12px", fontWeight: 600 }}>{it.price ? formatQ(it.price) : "Cotizar"}</td>)}
              </tr>
              <tr className="im-border-b">
                <td className="im-ink-faint" style={{ fontSize: 12.5, padding: "10px 0" }}>Marca</td>
                {items.map((it) => <td key={it.id} style={{ fontSize: 13, padding: "10px 12px" }}>{it.brand}</td>)}
              </tr>
              <tr className="im-border-b">
                <td className="im-ink-faint" style={{ fontSize: 12.5, padding: "10px 0" }}>Uso</td>
                {items.map((it) => <td key={it.id} style={{ fontSize: 13, padding: "10px 12px" }}>{it.usage}</td>)}
              </tr>
              {allSpecKeys.map((k) => (
                <tr key={k} className="im-border-b">
                  <td className="im-ink-faint" style={{ fontSize: 12.5, padding: "10px 0" }}>{k}</td>
                  {items.map((it) => {
                    const found = it.specs.find(([sk]) => sk === k);
                    return <td key={it.id} style={{ fontSize: 13, padding: "10px 12px" }}>{found ? found[1] : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN APP
   ========================================================================= */

export default function IntermedicApp() {
  const [dark, setDark] = useState(false);
  const [view, setView] = useState("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quoteFor, setQuoteFor] = useState(undefined);
  const [favorites, setFavorites] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [filters, setFilters] = useState({ category: [], brand: [], usage: [], availability: [] });
  const [sort, setSort] = useState("relevance");
  const [gridView, setGridView] = useState("grid");

  const goHome = () => { setView("home"); setMobileMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goCatalog = (catName) => {
    setView("catalog"); setMobileMenu(false);
    if (catName) setFilters((f) => ({ ...f, category: [catName] }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goCatalogByCatId = (catId) => {
    const c = CATEGORIES.find((c) => c.id === catId);
    goCatalog(c ? c.name : null);
  };
  const scrollHome = (id) => {
    if (view !== "home") { setView("home"); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60); }
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const handleHeroSearch = (q) => { setCatalogSearch(q); goCatalog(null); setFilters({ category: [], brand: [], usage: [], availability: [] }); };

  const toggleFav = (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const toggleCompare = (id) => setCompareList((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));
  const toggleFilter = (group, value) => setFilters((f) => ({ ...f, [group]: f[group].includes(value) ? f[group].filter((v) => v !== value) : [...f[group], value] }));
  const clearFilters = () => setFilters({ category: [], brand: [], usage: [], availability: [] });

  const openProduct = (p) => setSelectedProduct(p);
  const openQuote = (p) => setQuoteFor(p);

  const featured = PRODUCTS.filter((p) => p.badge === "Destacado");
  const nuevos = PRODUCTS.filter((p) => p.badge === "Nuevo").concat(PRODUCTS.filter((p) => !p.badge)).slice(0, 4);
  const promos = PRODUCTS.filter((p) => p.badge === "Promoción").concat(PRODUCTS.filter((p) => p.usage === "Reacondicionado")).filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i).slice(0, 4);

  return (
    <div className={`im-root${dark ? " im-dark" : ""}`}>
      <GlobalStyles />
      <Header dark={dark} setDark={setDark} view={view} goHome={goHome} goCatalog={() => goCatalog(null)} scrollHome={scrollHome} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} openQuote={openQuote} favCount={favorites.length} compareCount={compareList.length} />

      {view === "home" ? (
        <>
          <Hero search={search} setSearch={setSearch} onSearchSubmit={handleHeroSearch} />
          <TickDivider />
          <CategoryGrid onSelect={goCatalogByCatId} />
          <BrandStrip />
          <ProductRow
            eyebrow="Selección"
            title="Productos destacados"
            desc="Los equipos más solicitados por hospitales y clínicas."
            products={featured.length ? featured : PRODUCTS.slice(0, 4)}
            onSeeAll={() => goCatalog(null)}
            onOpen={openProduct}
            favorites={favorites}
            toggleFav={toggleFav}
            compareList={compareList}
            toggleCompare={toggleCompare}
          />
          <TickDivider />
          <ProductRow
            eyebrow="Recién llegados"
            title="Productos nuevos"
            desc="Lo último en incorporarse a nuestro catálogo."
            products={nuevos}
            onSeeAll={() => goCatalog(null)}
            onOpen={openProduct}
            favorites={favorites}
            toggleFav={toggleFav}
            compareList={compareList}
            toggleCompare={toggleCompare}
          />
          <ProductRow
            eyebrow="Aprovechar"
            title="Promociones y reacondicionados"
            desc="Equipo certificado por Intermedic, con garantía y mejor precio."
            products={promos.length ? promos : PRODUCTS.slice(4, 8)}
            onSeeAll={() => goCatalog(null)}
            onOpen={openProduct}
            favorites={favorites}
            toggleFav={toggleFav}
            compareList={compareList}
            toggleCompare={toggleCompare}
          />
          <Sectors />
          <Services openQuote={openQuote} />
          <Testimonials />
          <Blog />
          <FAQ />
          <Contact openQuote={openQuote} />
        </>
      ) : (
        <CatalogPage
          search={catalogSearch}
          setSearch={setCatalogSearch}
          filters={filters}
          toggleFilter={toggleFilter}
          clearFilters={clearFilters}
          sort={sort}
          setSort={setSort}
          gridView={gridView}
          setGridView={setGridView}
          onOpen={openProduct}
          favorites={favorites}
          toggleFav={toggleFav}
          compareList={compareList}
          toggleCompare={toggleCompare}
        />
      )}

      <Footer />

      {/* WhatsApp floating button */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); openQuote(null); }}
        className="im-focus"
        style={{ position: "fixed", bottom: compareList.length ? 96 : 24, right: 24, zIndex: 50, width: 54, height: 54, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(37,211,102,0.4)", transition: "bottom .2s ease" }}
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={24} color="#fff" fill="#fff" />
      </a>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isFav={favorites.includes(selectedProduct.id)}
          toggleFav={toggleFav}
          openQuote={openQuote}
          related={PRODUCTS.filter((p) => p.cat === selectedProduct.cat && p.id !== selectedProduct.id).slice(0, 3)}
        />
      )}

      <QuoteModal product={quoteFor} onClose={() => setQuoteFor(undefined)} />

      <CompareBar ids={compareList} clear={() => setCompareList([])} remove={(id) => setCompareList((c) => c.filter((x) => x !== id))} openCompare={() => setCompareOpen(true)} />
      {compareOpen && <CompareModal ids={compareList} onClose={() => setCompareOpen(false)} />}
    </div>
  );
}
