import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { notificacionSchema, type NotificacionSchema } from "../../schemas/notificacionSchema";
import type { NotificacionData } from "../../types";
import { notificacionDefaults } from "../../store/documentDefaults";
import { Field } from "./FormFields";
import { Button } from "../ui/button";
import TablaNotificacion from "./TablaNotificacion";

type Props = {
  initial?: Partial<NotificacionData>;
  onValid: (data: NotificacionData) => void;
};

export interface FormNotificacionHandle {
  reset: () => void;
  getValues: () => NotificacionSchema;
}

const FormNotificacion = forwardRef<FormNotificacionHandle, Props>(({ initial, onValid }, ref) => {
  const form = useForm<NotificacionSchema>({
    resolver: zodResolver(notificacionSchema),
    defaultValues: { ...notificacionDefaults, ...initial },
  });

  const { register, handleSubmit, watch, control, getValues: formGetValues, formState: { errors } } = form;

  useImperativeHandle(ref, () => ({
    reset: () => form.reset({ ...notificacionDefaults, citados: [] }),
    getValues: () => form.getValues(),
  }));

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

  const capitalizeWords = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const el = event.currentTarget;
    const raw = el.value;
    const parts = raw.split(/(\s+)/);
    const formatted = parts.map(part => {
      if (/^\s+$/.test(part)) return part;
      if (/^[A-ZÁÉÍÓÚÑ]{2,}$/.test(part)) return part.toUpperCase();
      if (/^L\.Q\.R\.R\.?$/i.test(part)) return "L.Q.R.R.";
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join("");
    el.value = formatted;
  };

  return (
    <form id="document-form" onSubmit={handleSubmit((data) => onValid(data))} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Número" name="numero" register={register} watch={watch} errors={errors} placeholder="Ej: 003" />
        <Field label="Nombre completo" name="nombre" register={register} watch={watch} errors={errors} onInput={formatNameInput} placeholder="Ej: Carlos RAMÍREZ SÁNCHEZ" />
        <Field label="Domicilio" name="domicilio" register={register} watch={watch} errors={errors} placeholder="Ej: Jr. Napo N° 789 - Iquitos" />
        <Field label="Referencia/Carpeta Fiscal N°" name="carpetaFiscal" register={register} watch={watch} errors={errors} placeholder="Ej: 2026-00789" />
        <Field label="Delito/modalidad" name="delito" register={register} watch={watch} errors={errors} onInput={capitalizeWords} placeholder="Ej: COLUSIÓN" />
        <Field label="Fecha de documento" name="fechaDocumento" register={register} watch={watch} errors={errors} type="date" placeholder="DD/MM/AAAA" />
      </div>
       <TablaNotificacion control={control} register={register} getValues={formGetValues} errors={errors} />
      <div className="flex gap-3 pt-4">
        <Button type="submit">Actualizar vista previa</Button>
      </div>
    </form>
  );
});

FormNotificacion.displayName = "FormNotificacion";
export default FormNotificacion;