import { z } from "zod";
import { investigadoSchema } from "./investigadoSchema";

export const testigoSchema = investigadoSchema.extend({
  investigados: investigadoSchema.shape.nombre,
});

export type TestigoSchema = z.infer<typeof testigoSchema>;
