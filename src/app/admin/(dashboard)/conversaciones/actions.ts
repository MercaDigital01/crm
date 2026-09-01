"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { whatsappEvents } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { logActivity } from "@/lib/activity-log";
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

  await logActivity({
    action: "create",
    entityType: "whatsapp_event",
    summary: `Registró una conversación (${outcome})`,
  });

  revalidatePath("/admin/conversaciones");
}

export async function updateWhatsappEvent(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const outcome = String(formData.get("outcome") ?? "") as
    | "cita_agendada"
    | "venta_cerrada"
    | "seguimiento_pendiente"
    | "sin_resultado";
  const occurredAtRaw = String(formData.get("occurredAt") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!id || !outcome || !occurredAtRaw) {
    throw new Error("Faltan datos para actualizar la conversación");
  }

  const occurredAt = new Date(occurredAtRaw);
  if (Number.isNaN(occurredAt.getTime())) {
    throw new Error("Fecha inválida");
  }

  await withAppUser((tx) =>
    tx
      .update(whatsappEvents)
      .set({
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        outcome,
        occurredAt,
        note: note || null,
      })
      .where(eq(whatsappEvents.id, id))
  );

  await logActivity({
    action: "update",
    entityType: "whatsapp_event",
    entityId: id,
    summary: "Editó una conversación",
  });

  revalidatePath("/admin/conversaciones");
}

export async function deleteWhatsappEvent(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Falta la conversación a eliminar");
  }

  await withAppUser((tx) =>
    tx.delete(whatsappEvents).where(eq(whatsappEvents.id, id))
  );

  await logActivity({
    action: "delete",
    entityType: "whatsapp_event",
    entityId: id,
    summary: "Eliminó una conversación",
  });

  revalidatePath("/admin/conversaciones");
}
