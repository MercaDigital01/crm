"use server";

import { revalidatePath } from "next/cache";
import { contentItems } from "@/db/schema";
import { withAppUser } from "@/db/session";
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

  revalidatePath("/admin/calendario");
}
