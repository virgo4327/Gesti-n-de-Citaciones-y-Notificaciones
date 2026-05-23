import { useState, type ChangeEvent } from "react";
import { Trash2 } from "lucide-react";
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import type { NotificacionSchema } from "../../schemas/notificacionSchema";
import { Button } from "../ui/button";

type Props = {
  control: Control<NotificacionSchema>;
  register: UseFormRegister<NotificacionSchema>;
  errors: FieldErrors<NotificacionSchema>;
};

function GhostInput({ name, register, placeholder, type }: { name: string; register: UseFormRegister<NotificacionSchema>; placeholder: string; type?: string }) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const { onChange, onBlur, ref, ...rest } = register(name as never);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
  };

  const hasValue = value.length > 0 || focused;

  return (
    <span className="ghost-field ghost-field-inline">
      <input
        {...rest}
        ref={ref}
        type={type || "text"}
        onChange={(e) => { handleChange(e); onChange(e); }}
        onFocus={() => setFocused(true)}
        onBlur={(e) => { setFocused(false); onBlur(e); }}
        className="field field-ghost"
        aria-label={placeholder}
      />
      <span className={`ghost-label ${hasValue ? "ghost-label-raised" : ""}`}>
        {placeholder}
      </span>
    </span>
  );
}

export default function TablaNotificacion({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "citados" });
  return (
    <div className="rounded-lg border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <h3 className="font-black text-police">Tabla dinámica de citados</h3>
        <Button type="button" onClick={() => append({ id: crypto.randomUUID(), nombres: "", condicion: "TESTIGO", fecha: "", hora: "" })}>
          + Agregar fila
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600">
            <tr>
              <th className="px-3 py-3">N°</th>
              <th className="px-3 py-3">Nombres</th>
              <th className="px-3 py-3">Condición</th>
              <th className="px-3 py-3">Fecha</th>
              <th className="px-3 py-3">Hora</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id} className="border-t">
                <td className="px-3 py-2 font-bold">{index + 1}</td>
                <td className="px-3 py-2">
                  <GhostInput name={`citados.${index}.nombres`} register={register} placeholder="Nombre del citado" />
                </td>
                <td className="px-3 py-2">
                  <select className="field" {...register(`citados.${index}.condicion`)}>
                    <option>TESTIGO</option>
                    <option>INVESTIGADO</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <GhostInput name={`citados.${index}.fecha`} register={register} placeholder="DD/MM/AAAA" />
                </td>
                <td className="px-3 py-2">
                  <GhostInput name={`citados.${index}.hora`} register={register} placeholder="HH:MM" />
                </td>
                <td className="px-3 py-2">
                  <Button type="button" variant="danger" className="h-9 w-9 px-0" onClick={() => remove(index)} disabled={fields.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {errors.citados?.message && <p className="error p-4">{errors.citados.message}</p>}
    </div>
  );
}
