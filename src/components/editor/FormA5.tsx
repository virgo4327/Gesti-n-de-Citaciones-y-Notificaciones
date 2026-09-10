import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import type { A5Data } from "../../types";
import { a5Defaults } from "../../store/documentDefaults";
import { Field } from "./FormFields";
import { Button } from "../ui/button";

type Props = {
  initial?: Partial<A5Data>;
  onValid: (data: A5Data) => void;
};

export interface FormA5Handle {
  reset: () => void;
  getValues: () => A5Data;
}

const FormA5 = forwardRef<FormA5Handle, Props>(({ initial, onValid }, ref) => {
  const form = useForm<A5Data>({
    defaultValues: { ...a5Defaults, ...initial },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  useImperativeHandle(ref, () => ({
    reset: () => form.reset({ ...a5Defaults }),
    getValues: () => form.getValues(),
  }));

  return (
    <form id="document-form" onSubmit={handleSubmit((data) => onValid(data))} className="grid gap-5">
      <div className="rounded-md bg-rose-50/70 p-3 border border-rose-100 text-xs text-rose-800">
        📌 <strong>Documento A5:</strong> Notificación policial a denunciado por Carpeta Fiscal con mérito y folios.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 1. Referencia */}
        <Field
          label="1. Referencia"
          name="referencia"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: CARPETA FISCAL N° 334-2026-DEPDICC"
          className="md:col-span-2"
        />

        {/* 2. N° de Notificación Policial */}
        <Field
          label="2. Notificación Policial N°"
          name="numero"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: 022, 050"
        />

        {/* 3. Señor (a) - Nombre completo */}
        <Field
          label="3. Señor (a) - Nombres y Apellidos"
          name="nombre"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: ENITH VICTORIA MERA CHAVEZ"
        />

        {/* 4. DNI N° */}
        <Field
          label="4. DNI N°"
          name="dni"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: 05384347"
        />

        {/* 5. Domicilio */}
        <Field
          label="5. Domicilio"
          name="domicilio"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Calle Manco Cápac N° 334"
        />

        {/* 6. Distrito */}
        <Field
          label="6. Distrito"
          name="distrito"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Iquitos"
        />

        {/* 7. Provincia */}
        <Field
          label="7. Provincia"
          name="provincia"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Maynas"
        />

        {/* 8. Departamento */}
        <Field
          label="8. Departamento"
          name="departamento"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Loreto"
        />

        {/* 9. Celular N° */}
        <Field
          label="9. Celular N°"
          name="celular"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: S/N o 965823147"
        />

        {/* 10. Correo electrónico */}
        <Field
          label="10. Correo electrónico"
          name="email"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: S/C o correo@ejemplo.com"
        />

        {/* 11. Fecha de la diligencia */}
        <Field
          label="11. Fecha de la diligencia"
          name="fechaDiligencia"
          register={register}
          watch={watch}
          errors={errors}
          type="date"
          placeholder="DD/MM/AAAA"
        />

        {/* 12. Hora de la diligencia */}
        <Field
          label="12. Hora de la diligencia"
          name="horaDiligencia"
          register={register}
          watch={watch}
          errors={errors}
          type="time"
          placeholder="HH:MM"
        />

        {/* 13. Fiscalía a cargo */}
        <Field
          label="13. Fiscalía a cargo (dispuesta por la...)"
          name="fiscalia"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Fiscalía Provincial Corporativa Especializada en Delitos de Corrupción de Funcionarios de Loreto"
          className="md:col-span-2"
        />

        {/* 14. Delito */}
        <Field
          label="14. Delito"
          name="delito"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Peculado Doloso, Malversación de Fondos..."
        />

        {/* 15. En agravio de */}
        <Field
          label="15. En agravio de"
          name="agraviado"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Gerencia Regional de Educación de Loreto - GREL"
        />

        {/* 16. A mérito de */}
        <Field
          label="16. A mérito de"
          name="merito"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: la Disposición Fiscal N° 01 del 26AGO2025"
          className="md:col-span-2"
        />

        {/* 17. Fecha del documento */}
        <Field
          label="17. Fecha del documento"
          name="fechaDocumento"
          register={register}
          watch={watch}
          errors={errors}
          type="date"
          placeholder="DD/MM/AAAA"
          className="md:col-span-2"
        />

        {/* 18. Disposición Fiscal N° */}
        <Field
          label="18. Disposición Fiscal N°"
          name="disposicionFiscal"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: 01 del 26AGO2025"
        />

        {/* 19. A folios */}
        <Field
          label="19. A folios"
          name="folios"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: 09"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit">Actualizar vista previa</Button>
      </div>
    </form>
  );
});

FormA5.displayName = "FormA5";
export default FormA5;
