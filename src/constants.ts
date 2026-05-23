import type { BaseCitation, DocumentPayload, DocumentType } from "./types";
import { FileText, Users, Bell, ClipboardList } from "lucide-react";
import { investigadoDefaults, testigoDefaults, notificacionDefaults } from "./store/documentDefaults";

export const suffix = "-2026-COMOPPOL/DIRNIC-DIRCOCOR-DIVINCAP-DEPDICC-IQTS";

export type CommonFields = Pick<BaseCitation, "numero" | "nombre" | "domicilio" | "carpetaFiscal" | "fechaDocumento">;

export type DocConfigItem = {
  key: DocumentType | "historial";
  label: string;
  href: string;
  icon: typeof FileText;
  color: string;
};

export const documents: DocConfigItem[] = [
  { key: "investigado", label: "Citación Investigado", href: "/editor/investigado", icon: FileText, color: "blue" },
  { key: "testigo",     label: "Citación Testigo",     href: "/editor/testigo",     icon: Users,    color: "emerald" },
  { key: "notificacion",label: "Notificación Policial",href: "/editor/notificacion",icon: Bell,    color: "amber" },
];

export const documentTypes: DocumentType[] = ["investigado", "testigo", "notificacion"];

export const moduleData = documents.filter((d): d is Extract<DocConfigItem, { key: DocumentType }> => d.key !== "historial");

export const sidebarItems: DocConfigItem[] = [
  ...documents,
  { key: "historial",  label: "Historial",  href: "/historial",  icon: ClipboardList, color: "slate" },
];

export const documentDefaults: Record<DocumentType, DocumentPayload> = {
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
