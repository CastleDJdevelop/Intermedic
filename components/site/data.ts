/**
 * Contenido presentacional del sitio que NO vive en el modelo Product/Company
 * (categorías con su ícono, sectores, servicios, testimonios, blog, FAQ).
 * Portado literalmente de reference/intermedic-prototipo.jsx.
 *
 * Los PRODUCTOS reales NO están aquí — vienen de data/db.json vía lib/db.ts.
 */
import {
  Package, Stethoscope, BedDouble, Scissors, Activity, FlaskConical, Syringe,
  HeartPulse, Bone, Heart, Monitor, ShieldCheck, Wind, Shirt, Plus,
  Building2, Smile, PawPrint, Microscope, User, Users, Wrench, Headphones,
  Truck, GraduationCap, type LucideIcon,
} from "lucide-react";

export interface CategoryDef {
  id: string;
  name: string;
  icon: LucideIcon;
}

/** El nombre debe coincidir con Product.category en data/db.json. */
export const CATEGORIES: CategoryDef[] = [
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

export function catIcon(categoryName: string | undefined): LucideIcon {
  const c = CATEGORIES.find((c) => c.name === categoryName);
  return c ? c.icon : Package;
}

export const BRANDS = ["Mindray", "Philips", "GE Healthcare", "Dräger", "B. Braun", "Welch Allyn", "Getinge", "3M"];

export const SECTORS = [
  { name: "Hospitales", icon: Building2, desc: "Equipamiento integral para áreas críticas, hospitalización y quirófano." },
  { name: "Clínicas y consultorios", icon: Stethoscope, desc: "Soluciones de diagnóstico y mobiliario para la práctica ambulatoria." },
  { name: "Odontólogos", icon: Smile, desc: "Instrumental e insumos específicos para consultorio dental." },
  { name: "Veterinarios", icon: PawPrint, desc: "Equipo de diagnóstico y quirúrgico adaptado a medicina veterinaria." },
  { name: "Laboratorios", icon: Microscope, desc: "Instrumentación analítica y de procesamiento de muestras." },
  { name: "Pacientes y particulares", icon: User, desc: "Equipo de cuidado y movilidad para el hogar." },
];

export const SERVICES = [
  { name: "Asesoría especializada", icon: Users, desc: "Acompañamiento técnico para elegir el equipo correcto según su presupuesto y necesidad clínica." },
  { name: "Mantenimiento", icon: Wrench, desc: "Planes de mantenimiento preventivo y correctivo con técnicos certificados." },
  { name: "Soporte técnico", icon: Headphones, desc: "Atención postventa directa, con tiempos de respuesta definidos por contrato." },
  { name: "Instalación", icon: Truck, desc: "Instalación y puesta en marcha de equipo en sitio, en todo el país." },
  { name: "Capacitación", icon: GraduationCap, desc: "Capacitación al personal clínico y técnico para el uso correcto del equipo." },
];

export const TESTIMONIALS = [
  { quote: "El tiempo de respuesta y el soporte postventa marcaron la diferencia frente a otros proveedores que ya conocíamos.", name: "Jefa de Compras", org: "Hospital Privado del Valle" },
  { quote: "Nos ayudaron a planificar el reemplazo de todo el equipo de monitoreo sin detener la operación del área.", org: "Clínica San Rafael", name: "Coordinador de Bioseguridad" },
  { quote: "La asesoría técnica antes de comprar fue tan valiosa como el equipo mismo.", org: "Laboratorio Clínico Central", name: "Gerente de Operaciones" },
];

export const BLOG_POSTS = [
  { title: "Cómo elegir el monitor de signos vitales adecuado para su clínica", tag: "Guías", read: "6 min" },
  { title: "Mantenimiento preventivo: la clave para alargar la vida útil de su equipo", tag: "Mantenimiento", read: "4 min" },
  { title: "Diagnóstico portátil: la tendencia que está llegando a más consultorios", tag: "Tendencias", read: "5 min" },
];

export const FAQS = [
  { q: "¿Cómo solicito una cotización?", a: "Puede solicitarla directamente desde la ficha de cada producto, desde el catálogo, o escribiéndonos por WhatsApp. Respondemos la mayoría de cotizaciones en menos de 24 horas hábiles." },
  { q: "¿Cuál es el tiempo de entrega?", a: "Depende del equipo: los insumos y mobiliario en bodega se entregan en 2 a 5 días hábiles; el equipo especializado de importación puede tomar de 10 a 20 días hábiles. El tiempo estimado aparece en cada ficha de producto." },
  { q: "¿Qué significa 'equipo reacondicionado'?", a: "Es equipo usado que pasó por un proceso de revisión, limpieza, calibración y certificación técnica interna antes de salir a la venta, con garantía propia de Intermedic." },
  { q: "¿Ofrecen garantía?", a: "Sí. El equipo nuevo conserva la garantía del fabricante; el equipo reacondicionado incluye garantía de Intermedic según el tipo de producto." },
  { q: "¿Dan cobertura fuera de la capital?", a: "Sí, distribuimos, instalamos y damos soporte técnico en todo Guatemala." },
];

export const formatQ = (n: number) => `Q ${n.toLocaleString("es-GT")}`;
