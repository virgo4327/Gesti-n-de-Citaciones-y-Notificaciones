import type { DocumentPayload, DocumentType } from "./types";
import { FileText, Users, Bell, ClipboardList, CalendarDays, ShieldAlert } from "lucide-react";
import {
  a2Defaults,
  a3Defaults,
  a4Defaults,
  a5Defaults,
  investigadoDefaults,
  testigoDefaults,
  notificacionDefaults,
} from "./store/documentDefaults";

export const suffix = "- 2026-COMOPPOL/ DIRNIC-DIRCOCOR-DIVIDCAP-DEPDICC-IQUITOS";

export type DocConfigItem = {
  key: DocumentType | "historial" | "agenda";
  label: string;
  href: string;
  icon: typeof FileText;
  color: string;
  badge?: string;
  description?: string;
};

export const documents: DocConfigItem[] = [
  {
    key: "a2",
    label: "A2 - Citación Flagrancia",
    href: "/?doc=a2",
    icon: FileText,
    color: "blue",
    badge: "Flagrancia",
    description: "Citación a víctima, testigo, perito, depositario u otro en caso de flagrancia.",
  },
  {
    key: "a3",
    label: "A3 - Citación Carpeta Fiscal",
    href: "/?doc=a3",
    icon: Users,
    color: "emerald",
    badge: "Carpeta Fiscal",
    description: "Citación a víctima, testigo, perito, depositario u otro por Carpeta Fiscal.",
  },
  {
    key: "a4",
    label: "A4 - Notif. Flagrante Delito",
    href: "/?doc=a4",
    icon: Bell,
    color: "amber",
    badge: "Flagrante Delito",
    description: "Notificación policial a denunciado por flagrante delito.",
  },
  {
    key: "a5",
    label: "A5 - Notif. Carpeta Fiscal",
    href: "/?doc=a5",
    icon: ShieldAlert,
    color: "rose",
    badge: "Carpeta Fiscal",
    description: "Notificación policial a denunciado con disposición fiscal a folios.",
  },
];

export const documentTypes: DocumentType[] = ["a2", "a3", "a4", "a5"];

export const moduleData = documents.filter((d): d is Extract<DocConfigItem, { key: DocumentType }> => d.key !== "historial" && d.key !== "agenda");

export const sidebarItems: DocConfigItem[] = [
  { key: "agenda", label: "Agenda y Programación", href: "/agenda", icon: CalendarDays, color: "slate" },
  { key: "historial", label: "Historial de Emisiones", href: "/historial", icon: ClipboardList, color: "slate" },
];

export const documentDefaults: Record<DocumentType, DocumentPayload> = {
  a2: a2Defaults,
  a3: a3Defaults,
  a4: a4Defaults,
  a5: a5Defaults,
  investigado: investigadoDefaults,
  testigo: testigoDefaults,
  notificacion: notificacionDefaults,
};

export const legalItems = {
  investigado: [
    "Su presencia será en calidad de Investigado.",
    "Contará con la participación del representante del Ministerio Público.",
    "Tiene el derecho de asistir con abogado de su elección (o solicitar un abogado de la defensa pública, en calle Sargento Lores N° 702 - Iquitos), debiendo comunicar su decisión oportunamente.",
    "Tiene derecho a revisar con anticipación la Carpeta Fiscal que contiene las actuaciones de investigación desarrolladas hasta el momento, en horario de oficina y en esta sede policial, pudiendo hacerlo de manera personal o con participación de su abogado.",
    "La diligencia podrá realizarse vía zoom, meet, whatsapp, otros.",
  ],
  testigo: [
    "Su presencia será en calidad de Testigo.",
    "Contará con la participación del representante del Ministerio Público.",
    "Tiene el derecho de asistir con abogado de su elección si lo considera necesario.",
    "La diligencia se podrá realizar vía app zoom, meet, whatsapp, entre otros.",
  ],
} as const;
