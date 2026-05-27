import { z } from "zod";

const fechaRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const investigadoSchema = z.object({
  numero: z.string().regex(/^\d+$/, "Solo números"),
  nombre: z.string().min(3, "Nombre requerido"),
  domicilio: z.string().min(3, "Domicilio requerido"),
  carpetaFiscal: z.string().min(1, "Carpeta fiscal requerida"),
  fechaDiligencia: z.string().min(1, "Fecha requerida").regex(fechaRegex, "Formato: DD/MM/AAAA"),
  hora: z.string().min(1, "Hora requerida").regex(horaRegex, "Formato: HH:MM (24h)"),
  delito: z.string().min(3, "Delito requerido"),
  agraviado: z.string().min(3, "Agraviado requerido"),
  descripcionHecho: z.string().min(10, "Describe el hecho"),
  fechaDocumento: z.string().min(1, "Fecha requerida").regex(fechaRegex, "Formato: DD/MM/AAAA"),
});

export type InvestigadoSchema = z.infer<typeof investigadoSchema>;
