"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ClientPicker({
  clients,
  selectedClientId,
}: {
  clients: { id: string; businessName: string }[];
  selectedClientId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      value={selectedClientId ?? ""}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        if (event.target.value) {
          params.set("clientId", event.target.value);
        } else {
          params.delete("clientId");
        }
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded border border-white/15 bg-white/[0.07] px-3 py-2 text-sm text-white"
    >
      <option value="">Selecciona un cliente…</option>
      {clients.map((client) => (
        <option key={client.id} value={client.id}>
          {client.businessName}
        </option>
      ))}
    </select>
  );
}
