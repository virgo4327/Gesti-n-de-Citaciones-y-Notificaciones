import { z } from "zod";

export const investigadoSchema = z.object({
  numero: z.string().regex(/^\d+$/, "Solo números"),
  nombre: z.string().min(3, "Nombre requerido"),
  domicilio: z.string().min(3, "Domicilio requerido"),
  carpetaFiscal: z.string().min(1, "Carpeta fiscal requerida"),
  fechaDiligencia: z.string().min(1, "Fecha requerida"),
  hora: z.string().min(1, "Hora requerida"),
  delito: z.string().min(3, "Delito requerido"),
  agraviado: z.string().min(3, "Agraviado requerido"),
  descripcionHecho: z.string().min(10, "Describe el hecho"),
  fechaDocumento: z.string().min(1, "Fecha del documento requerida"),
});

export type InvestigadoSchema = z.infer<typeof investigadoSchema>;
