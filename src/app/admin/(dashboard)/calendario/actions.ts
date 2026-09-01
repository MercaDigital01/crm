"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { contentItems } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { logActivity } from "@/lib/activity-log";
import { isStaffUser } from "@/lib/staff";

export async function createContentItem(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const clientId = String(formData.get("clientId") ?? "");
  const scheduledDate = String(formData.get("scheduledDate") ?? "");
  const platform = String(formData.get("platform") ?? "").trim();
  const pillar = String(formData.get("pillar") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const status = String(formData.get("status") ?? "") as
    | "borrador"
    | "programado"
    | "publicado";
  const format = String(formData.get("format") ?? "") as
    | "reel"
    | "carrusel"
    | "imagen";

  if (!clientId || !scheduledDate || !platform || !title || !format) {
    throw new Error("Faltan datos para programar el contenido");
  }

  await withAppUser((tx) =>
    tx.insert(contentItems).values({
      clientId,
      scheduledDate,
      platform,
      pillar: pillar || null,
      title,
      status: status || "borrador",
      format,
    })
  );

  await logActivity({
    action: "create",
    entityType: "content_item",
    summary: `Programó "${title}"`,
  });

  revalidatePath("/admin/calendario");
}

export async function duplicateContentItem(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const itemId = String(formData.get("itemId") ?? "");
  const targetClientId = String(formData.get("targetClientId") ?? "");
  if (!itemId || !targetClientId) {
    throw new Error("Falta el cliente destino");
  }

  const source = await withAppUser((tx) =>
    tx.query.contentItems.findFirst({ where: eq(contentItems.id, itemId) })
  );
  if (!source) {
    throw new Error("Contenido no encontrado");
  }

  await withAppUser((tx) =>
    tx.insert(contentItems).values({
      clientId: targetClientId,
      scheduledDate: source.scheduledDate,
      platform: source.platform,
      pillar: source.pillar,
      title: source.title,
      status: "borrador",
      format: source.format,
    })
  );

  await logActivity({
    action: "duplicate",
    entityType: "content_item",
    entityId: itemId,
    summary: `Duplicó "${source.title}" a otro cliente`,
  });

  revalidatePath("/admin/calendario");
}

export async function updateContentItem(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  const scheduledDate = String(formData.get("scheduledDate") ?? "");
  const platform = String(formData.get("platform") ?? "").trim();
  const pillar = String(formData.get("pillar") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const status = String(formData.get("status") ?? "") as
    | "borrador"
    | "programado"
    | "publicado";
  const format = String(formData.get("format") ?? "") as
    | "reel"
    | "carrusel"
    | "imagen";

  if (!id || !scheduledDate || !platform || !title || !format) {
    throw new Error("Faltan datos para actualizar el contenido");
  }

  await withAppUser((tx) =>
    tx
      .update(contentItems)
      .set({
        scheduledDate,
        platform,
        pillar: pillar || null,
        title,
        status: status || "borrador",
        format,
      })
      .where(eq(contentItems.id, id))
  );

  await logActivity({
    action: "update",
    entityType: "content_item",
    entityId: id,
    summary: `Editó "${title}"`,
  });

  revalidatePath("/admin/calendario");
}

export async function deleteContentItem(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Falta el contenido a eliminar");
  }

  await withAppUser((tx) => tx.delete(contentItems).where(eq(contentItems.id, id)));

  await logActivity({
    action: "delete",
    entityType: "content_item",
    entityId: id,
    summary: "Eliminó un contenido programado",
  });

  revalidatePath("/admin/calendario");
}
