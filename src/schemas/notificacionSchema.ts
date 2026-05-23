import { z } from "zod";

export const citedRowSchema = z.object({
  id: z.string(),
  nombres: z.string().min(3, "Nombre requerido"),
  condicion: z.enum(["TESTIGO", "INVESTIGADO"]),
  fecha: z.string().min(1, "Fecha requerida"),
  hora: z.string().min(1, "Hora requerida"),
});

export const notificacionSchema = z.object({
  numero: z.string().regex(/^\d+$/, "Solo números"),
  nombre: z.string().min(3, "Nombre requerido"),
  domicilio: z.string().min(3, "Domicilio requerido"),
  carpetaFiscal: z.string().min(1, "Carpeta fiscal requerida"),
  delito: z.string().min(3, "Delito requerido"),
  fechaDocumento: z.string().min(1, "Fecha requerida"),
  citados: z.array(citedRowSchema).min(1, "Agrega al menos una fila"),
});

export type NotificacionSchema = z.infer<typeof notificacionSchema>;
