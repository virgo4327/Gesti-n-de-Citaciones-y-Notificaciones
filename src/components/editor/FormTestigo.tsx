import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { testigoSchema, type TestigoSchema } from "../../schemas/testigoSchema";
import type { TestigoData } from "../../types";
import { testigoDefaults } from "../../store/documentDefaults";
import { Field } from "./FormFields";
import { Button } from "../ui/button";

type Props = {
  initial?: Partial<TestigoData>;
  onValid: (data: TestigoData) => void;
};

export interface FormTestigoHandle {
  reset: () => void;
  getValues: () => TestigoSchema;
}

const FormTestigo = forwardRef<FormTestigoHandle, Props>(({ initial, onValid }, ref) => {
  const form = useForm<TestigoSchema>({
    resolver: zodResolver(testigoSchema),
    defaultValues: { ...testigoDefaults, ...initial },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  useImperativeHandle(ref, () => ({
    reset: () => form.reset({ ...testigoDefaults }),
    getValues: () => form.getValues(),
  }));

  return (
    <form id="document-form" onSubmit={handleSubmit((data) => onValid(data))} className="grid gap-5">
       <div className="grid gap-4 md:grid-cols-2">
          <Field label="Número" name="numero" register={register} watch={watch} errors={errors} placeholder="Ej: 002" />
            <Field label="Nombre completo" name="nombre" register={register} watch={watch} errors={errors} placeholder="Ej: María LÓPEZ TORRES" />
           <Field label="Domicilio" name="domicilio" register={register} watch={watch} errors={errors} placeholder="Ej: Av. Grau N° 456 - Iquitos" />
           <Field label="Referencia/Carpeta Fiscal N°" name="carpetaFiscal" register={register} watch={watch} errors={errors} placeholder="Ej: 2026-00456" />
           <Field label="Investigados" name="investigados" register={register} watch={watch} errors={errors} placeholder="NOMBRES DE LOS INVESTIGADOS" />
           <Field label="Fecha diligencia" name="fechaDiligencia" register={register} watch={watch} errors={errors} type="date" placeholder="DD/MM/AAAA" />
           <Field label="Hora diligencia" name="hora" register={register} watch={watch} errors={errors} type="time" placeholder="HH:MM" />
           <Field label="Delito" name="delito" register={register} watch={watch} errors={errors} placeholder="Ej: PECULADO" />
           <Field label="Agraviado" name="agraviado" register={register} watch={watch} errors={errors} placeholder="Ej: MUNICIPALIDAD PROVINCIAL" />
           <Field label="Descripción del hecho" name="descripcionHecho" register={register} watch={watch} errors={errors} placeholder="Describa los hechos investigados..." className="md:col-span-2" textarea />
          <Field label="Fecha de documento" name="fechaDocumento" register={register} watch={watch} errors={errors} type="date" placeholder="DD/MM/AAAA" />
        </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit">Actualizar vista previa</Button>
      </div>
    </form>
  );
});

FormTestigo.displayName = "FormTestigo";
export default FormTestigo;