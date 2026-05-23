import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { investigadoSchema, type InvestigadoSchema } from "../../schemas/investigadoSchema";
import type { InvestigadoData } from "../../types";
import { upper } from "../../lib/utils";
import { investigadoDefaults } from "../../store/documentDefaults";
import { Field } from "./FormFields";
import { Button } from "../ui/button";

type Props = {
  initial?: Partial<InvestigadoData>;
  onValid: (data: InvestigadoData) => void;
};

export default function FormInvestigado({ initial, onValid }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<InvestigadoSchema>({
    resolver: zodResolver(investigadoSchema),
    defaultValues: { ...investigadoDefaults, ...initial },
  });
  const uppercase = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.currentTarget.value = upper(event.currentTarget.value);
  };
  return (
    <form id="document-form" onSubmit={handleSubmit((data) => onValid(data))} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Número" name="numero" register={register} errors={errors} />
        <Field label="Fecha del documento" name="fechaDocumento" register={register} errors={errors} />
        <Field label="Nombre completo" name="nombre" register={register} errors={errors} onInput={uppercase} />
        <Field label="Domicilio" name="domicilio" register={register} errors={errors} onInput={uppercase} />
        <Field label="Carpeta Fiscal N°" name="carpetaFiscal" register={register} errors={errors} />
        <Field label="Fecha diligencia" name="fechaDiligencia" register={register} errors={errors} />
        <Field label="Hora" name="hora" register={register} errors={errors} />
        <Field label="Delito/modalidad" name="delito" register={register} errors={errors} onInput={uppercase} />
        <Field label="Agraviado" name="agraviado" register={register} errors={errors} onInput={uppercase} />
      </div>
      <Field label="Descripción del hecho" name="descripcionHecho" register={register} errors={errors} textarea />
      <div className="pt-4">
        <Button type="submit">Actualizar vista previa</Button>
      </div>
    </form>
  );
}
