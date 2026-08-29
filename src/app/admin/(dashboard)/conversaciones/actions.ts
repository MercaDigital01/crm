"use server";

import { revalidatePath } from "next/cache";
import { whatsappEvents } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { isStaffUser } from "@/lib/staff";

export async function createWhatsappEvent(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const clientId = String(formData.get("clientId") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const outcome = String(formData.get("outcome") ?? "") as
    | "cita_agendada"
    | "venta_cerrada"
    | "seguimiento_pendiente"
    | "sin_resultado";
  const occurredAtRaw = String(formData.get("occurredAt") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!clientId || !outcome || !occurredAtRaw) {
    throw new Error("Faltan datos para registrar la conversación");
  }

  const occurredAt = new Date(occurredAtRaw);
  if (Number.isNaN(occurredAt.getTime())) {
    throw new Error("Fecha inválida");
  }

  await withAppUser((tx) =>
    tx.insert(whatsappEvents).values({
      clientId,
      contactName: contactName || null,
      contactPhone: contactPhone || null,
      outcome,
      occurredAt,
      note: note || null,
    })
  );

  revalidatePath("/admin/conversaciones");
}
