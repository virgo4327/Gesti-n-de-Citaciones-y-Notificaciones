import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import type { A4Data } from "../../types";
import { a4Defaults } from "../../store/documentDefaults";
import { Field } from "./FormFields";
import { Button } from "../ui/button";

type Props = {
  initial?: Partial<A4Data>;
  onValid: (data: A4Data) => void;
};

export interface FormA4Handle {
  reset: () => void;
  getValues: () => A4Data;
}

const FormA4 = forwardRef<FormA4Handle, Props>(({ initial, onValid }, ref) => {
  const form = useForm<A4Data>({
    defaultValues: { ...a4Defaults, ...initial },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  useImperativeHandle(ref, () => ({
    reset: () => form.reset({ ...a4Defaults }),
    getValues: () => form.getValues(),
  }));

  return (
    <form id="document-form" onSubmit={handleSubmit((data) => onValid(data))} className="grid gap-5">
      <div className="rounded-md bg-amber-50/70 p-3 border border-amber-100 text-xs text-amber-800">
        📌 <strong>Documento A4:</strong> Notificación policial a denunciado por flagrante delito.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 1. Referencia */}
        <Field
          label="1. Referencia"
          name="referencia"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: OFICIO N° 890-2026-DIRNIC-PNP"
          className="md:col-span-2"
        />

        {/* 2. N° de Notificación Policial */}
        <Field
          label="2. Notificación Policial N°"
          name="numero"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: 001, 018"
        />

        {/* 3. Señor (a) - Nombre completo */}
        <Field
          label="3. Señor (a) - Nombres y Apellidos"
          name="nombre"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: CARLOS SILVA RUIZ"
        />

        {/* 4. DNI N° */}
        <Field
          label="4. DNI N°"
          name="dni"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: 05234789"
        />

        {/* 5. Domicilio */}
        <Field
          label="5. Domicilio"
          name="domicilio"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Calle Putumayo N° 670"
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
          placeholder="Ej: 999888777 o S/N"
        />

        {/* 10. Correo electrónico */}
        <Field
          label="10. Correo electrónico"
          name="email"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: correo@ejemplo.com o S/C"
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

        {/* 13. Fiscalía */}
        <Field
          label="13. Fiscalía (competente)"
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
          placeholder="Ej: Cohecho Pasivo Propio, Peculado Doloso..."
        />

        {/* 15. En agravio de */}
        <Field
          label="15. En agravio de"
          name="agraviado"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: El Estado Peruano - Municipalidad Provincial de Maynas"
        />

        {/* 16. Fecha del documento */}
        <Field
          label="16. Fecha del documento"
          name="fechaDocumento"
          register={register}
          watch={watch}
          errors={errors}
          type="date"
          placeholder="DD/MM/AAAA"
          className="md:col-span-2"
        />

        {/* 17. Disposición Fiscal N° */}
        <Field
          label="17. Disposición Fiscal N°"
          name="disposicionFiscal"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: 01 del 26AGO2025 o 02-2026"
        />

        {/* 18. A folios */}
        <Field
          label="18. A folios"
          name="folios"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: 09 o 15"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit">Actualizar vista previa</Button>
      </div>
    </form>
  );
});

FormA4.displayName = "FormA4";
export default FormA4;
