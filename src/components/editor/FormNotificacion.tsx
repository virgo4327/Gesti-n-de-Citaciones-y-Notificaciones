import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { notificacionSchema, type NotificacionSchema } from "../../schemas/notificacionSchema";
import type { NotificacionData } from "../../types";
import { notificacionDefaults } from "../../store/documentDefaults";
import { Field } from "./FormFields";
import TablaNotificacion from "./TablaNotificacion";

type Props = {
  initial?: Partial<NotificacionData>;
  onValid: (data: NotificacionData) => void;
};

export default function FormNotificacion({ initial, onValid }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<NotificacionSchema>({
    resolver: zodResolver(notificacionSchema),
    defaultValues: { ...notificacionDefaults, ...initial },
  });
  return (
    <form id="document-form" onSubmit={handleSubmit((data) => onValid(data))} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Número" name="numero" register={register} errors={errors} />
        <Field label="Fecha del documento" name="fechaDocumento" register={register} errors={errors} />
        <Field label="Nombre completo" name="nombre" register={register} errors={errors} />
        <Field label="Domicilio" name="domicilio" register={register} errors={errors} />
        <Field label="Carpeta Fiscal N°" name="carpetaFiscal" register={register} errors={errors} />
        <Field label="Delito/modalidad" name="delito" register={register} errors={errors} />
      </div>
      <TablaNotificacion control={control} register={register} errors={errors} />
    </form>
  );
}
