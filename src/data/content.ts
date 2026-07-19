/**
 * Contenido central del sitio — Solución créditicia.
 * Toda la información real (teléfonos, correo, dirección, productos)
 * proviene del sitio original; los componentes solo consumen estos datos.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface TrustItem {
  icon: string;
  title: string;
  description: string;
}

export type CreditVariant = "featured" | "light" | "dark";

export interface CreditProduct {
  id: string;
  icon: string;
  image: string;
  title: string;
  description: string;
  bullets: string[];
  variant: CreditVariant;
  cta: string;
}

export interface ChecklistItem {
  text: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContactChannel {
  icon: string;
  label: string;
  value: string;
  href?: string;
}

export interface SimulatorConfig {
  amountMin: number;
  amountMax: number;
  amountStep: number;
  amountDefault: number;
  yearsMin: number;
  yearsMax: number;
  yearsDefault: number;
  rateMin: number;
  rateMax: number;
  rateDefault: number;
}

export const brand = {
  name: "Solución créditicia",
  tagline: "Personal y empresarial",
  logoPrimary: "/brand/logo-primary.png",
  logoNavySquare: "/brand/logo-navy-square.png",
  logoLight: "/brand/logo-light.png",
  logoLightSquare: "/brand/logo-light-square.png",
} as const;

export const navLinks: NavLink[] = [
  { label: "Sobre Nosotros", href: "#sobre-nosotros" },
  { label: "Créditos", href: "#creditos" },
  { label: "Simulador", href: "#simulador" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "FAQ", href: "#faq" },
];

export const hero = {
  eyebrow: "Excelencia Financiera",
  titleStart: "Somos tu mejor opción, a nuestro lado siempre ",
  titleAccent: "alcanzarás tus metas",
  titleEnd: ".",
  subtitle:
    "Soluciones de crédito estructuradas para el crecimiento de tu patrimonio y negocio, con asesoría crediticia personal y empresarial de ",
  subtitleAccent: "primer nivel",
  ctaPrimary: { label: "Simular Crédito", href: "#simulador" },
  ctaSecondary: { label: "Agendar Asesoría", href: "#contacto" },
  image: "/photos/hero.jpg",
} as const;

export const trustItems: TrustItem[] = [
  {
    icon: "verified",
    title: "Transparencia",
    description: "Procesos claros y condiciones excepcionales desde el primer día.",
  },
  {
    icon: "handshake",
    title: "Compromiso",
    description: "Acompañamiento integral en cada etapa de tu desarrollo.",
  },
  {
    icon: "shield",
    title: "Confianza",
    description: "Respaldados por la solidez de instituciones del mercado financiero.",
  },
];

export const credits: CreditProduct[] = [
  {
    id: "empresarial",
    image: "/photos/empresarial.jpg",
    icon: "domain",
    title: "Crédito Empresarial",
    description:
      "Capital para empresas con tasa anual fija y congelada, plazos amplios y asesoría personalizada.",
    bullets: [
      "Montos referenciales hasta $5 millones de pesos.",
      "Plazo de pago hasta 20 años, sujeto a evaluación.",
      "Asesoría para estructurar condiciones competitivas.",
    ],
    variant: "featured",
    cta: "Conocer más",
  },
  {
    id: "personal",
    image: "/photos/credit-personal.jpg",
    icon: "person",
    title: "Crédito Personal",
    description:
      "Liquidez para proyectos personales con trámite ágil, mínimos requisitos y pagos mensuales fijos.",
    bullets: [
      "De $10,000 a $40,000.",
      "Plazos de 12 a 36 meses.",
      "Sin penalización por pagos anticipados.",
    ],
    variant: "light",
    cta: "Solicitar evaluación",
  },
  {
    id: "negocio",
    image: "/photos/credit-negocio.jpg",
    icon: "storefront",
    title: "Crédito a Negocio",
    description:
      "Apoyo para negocio propio con opciones de inversión y orientación estratégica.",
    bullets: [
      "De $50,000 a $2,000,000.",
      "Negocio con al menos 1 año de antigüedad.",
      "Estados de cuenta de los últimos 2 meses.",
    ],
    variant: "dark",
    cta: "Impulsar mi negocio",
  },
  {
    id: "hipotecario",
    image: "/photos/credit-hipotecario.jpg",
    icon: "real_estate_agent",
    title: "Crédito Hipotecario",
    description:
      "Crédito simple con garantía hipotecaria para adquirir vivienda nueva o usada.",
    bullets: [
      "Esquemas ajustados a tus necesidades.",
      "Acompañamiento en análisis y documentación.",
      "Opciones para comprar la casa que buscas.",
    ],
    variant: "light",
    cta: "Ver esquemas",
  },
  {
    id: "pyme",
    image: "/photos/credit-pyme.jpg",
    icon: "factory",
    title: "Crédito PyME",
    description:
      "Alternativas para pequeñas y medianas empresas con procesos claros y condiciones flexibles.",
    bullets: [
      "Persona física: 25 a 70 años e identificación vigente.",
      "Persona moral: acta constitutiva y poder notarial.",
      "Documentos financieros y constancia fiscal.",
    ],
    variant: "dark",
    cta: "Fortalecer mi empresa",
  },
  {
    id: "agricola",
    image: "/photos/credit-agricola.jpg",
    icon: "agriculture",
    title: "Crédito Agrícola",
    description:
      "Líneas para agricultores, ganaderos, apicultores y actividades agropecuarias.",
    bullets: [
      "Tasas preferenciales según perfil y destino.",
      "Capital de trabajo para operación y explotación.",
      "Cobertura de conceptos financiables hasta 80% o 90%.",
    ],
    variant: "light",
    cta: "Consultar planes",
  },
  {
    id: "cuenta-corriente",
    image: "/photos/credit-cuenta.jpg",
    icon: "credit_card",
    title: "Cuenta Corriente",
    description:
      "Crédito con fianza, aval y deuda solidaria para necesidades empresariales recurrentes.",
    bullets: [
      "Rango de $70,000 a $15,000,000.",
      "Liquidez para cubrir operación y crecimiento.",
      "Evaluación según capacidad y perfil.",
    ],
    variant: "dark",
    cta: "Conocer requisitos",
  },
];

export const about = {
  eyebrow: "Nuestra Labor",
  titleStart: "Comprometidos con tu ",
  titleAccent: "crecimiento",
  paragraphs: [
    "Ayudamos a personas con deudas y a empresas que necesitan capital a encontrar soluciones efectivas. Actuamos como puente entre quienes buscan apoyo económico y las instituciones que pueden otorgarlo.",
    "Nos enorgullece acompañar a nuestros clientes en la construcción de su patrimonio: analizamos cada caso y trabajamos de la mano contigo para estructurar las mejores condiciones.",
  ],
  checklist: [
    { text: "Revisamos tu caso para orientar la solicitud correcta." },
    {
      text: "Comparamos alternativas personales, empresariales, hipotecarias y agrícolas.",
    },
    { text: "Te acompañamos con requisitos, documentos y seguimiento." },
  ] satisfies ChecklistItem[],
  badge: {
    title: "Servicio ágil y transparente",
    subtitle: "Enfocado en bienestar financiero y opciones crediticias viables.",
  },
  cta: { label: "Hablar con un asesor", href: "#contacto" },
  image: "/photos/about.jpg",
} as const;

export const simulatorConfig: SimulatorConfig = {
  amountMin: 20_000,
  amountMax: 6_000_000,
  amountStep: 10_000,
  amountDefault: 250_000,
  yearsMin: 1,
  yearsMax: 20,
  yearsDefault: 3,
  rateMin: 12,
  rateMax: 30,
  rateDefault: 15,
};

export const contactEmail =
  "informacion@desarrollocrediticiopersonalyempresarial.com";

export const contactChannels: ContactChannel[] = [
  {
    icon: "call",
    label: "Línea Directa",
    value: "+52 (55) 93-14-65-04",
    href: "tel:+525593146504",
  },
  {
    icon: "chat",
    label: "WhatsApp",
    value: "+52 (55) 86-09-87-71",
    href: "https://wa.me/525586098771",
  },
  {
    icon: "mail",
    label: "Correo Electrónico",
    value: contactEmail,
    href: `mailto:${contactEmail}`,
  },
  {
    icon: "location_on",
    label: "Oficinas",
    value: "Calz. Gral. Mariano Escobedo 476, Anzures, Miguel Hidalgo, CDMX",
  },
];

export const serviceOptions: string[] = [
  "Crédito Personal",
  "Crédito a Negocio",
  "Crédito Hipotecario",
  "Crédito Empresarial",
  "Crédito PyME",
  "Crédito Agrícola",
  "Cuenta Corriente",
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Recibí orientación para obtener capital y expandir mi restaurante. El proceso fue claro y pude avanzar sin perder tiempo.",
    name: "María González",
    role: "Empresaria",
    initials: "MG",
  },
  {
    quote:
      "Necesitaba capital de trabajo para proyectos más grandes. La asesoría me ayudó a elegir una opción viable para mi actividad.",
    name: "Carlos Mendoza",
    role: "Consultor independiente",
    initials: "CM",
  },
  {
    quote:
      "Tenía deudas acumuladas y necesitaba orden. Me orientaron para consolidar y recuperar estabilidad financiera.",
    name: "Ana Rodríguez",
    role: "Dueña de negocio",
    initials: "AR",
  },
];

export const faqs: FaqItem[] = [
  {
    question: "¿Qué tipos de créditos pueden ayudarme a obtener?",
    answer:
      "Personales, empresariales, hipotecarios, agrícolas, de negocio, PyME y cuenta corriente.",
  },
  {
    question: "¿Qué documentos necesito?",
    answer:
      "Depende del producto, pero suelen solicitar identificación, comprobante de domicilio, ingresos, estados de cuenta, RFC y documentos de empresa cuando aplica.",
  },
  {
    question: "¿Cuánto tarda la aprobación?",
    answer:
      "Los créditos simples pueden revisarse en 24 a 48 horas; productos hipotecarios o empresariales requieren más tiempo por documentación y análisis.",
  },
  {
    question: "¿Qué ventaja tiene usar asesoría?",
    answer:
      "Se analiza tu perfil, se comparan alternativas y se acompaña la solicitud para mejorar la claridad del proceso.",
  },
  {
    question: "¿Pueden ayudarme si tengo deudas?",
    answer:
      "Sí. El enfoque incluye revisar tu situación, ordenar opciones y buscar soluciones acordes a tu capacidad y perfil.",
  },
];

export const location = {
  addressLines: [
    "Calz. Gral. Mariano Escobedo 476",
    "Chapultepec Morales, Anzures",
    "Miguel Hidalgo, CP 11590, CDMX",
  ],
  hours: [
    "Lunes a Viernes: 9:00 AM - 6:00 PM",
    "Sábados: 9:00 AM - 2:00 PM",
    "Domingos: Cerrado",
  ],
  mapEmbedUrl:
    "https://www.google.com/maps?q=Calz.+Gral.+Mariano+Escobedo+476,+Anzures,+Miguel+Hidalgo,+CDMX&output=embed",
} as const;

export const disclaimer =
  "Información para fines orientativos. Los montos, plazos, tasas y aprobaciones están sujetos a evaluación crediticia, documentación, políticas de cada institución y perfil del solicitante.";

export const footer = {
  description:
    "Especialistas en asesoría crediticia personal y empresarial para encontrar opciones de financiamiento adaptadas a tu perfil.",
  navigation: [
    { label: "Calculadora", href: "#simulador" },
    { label: "Créditos", href: "#creditos" },
    { label: "Contacto", href: "#contacto" },
    { label: "FAQ", href: "#faq" },
  ] satisfies NavLink[],
  copyright: `© ${new Date().getFullYear()} Solución créditicia. Todos los derechos reservados.`,
} as const;
