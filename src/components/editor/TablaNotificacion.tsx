import { useState, type ChangeEvent } from "react";
import { Trash2 } from "lucide-react";
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister, type UseFormGetValues } from "react-hook-form";
import type { NotificacionSchema } from "../../schemas/notificacionSchema";
import { Button } from "../ui/button";

type Props = {
  control: Control<NotificacionSchema>;
  register: UseFormRegister<NotificacionSchema>;
  getValues: UseFormGetValues<NotificacionSchema>;
  errors: FieldErrors<NotificacionSchema>;
};

function GhostInput({ name, register, placeholder }: { name: string; register: UseFormRegister<NotificacionSchema>; placeholder: string }) {
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(false);
  const { onChange, onBlur, ref, ...rest } = register(name as never);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilled(e.target.value.length > 0);
    onChange(e);
  };

  const hasValue = filled || focused;

  return (
    <span className="ghost-field ghost-field-inline">
      <input
        {...rest}
        ref={ref}
        type="text"
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={(e) => { setFocused(false); onBlur(e); }}
        className="field field-ghost"
        aria-label={placeholder}
        placeholder={focused ? placeholder : ""}
      />
      <span className={`ghost-label ${hasValue ? "ghost-label-raised" : ""}`}>
        {placeholder}
      </span>
    </span>
  );
}

type TableDateInputProps = {
  name: string;
  register: UseFormRegister<NotificacionSchema>;
  getValues: UseFormGetValues<NotificacionSchema>;
  placeholder: string;
};

function TableDateInput({ name, register, getValues, placeholder }: TableDateInputProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const value = (getValues(name as any) as string) || "";
  const { onChange, onBlur, ref, ...rest } = register(name as never);

  const handleDatePick = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw) {
      const [yyyy, mm, dd] = raw.split("-");
      const formatted = `${dd}/${mm}/${yyyy}`;
      const fakeEvent = { target: { value: formatted, name } } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(fakeEvent);
    }
    setOpen(false);
  };

  return (
    <span className="ghost-field ghost-field-inline relative">
      <div className="flex items-center gap-0.5">
        <input
          {...rest}
          ref={ref}
          type="text"
          value={value}
          onFocus={() => { setOpen(false); setFocused(true); }}
          onBlur={(e) => { setFocused(false); onBlur(e); }}
          className="field field-ghost"
          aria-label={placeholder}
          placeholder={focused ? placeholder : ""}
          maxLength={10}
          readOnly
          onClick={() => setOpen(!open)}
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          title="Abrir calendario"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1">
          <input
            type="date"
            className="field shadow-lg"
            onChange={handleDatePick}
            autoFocus
          />
        </div>
      )}
    </span>
  );
}

type TableTimeInputProps = {
  name: string;
  register: UseFormRegister<NotificacionSchema>;
  getValues: UseFormGetValues<NotificacionSchema>;
  placeholder: string;
};

function TableTimeInput({ name, register, getValues, placeholder }: TableTimeInputProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const value = (getValues(name as any) as string) || "";
  const { onChange, onBlur, ref, ...rest } = register(name as never);

  const hours: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      hours.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  return (
    <span className="ghost-field ghost-field-inline relative">
      <div className="flex items-center gap-0.5">
        <input
          {...rest}
          ref={ref}
          type="text"
          value={value}
          onFocus={() => { setOpen(false); setFocused(true); }}
          onBlur={(e) => { setFocused(false); onBlur(e); }}
          className="field field-ghost"
          aria-label={placeholder}
          placeholder={focused ? placeholder : ""}
          maxLength={5}
          readOnly
          onClick={() => setOpen(!open)}
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          title="Seleccionar hora"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 max-h-36 w-24 overflow-y-auto rounded border bg-white shadow-lg">
          {hours.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`block w-full px-2 py-1 text-left text-xs hover:bg-police hover:text-white transition ${value === opt ? "bg-police text-white" : "text-slate-700"}`}
              onClick={() => {
                const fakeEvent = { target: { value: opt, name } } as unknown as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

export default function TablaNotificacion({ control, register, getValues, errors }: Props) {
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
                  <GhostInput name={`citados.${index}.nombres`} register={register} placeholder="Nombre del citado, ej: Juan PÉREZ" />
                </td>
                <td className="px-3 py-2">
                  <select className="field" {...register(`citados.${index}.condicion`)}>
                    <option>TESTIGO</option>
                    <option>INVESTIGADO</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <TableDateInput name={`citados.${index}.fecha`} register={register} getValues={getValues} placeholder="DD/MM/AAAA" />
                </td>
                <td className="px-3 py-2">
                  <TableTimeInput name={`citados.${index}.hora`} register={register} getValues={getValues} placeholder="HH:MM" />
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