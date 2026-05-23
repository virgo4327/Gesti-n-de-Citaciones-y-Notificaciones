import type { InvestigadoData, NotificacionData, TestigoData } from "../types";

export const investigadoDefaults: InvestigadoData = {
  numero: "434",
  nombre: "ROBERTO PINEDO HIDALGO",
  domicilio: "AV. GRAU N° 1840 - IQUITOS",
  carpetaFiscal: "2506015500-2026-132-0",
  fechaDiligencia: "28OCT2025",
  hora: "08.30",
  delito: "COLUSIÓN AGRAVADA",
  agraviado: "GOBIERNO REGIONAL DE LORETO",
  descripcionHecho: "por hechos materia de investigación vinculados a presuntas irregularidades en la contratación pública.",
  fechaDocumento: "21 de octubre",
};

export const testigoDefaults: TestigoData = {
  numero: "417",
  nombre: "MARÍA VILLACORTA RÍOS",
  domicilio: "JR. PUTUMAYO N° 524 - IQUITOS",
  carpetaFiscal: "2506015500-2026-118-0",
  fechaDiligencia: "30OCT2025",
  hora: "10.00",
  investigados: "FUNCIONARIOS POR IDENTIFICAR",
  delito: "NEGOCIACIÓN INCOMPATIBLE",
  agraviado: "ESTADO PERUANO",
  descripcionHecho: "a fin de recepcionar su manifestación testimonial en torno a los hechos investigados.",
  fechaDocumento: "21 de octubre",
};

export const notificacionDefaults: NotificacionData = {
  numero: "148",
  nombre: "CARLOS IRARICA FLORES",
  domicilio: "CALLE AREQUIPA N° 321 - IQUITOS",
  carpetaFiscal: "2506015500-2026-096-0",
  delito: "PECULADO DOLOSO",
  fechaDocumento: "21 de octubre",
  citados: [{ id: "row-1", nombres: "CARLOS IRARICA FLORES", condicion: "TESTIGO", fecha: "28OCT2025", hora: "09.00" }],
};
