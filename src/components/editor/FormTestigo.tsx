import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { testigoSchema, type TestigoSchema } from "../../schemas/testigoSchema";
import type { TestigoData } from "../../types";
import { upper } from "../../lib/utils";
import { testigoDefaults } from "../../store/documentDefaults";
import { Field } from "./FormFields";
import { Button } from "../ui/button";

type Props = {
  initial?: Partial<TestigoData>;
  onValid: (data: TestigoData) => void;
};

export interface FormTestigoHandle {
  reset: () => void;
}

const FormTestigo = forwardRef<FormTestigoHandle, Props>(({ initial, onValid }, ref) => {
  const { register, handleSubmit, formState: { errors }, reset: formReset } = useForm<TestigoSchema>({
    resolver: zodResolver(testigoSchema),
    defaultValues: { ...testigoDefaults, ...initial },
  });

  useImperativeHandle(ref, () => ({
    reset: () => formReset({ ...testigoDefaults }),
  }));

  const uppercase = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.currentTarget.value = upper(event.currentTarget.value);
  };

  return (
    <form id="document-form" onSubmit={handleSubmit((data) => onValid(data))} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Número" name="numero" register={register} errors={errors} placeholder="Ej: 002" />
        <Field label="Nombre completo" name="nombre" register={register} errors={errors} onInput={uppercase} placeholder="Ej: MARÍA LÓPEZ TORRES" />
        <Field label="Domicilio" name="domicilio" register={register} errors={errors} onInput={uppercase} placeholder="Ej: Av. Grau N° 456 - Iquitos" />
        <Field label="Referencia/Carpeta Fiscal N°" name="carpetaFiscal" register={register} errors={errors} placeholder="Ej: 2026-00456" />
        <Field label="Fecha diligencia" name="fechaDiligencia" register={register} errors={errors} placeholder="Ej: 22 de Mayo" />
        <Field label="Hora diligencia" name="hora" register={register} errors={errors} placeholder="Ej: 14:00" />
        <Field label="Delito" name="delito" register={register} errors={errors} onInput={uppercase} placeholder="Ej: PECULADO" />
        <Field label="Agraviado" name="agraviado" register={register} errors={errors} onInput={uppercase} placeholder="Ej: MUNICIPALIDAD PROVINCIAL" />
        <Field label="Descripción del hecho" name="descripcionHecho" register={register} errors={errors} onInput={uppercase} placeholder="Describa los hechos investigados..." className="md:col-span-2" textarea />
        <Field label="Fecha de documento" name="fechaDocumento" register={register} errors={errors} placeholder="Ej: 15 de Mayo" />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit">Actualizar vista previa</Button>
      </div>
    </form>
  );
});

FormTestigo.displayName = "FormTestigo";
export default FormTestigo;
