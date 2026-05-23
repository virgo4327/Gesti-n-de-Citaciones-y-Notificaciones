import { useState, useEffect, type ChangeEvent } from "react";
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

  const inputProps = {
    ...rest,
    name: name as string,
    ref,
    onChange: handleOnChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    className: textarea ? "field field-ghost min-h-28 resize-y" : "field field-ghost",
    "aria-label": label,
  };

  return (
    <label className="ghost-field">
      {textarea ? <textarea {...inputProps} /> : <input {...inputProps} />}
      <span className={`ghost-label ${hasValue ? "ghost-label-raised" : ""}`}>
        {placeholder || label}
      </span>
      {error && <span className="error">{error}</span>}
    </label>
  );
}
