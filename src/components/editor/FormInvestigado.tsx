import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { investigadoSchema, type InvestigadoSchema } from "../../schemas/investigadoSchema";
import type { InvestigadoData } from "../../types";
import { investigadoDefaults } from "../../store/documentDefaults";
import { Field } from "./FormFields";
import { Button } from "../ui/button";

type Props = {
  initial?: Partial<InvestigadoData>;
  onValid: (data: InvestigadoData) => void;
};

export interface FormInvestigadoHandle {
  reset: () => void;
  getValues: () => InvestigadoSchema;
}

const FormInvestigado = forwardRef<FormInvestigadoHandle, Props>(({ initial, onValid }, ref) => {
  const form = useForm<InvestigadoSchema>({
    resolver: zodResolver(investigadoSchema),
    defaultValues: { ...investigadoDefaults, ...initial },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  useImperativeHandle(ref, () => ({
    reset: () => form.reset({ ...investigadoDefaults }),
    getValues: () => form.getValues(),
  }));

  const lowercase = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.currentTarget.value = event.currentTarget.value.toLowerCase();
  };

  const capitalizeWords = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const el = event.currentTarget;
    const raw = el.value;
    const parts = raw.split(/(\s+)/);
    const formatted = parts.map(part => {
      if (/^\s+$/.test(part)) return part;
      if (/^[A-ZÁÉÍÓÚÑ]{2,}$/.test(part) || /^L\.Q\.R\.R\.?$/i.test(part)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join("");
    el.value = formatted;
  };

  const formatNameInput = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const el = event.currentTarget;
    const raw = el.value;
    const lowers = raw.toLowerCase();
    const parts = lowers.trim().split(/\s+/);
    let formatted: string;
    if (parts.length > 2) {
      const first = parts.slice(0, -2).map(p => p[0].toUpperCase() + p.slice(1)).join(" ");
      const last = parts.slice(-2).map(p => p.toUpperCase()).join(" ");
      formatted = `${first} ${last}`;
    } else if (parts.length === 2) {
      formatted = `${parts[0][0].toUpperCase() + parts[0].slice(1)} ${parts[1].toUpperCase()}`;
    } else if (parts.length === 1) {
      formatted = parts[0][0].toUpperCase() + parts[0].slice(1);
    } else {
      formatted = raw;
    }
    el.value = formatted;
  };

  return (
    <form id="document-form" onSubmit={handleSubmit((data) => onValid(data))} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Número" name="numero" register={register} watch={watch} errors={errors} placeholder="Ej: 001" />
        <Field label="Nombre completo" name="nombre" register={register} watch={watch} errors={errors} onInput={formatNameInput} placeholder="Ej: Juan PÉREZ GARCÍA" />
        <Field label="Domicilio" name="domicilio" register={register} watch={watch} errors={errors} onInput={lowercase} placeholder="Ej: Jr. Lima N° 123 - Iquitos" />
        <Field label="Referencia/Carpeta Fiscal N°" name="carpetaFiscal" register={register} watch={watch} errors={errors} placeholder="Ej: 2026-00123" />
        <Field label="Fecha diligencia" name="fechaDiligencia" register={register} watch={watch} errors={errors} type="date" placeholder="DD/MM/AAAA" />
        <Field label="Hora diligencia" name="hora" register={register} watch={watch} errors={errors} type="time" placeholder="HH:MM" />
        <Field label="Delito" name="delito" register={register} watch={watch} errors={errors} onInput={capitalizeWords} placeholder="Ej: COLUSIÓN" />
        <Field label="Agraviado" name="agraviado" register={register} watch={watch} errors={errors} onInput={capitalizeWords} placeholder="Ej: ESTADO PERUANO" />
        <Field label="Descripción del hecho" name="descripcionHecho" register={register} watch={watch} errors={errors} onInput={lowercase} placeholder="Describa los hechos investigados..." className="md:col-span-2" textarea />
        <Field label="Fecha de documento" name="fechaDocumento" register={register} watch={watch} errors={errors} type="date" placeholder="DD/MM/AAAA" />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit">Actualizar vista previa</Button>
      </div>
    </form>
  );
});

FormInvestigado.displayName = "FormInvestigado";
export default FormInvestigado;