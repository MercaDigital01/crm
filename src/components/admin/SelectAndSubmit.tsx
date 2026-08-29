"use client";

import { useRef } from "react";

const DOT_COLOR_CLASS = {
  teal: "bg-md-teal",
  gold: "bg-md-gold",
  blue: "bg-md-blue",
  red: "bg-md-red",
} as const;

export function SelectAndSubmit({
  action,
  hiddenFields,
  name,
  defaultValue,
  options,
  dotColor,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  dotColor?: keyof typeof DOT_COLOR_CLASS;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="flex items-center gap-2">
      {Object.entries(hiddenFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      {dotColor && (
        <span
          aria-hidden
          className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLOR_CLASS[dotColor]}`}
        />
      )}
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </form>
  );
}
