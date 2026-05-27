import { useState, useEffect, type ChangeEvent } from "react";
import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";

type FieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  textarea?: boolean;
  type?: "text" | "date" | "time";
  onInput?: React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: string;
  className?: string;
};

type CalendarDateInputProps = {
  value: string;
  onChange: (v: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

function CalendarDateInput({ value, onChange, onBlur, placeholder }: CalendarDateInputProps) {
  const [open, setOpen] = useState(false);

  const handleDatePick = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw) {
      const [yyyy, mm, dd] = raw.split("-");
      onChange(`${dd}/${mm}/${yyyy}`);
    }
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1 relative">
      <input
        type="text"
        className="field flex-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={10}
      />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
        title="Abrir calendario"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
      {open && (
        <input
          type="date"
          className="field absolute top-full left-0 z-20 mt-1 shadow-lg"
          onChange={handleDatePick}
          onBlur={() => setOpen(false)}
          autoFocus
        />
      )}
    </div>
  );
}

type ClockTimeInputProps = {
  value: string;
  onChange: (v: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

function ClockTimeInput({ value, onChange, onBlur, placeholder }: ClockTimeInputProps) {
  const [open, setOpen] = useState(false);

  const hours: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      hours.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  return (
    <div className="flex items-center gap-1 relative">
      <input
        type="text"
        className="field flex-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={5}
      />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
        title="Seleccionar hora"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-20 mt-1 max-h-40 w-28 overflow-y-auto rounded border bg-white shadow-lg">
          {hours.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-police hover:text-white transition ${value === opt ? "bg-police text-white" : "text-slate-700"}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Field<T extends FieldValues>({ label, name, register, errors, textarea, type, onInput, placeholder, className }: FieldProps<T>) {
  const error = errors[name]?.message as string | undefined;
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const el = document.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
    if (el) {
      const syncValue = () => setValue(el.value);
      syncValue();
      el.addEventListener("input", syncValue);
      return () => el.removeEventListener("input", syncValue);
    }
  }, [name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.currentTarget.value);
    if (onInput) onInput(e);
  };

  const hasValue = value.length > 0 || focused;

  const { onChange, onBlur, ref, ...rest } = register(name);

  const handleFocus = () => setFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocused(false);
    onBlur(e);
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleChange(e);
    onChange(e);
  };

  if (type === "date") {
    return (
      <label className={`ghost-field ${className ?? ""}`}>
        <CalendarDateInput
          value={value}
          onChange={(v) => {
            setValue(v);
            const fakeEvent = { target: { value: v, name: name as string } } as unknown as React.FocusEvent<HTMLInputElement>;
            onChange(fakeEvent);
          }}
          onBlur={onBlur}
          placeholder={placeholder}
        />
        <span className={`ghost-label ${hasValue ? "ghost-label-raised" : ""}`}>
          {label}
        </span>
        {error && <span className="error">{error}</span>}
      </label>
    );
  }

  if (type === "time") {
    return (
      <label className={`ghost-field ${className ?? ""}`}>
        <ClockTimeInput
          value={value}
          onChange={(v) => {
            setValue(v);
            const fakeEvent = { target: { value: v, name: name as string } } as unknown as React.FocusEvent<HTMLInputElement>;
            onChange(fakeEvent);
          }}
          onBlur={onBlur}
          placeholder={placeholder}
        />
        <span className={`ghost-label ${hasValue ? "ghost-label-raised" : ""}`}>
          {label}
        </span>
        {error && <span className="error">{error}</span>}
      </label>
    );
  }

  const inputProps = {
    ...rest,
    name: name as string,
    ref,
    onChange: handleOnChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    className: textarea ? "field field-ghost min-h-28 resize-y" : "field field-ghost",
    "aria-label": label,
    placeholder: focused ? placeholder : "",
  };

  return (
    <label className={`ghost-field ${className ?? ""}`}>
      {textarea ? <textarea {...inputProps} /> : <input {...inputProps} />}
      <span className={`ghost-label ${hasValue ? "ghost-label-raised" : ""}`}>
        {label}
      </span>
      {error && <span className="error">{error}</span>}
    </label>
  );
}
