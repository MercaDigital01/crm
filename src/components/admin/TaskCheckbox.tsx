"use client";

import { useRef } from "react";

export function TaskCheckbox({
  action,
  id,
  clientId,
  done,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  clientId: string;
  done: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="flex items-center">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="done" value={String(done)} />
      <input
        type="checkbox"
        defaultChecked={done}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-4 w-4 rounded border-gray-300 text-md-teal focus:ring-md-teal"
      />
    </form>
  );
}
