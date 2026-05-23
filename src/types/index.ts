export type DocumentType = "investigado" | "testigo" | "notificacion";

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

export type DocumentPayload = InvestigadoData | TestigoData | NotificacionData;

export type HistoryItem = {
  id: string;
  type: DocumentType;
  numero: string;
  nombre: string;
  generatedAt: string;
  payload: DocumentPayload;
};

export const documentLabels: Record<DocumentType, string> = {
  investigado: "Citación Investigado",
  testigo: "Citación Testigo",
  notificacion: "Notificación Policial",
};
