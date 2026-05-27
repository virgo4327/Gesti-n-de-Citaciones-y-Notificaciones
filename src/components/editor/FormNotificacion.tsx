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
}

const FormNotificacion = forwardRef<FormNotificacionHandle, Props>(({ initial, onValid }, ref) => {
  const { register, handleSubmit, control, formState: { errors }, reset: formReset } = useForm<NotificacionSchema>({
    resolver: zodResolver(notificacionSchema),
    defaultValues: { ...notificacionDefaults, ...initial },
  });

  useImperativeHandle(ref, () => ({
    reset: () => formReset({ ...notificacionDefaults, citados: [] }),
  }));

  return (
    <form id="document-form" onSubmit={handleSubmit((data) => onValid(data))} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Número" name="numero" register={register} errors={errors} placeholder="Ej: 003" />
        <Field label="Nombre completo" name="nombre" register={register} errors={errors} placeholder="Ej: CARLOS RAMÍREZ SÁNCHEZ" />
        <Field label="Domicilio" name="domicilio" register={register} errors={errors} placeholder="Ej: Jr. Napo N° 789 - Iquitos" />
        <Field label="Referencia/Carpeta Fiscal N°" name="carpetaFiscal" register={register} errors={errors} placeholder="Ej: 2026-00789" />
        <Field label="Delito/modalidad" name="delito" register={register} errors={errors} placeholder="Ej: COLUSIÓN" />
        <Field label="Fecha de documento" name="fechaDocumento" register={register} errors={errors} placeholder="Ej: 15 de Mayo" />
      </div>
      <TablaNotificacion control={control} register={register} errors={errors} />
      <div className="flex gap-3 pt-4">
        <Button type="submit">Actualizar vista previa</Button>
      </div>
    </form>
  );
});

FormNotificacion.displayName = "FormNotificacion";
export default FormNotificacion;
