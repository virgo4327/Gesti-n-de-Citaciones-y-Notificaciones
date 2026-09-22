export type DocumentType =
  | "a2"
  | "a3"
  | "a4"
  | "a5"
  | "investigado"
  | "testigo"
  | "notificacion";

export type CitedRow = {
  id: string;
  nombres: string;
  condicion: "TESTIGO" | "INVESTIGADO";
  fecha: string;
  hora: string;
};

export type BaseCitation = {
  numero: string;
  nombre: string;
  domicilio: string;
  carpetaFiscal: string;
  delito: string;
  agraviado: string;
  descripcionHecho: string;
  fechaDiligencia: string;
  hora: string;
  fechaDocumento: string;
};

export type InvestigadoData = BaseCitation;
export type TestigoData = BaseCitation & { investigados: string };

export type NotificacionData = {
  numero: string;
  nombre: string;
  domicilio: string;
  carpetaFiscal: string;
  delito: string;
  fechaDocumento: string;
  citados: CitedRow[];
};

export type A2Data = {
  referencia: string;
  numero: string;
  nombre: string;
  dni: string;
  domicilio: string;
  distrito: string;
  provincia: string;
  departamento: string;
  celular: string;
  email: string;
  modalidadDelito: string;
  condicion: string;
  imputados: string;
  agraviado: string;
  citacion1: string;
  citacion2: string;
  citacion3: string;
  fechaDiligencia: string;
  horaDiligencia: string;
  fechaDocumento: string;
};

export type A3Data = {
  referencia: string;
  numero: string;
  nombre: string;
  dni: string;
  domicilio: string;
  distrito: string;
  provincia: string;
  departamento: string;
  celular: string;
  email: string;
  modalidadDelito: string;
  condicion: string;
  imputados: string;
  agraviado: string;
  citacion1: string;
  citacion2: string;
  citacion3: string;
  fechaDiligencia: string;
  horaDiligencia: string;
  fechaDocumento: string;
};

export type A4Data = {
  referencia: string;
  numero: string;
  nombre: string;
  dni: string;
  domicilio: string;
  distrito: string;
  provincia: string;
  departamento: string;
  celular: string;
  email: string;
  fechaDiligencia: string;
  horaDiligencia: string;
  fiscalia: string;
  delito: string;
  agraviado: string;
  fechaDocumento: string;
  disposicionFiscal: string;
  folios: string;
};

export type A5Data = {
  referencia: string;
  numero: string;
  nombre: string;
  dni: string;
  domicilio: string;
  distrito: string;
  provincia: string;
  departamento: string;
  celular: string;
  email: string;
  fechaDiligencia: string;
  horaDiligencia: string;
  fiscalia: string;
  delito: string;
  agraviado: string;
  merito: string;
  fechaDocumento: string;
  disposicionFiscal: string;
  folios: string;
};

export type DocumentPayload =
  | A2Data
  | A3Data
  | A4Data
  | A5Data
  | InvestigadoData
  | TestigoData
  | NotificacionData;

export type HistoryItem = {
  id: string;
  type: DocumentType;
  numero: string;
  nombre: string;
  generatedAt: string;
  payload: DocumentPayload;
};

export const documentLabels: Record<DocumentType, string> = {
  a2: "A2 - Citación Flagrancia",
  a3: "A3 - Citación Carpeta Fiscal",
  a4: "A4 - Notificación Flagrante Delito",
  a5: "A5 - Notificación Carpeta Fiscal",
  investigado: "Citación Investigado (Anterior)",
  testigo: "Citación Testigo (Anterior)",
  notificacion: "Notificación Policial (Anterior)",
};

export const documentCategory: Record<DocumentType, "Citación" | "Notificación"> = {
  a2: "Citación",
  a3: "Citación",
  a4: "Notificación",
  a5: "Notificación",
  investigado: "Citación",
  testigo: "Citación",
  notificacion: "Notificación",
};
