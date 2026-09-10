import { forwardRef, useImperativeHandle, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { A2Data } from "../../types";
import { a2Defaults } from "../../store/documentDefaults";
import { Field } from "./FormFields";
import { Button } from "../ui/button";

type Props = {
  initial?: Partial<A2Data>;
  onValid: (data: A2Data) => void;
};

export interface FormA2Handle {
  reset: () => void;
  getValues: () => A2Data;
}

const FormA2 = forwardRef<FormA2Handle, Props>(({ initial, onValid }, ref) => {
  const form = useForm<A2Data>({
    defaultValues: { ...a2Defaults, ...initial },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  useImperativeHandle(ref, () => ({
    reset: () => form.reset({ ...a2Defaults }),
    getValues: () => form.getValues(),
  }));

  const fechaDiligencia = watch("fechaDiligencia");
  const horaDiligencia = watch("horaDiligencia");

  // Auto-format citacion1 if fecha/hora diligencia are set and citacion1 is empty or modified
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
      <div className="rounded-md bg-blue-50/70 p-3 border border-blue-100 text-xs text-blue-800">
        📌 <strong>Documento A2:</strong> Citación a víctima, testigo, perito, depositario u otro en caso de flagrancia.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 1. Referencia */}
        <Field
          label="1. Referencia"
          name="referencia"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: OFICIO N° 120-2026-DIRNIC-PNP o INFORME N°..."
          className="md:col-span-2"
        />

        {/* 2. N° de Citación Policial */}
        <Field
          label="2. Citación Policial N°"
          name="numero"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: 001, 015"
        />

        {/* 3. Señor (a) - Nombre completo */}
        <Field
          label="3. Señor (a) - Nombres y Apellidos"
          name="nombre"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: JUAN CARLOS PÉREZ GARCÍA"
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
          placeholder="Ej: Iquitos, Punchana, Belén"
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
          placeholder="Ej: 965823147 o S/N"
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
          placeholder="Ej: Peculado Doloso, Colusión Agravada..."
        />

        {/* 12. En su condición de */}
        <Field
          label="12. En su condición de"
          name="condicion"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Testigo, Víctima, Perito, Depositario..."
        />

        {/* 13. Seguido en contra de */}
        <Field
          label="13. Seguido en contra de (Imputados)"
          name="imputados"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: Carlos Ramírez López y los que resulten responsables"
          className="md:col-span-2"
        />

        {/* 14. En agravio de */}
        <Field
          label="14. En agravio de"
          name="agraviado"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: El Estado Peruano - Gerencia Regional de Educación"
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

        {/* 15. 1ra Citación (Texto que va al Word) */}
        <Field
          label="15. 1ra. Citación (Texto)"
          name="citacion1"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: El día 16SET2026 a horas 08:30"
          className="md:col-span-2"
        />

        {/* 16. 2da Citación */}
        <Field
          label="16. 2da. Citación (Opcional)"
          name="citacion2"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: El día 20SET2026 a horas 10:00"
        />

        {/* 17. 3ra Citación */}
        <Field
          label="17. 3ra. Citación (Opcional)"
          name="citacion3"
          register={register}
          watch={watch}
          errors={errors}
          placeholder="Ej: El día 24SET2026 a horas 11:00"
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

FormA2.displayName = "FormA2";
export default FormA2;
