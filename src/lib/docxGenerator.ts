import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import type { DocumentType } from "../types";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"
];

export function parsearFechaDocumento(fechaStr?: string) {
  if (!fechaStr) {
    const hoy = new Date();
    return {
      diaDoc: String(hoy.getDate()).padStart(2, "0"),
      mesDoc: MESES[hoy.getMonth()],
      anioDoc: String(hoy.getFullYear()),
    };
  }

  // Expects DD/MM/AAAA or AAAA-MM-DD
  if (fechaStr.includes("/")) {
    const [d, m, y] = fechaStr.split("/");
    const mNum = parseInt(m, 10) - 1;
    return {
      diaDoc: d.padStart(2, "0"),
      mesDoc: MESES[mNum] || "setiembre",
      anioDoc: y || "2026",
    };
  } else if (fechaStr.includes("-")) {
    const [y, m, d] = fechaStr.split("-");
    const mNum = parseInt(m, 10) - 1;
    return {
      diaDoc: d.padStart(2, "0"),
      mesDoc: MESES[mNum] || "setiembre",
      anioDoc: y || "2026",
    };
  }

  return { diaDoc: "10", mesDoc: "setiembre", anioDoc: "2026" };
}

const TEMPLATE_FILES: Record<string, string> = {
  a2: "/plantillas/A2 - Citación (víctima, testigo, perito, depositario u otro) caso de flagrancia.docx",
  a3: "/plantillas/A3 - Citación (víctima, testigo, perito, depositario u otro) - Carpeta Fiscal.docx",
  a4: "/plantillas/A4 - Notificación - Denunciado - Flagrante Delito.docx",
  a5: "/plantillas/A5 - Notificación - Denunciado - Carpeta Fiscal.docx",
};

export async function generarWord(tipo: DocumentType, data: any, customFilename?: string): Promise<Blob> {
  const templatePath = TEMPLATE_FILES[tipo];
  if (!templatePath) {
    throw new Error(`No se encontró plantilla Word para el tipo de documento: ${tipo}`);
  }

  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`No se pudo cargar la plantilla Word desde ${templatePath}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const zip = new PizZip(arrayBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  const { diaDoc, mesDoc, anioDoc } = parsearFechaDocumento(data.fechaDocumento);

  const payload: Record<string, any> = {
    ...data,
    diaDoc,
    mesDoc,
    anioDoc,
  };

  doc.render(payload);

  const out = doc.getZip().generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const safeNum = (data.numero || "DOC").replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = customFilename || `${tipo.toUpperCase()}_Nro_${safeNum}.docx`;

  saveAs(out, filename);
  return out;
}
