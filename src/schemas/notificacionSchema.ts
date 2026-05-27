import { z } from "zod";

const fechaRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const citedRowSchema = z.object({
  id: z.string(),
  nombres: z.string().min(3, "Nombre requerido"),
  condicion: z.enum(["TESTIGO", "INVESTIGADO"]),
  fecha: z.string().min(1, "Fecha requerida").regex(fechaRegex, "Formato: DD/MM/AAAA"),
  hora: z.string().min(1, "Hora requerida").regex(horaRegex, "Formato: HH:MM (24h)"),
});

export const notificacionSchema = z.object({
  numero: z.string().regex(/^\d+$/, "Solo números"),
  nombre: z.string().min(3, "Nombre requerido"),
  domicilio: z.string().min(3, "Domicilio requerido"),
  carpetaFiscal: z.string().min(1, "Carpeta fiscal requerida"),
  delito: z.string().min(3, "Delito requerido"),
  fechaDocumento: z.string().min(1, "Fecha requerida").regex(fechaRegex, "Formato: DD/MM/AAAA"),
  citados: z.array(citedRowSchema).min(1, "Agrega al menos una fila"),
});

export type NotificacionSchema = z.infer<typeof notificacionSchema>;
