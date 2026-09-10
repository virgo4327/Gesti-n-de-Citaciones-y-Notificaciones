import { forwardRef, useImperativeHandle, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { A3Data } from "../../types";
import { a3Defaults } from "../../store/documentDefaults";
import { Field } from "./FormFields";
import { Button } from "../ui/button";

type Props = {
  initial?: Partial<A3Data>;
  onValid: (data: A3Data) => void;
};

export interface FormA3Handle {
  reset: () => void;
  getValues: () => A3Data;
}

const FormA3 = forwardRef<FormA3Handle, Props>(({ initial, onValid }, ref) => {
  const form = useForm<A3Data>({
    defaultValues: { ...a3Defaults, ...initial },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  useImperativeHandle(ref, () => ({
    reset: () => form.reset({ ...a3Defaults }),
    getValues: () => form.getValues(),
  }));

  const fechaDiligencia = watch("fechaDiligencia");
  const horaDiligencia = watch("horaDiligencia");

  useEffect(() => {
    if (fechaDiligencia && horaDiligencia) {
      const autoText = `El día ${fechaDiligencia} a horas ${horaDiligencia}`;
      const current = form.getValues("citacion1");
      if (!current || current.startsWith("El día")) {
        setValue("citacion1", autoText);
      }
    }
  }, [fechaDiligencia, horaDiligencia, setValue, form]);

  return (
    <form id="document-form" onSubmit={handleSubmit((data) => onValid(data))} className="grid gap-5">
      <div className="rounded-md bg-emerald-50/70 p-3 border border-emerald-100 text-xs text-emerald-800">
        📌 <strong>Documento A3:</strong> Citación a víctima, testigo, perito, depositario u otro por Carpeta Fiscal.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 1. Referencia */}
        <Field
          label="1. Referencia"
          name="referencia"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: CARPETA FISCAL N° 2506015500-2026-45-0"
          className="md:col-span-2"
        />

        {/* 2. N° de Citación Policial */}
        <Field
          label="2. Citación Policial N°"
          name="numero"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: 001, 020"
        />

        {/* 3. Señor (a) - Nombre completo */}
        <Field
          label="3. Señor (a) - Nombres y Apellidos"
          name="nombre"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: ANA MARÍA MENDOZA RÍOS"
        />

        {/* 4. DNI N° */}
        <Field
          label="4. DNI N°"
          name="dni"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: 45892310"
        />

        {/* 5. Domicilio */}
        <Field
          label="5. Domicilio"
          name="domicilio"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Av. Abelardo Quiñones Km 2.5"
        />

        {/* 6. Distrito */}
        <Field
          label="6. Distrito"
          name="distrito"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: San Juan Bautista, Iquitos"
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
          placeholder="Ej: 965412389 o S/N"
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

        {/* 11. Modalidad del Delito */}
        <Field
          label="11. Modalidad del Delito"
          name="modalidadDelito"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Colusión Agravada, Negociación Incompatible..."
        />

        {/* 12. En su condición de */}
        <Field
          label="12. En su condición de"
          name="condicion"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Testigo, Víctima, Perito..."
        />

        {/* 13. Seguido en contra de */}
        <Field
          label="13. Seguido en contra de (Imputados)"
          name="imputados"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Funcionarios de la Municipalidad de Maynas"
          className="md:col-span-2"
        />

        {/* 14. En agravio de */}
        <Field
          label="14. En agravio de"
          name="agraviado"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: El Estado Peruano - Municipalidad de Maynas"
          className="md:col-span-2"
        />

        {/* Sección de programación para la Agenda */}
        <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase text-police mb-3 tracking-wider">
            📅 Programación de Citaciones para la Agenda
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Fecha de la 1ra Citación (Agenda)"
              name="fechaDiligencia"
              register={register}
              watch={watch}
              errors={errors}
              type="date"
              placeholder="DD/MM/AAAA"
            />
            <Field
              label="Hora de la 1ra Citación (Agenda)"
              name="horaDiligencia"
              register={register}
              watch={watch}
              errors={errors}
              type="time"
              placeholder="HH:MM"
            />
          </div>
        </div>

        {/* 15. 1ra Citación */}
        <Field
          label="15. 1ra. Citación (Texto)"
          name="citacion1"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: El día 18SET2026 a horas 08:30"
          className="md:col-span-2"
        />

        {/* 16. 2da Citación */}
        <Field
          label="16. 2da. Citación (Opcional)"
          name="citacion2"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: El día 22SET2026 a horas 10:00"
        />

        {/* 17. 3ra Citación */}
        <Field
          label="17. 3ra. Citación (Opcional)"
          name="citacion3"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: El día 26SET2026 a horas 11:30"
        />

        {/* 18. Fecha del documento */}
        <Field
          label="18. Fecha del documento"
          name="fechaDocumento"
          register={register}
          watch={watch}
          errors={errors}
          type="date"
          placeholder="DD/MM/AAAA"
          className="md:col-span-2"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit">Actualizar vista previa</Button>
      </div>
    </form>
  );
});

FormA3.displayName = "FormA3";
export default FormA3;
