import type { InvestigadoData, NotificacionData, TestigoData } from "../types";

export const investigadoDefaults: InvestigadoData = {
  numero: "",
  nombre: "",
  domicilio: "",
  carpetaFiscal: "",
  fechaDiligencia: "",
  hora: "",
  delito: "",
  agraviado: "",
  descripcionHecho: "",
  fechaDocumento: "",
};

export const testigoDefaults: TestigoData = {
  numero: "",
  nombre: "",
  domicilio: "",
  carpetaFiscal: "",
  fechaDiligencia: "",
  hora: "",
  investigados: "",
  delito: "",
  agraviado: "",
  descripcionHecho: "",
  fechaDocumento: "",
};

export const notificacionDefaults: NotificacionData = {
  numero: "",
  nombre: "",
  domicilio: "",
  carpetaFiscal: "",
  delito: "",
  fechaDocumento: "",
  citados: [],
};
