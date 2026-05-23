import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";

type FieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  textarea?: boolean;
  onInput?: React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: string;
};

export function Field<T extends FieldValues>({ label, name, register, errors, textarea, onInput, placeholder }: FieldProps<T>) {
  const error = errors[name]?.message as string | undefined;
  const common = {
    ...register(name),
    onInput,
    placeholder,
    className: textarea ? "field min-h-28 resize-y" : "field",
  };
  return (
    <label className="grid gap-1">
      <span className="label">{label}</span>
      {textarea ? <textarea {...common} /> : <input {...common} />}
      {error && <span className="error">{error}</span>}
    </label>
  );
}
