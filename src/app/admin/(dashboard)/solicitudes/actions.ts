"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { campaignAdjustmentRequests, contentRequests } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { logActivity } from "@/lib/activity-log";
import { isStaffUser } from "@/lib/staff";

const STATUS_VALUES = ["pendiente", "revisado", "descartado"] as const;

export async function updateContentRequestStatus(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUS_VALUES.includes(status as (typeof STATUS_VALUES)[number])) {
    throw new Error("Faltan datos para actualizar la solicitud");
  }

  await withAppUser((tx) =>
    tx
      .update(contentRequests)
      .set({ status: status as (typeof STATUS_VALUES)[number] })
      .where(eq(contentRequests.id, id))
  );

  await logActivity({
    action: "update_status",
    entityType: "content_request",
    entityId: id,
    summary: `Cambió una solicitud de contenido a "${status}"`,
  });

  revalidatePath("/admin/solicitudes");
}

export async function updateCampaignAdjustmentRequestStatus(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUS_VALUES.includes(status as (typeof STATUS_VALUES)[number])) {
    throw new Error("Faltan datos para actualizar la solicitud");
  }

  await withAppUser((tx) =>
    tx
      .update(campaignAdjustmentRequests)
      .set({ status: status as (typeof STATUS_VALUES)[number] })
      .where(eq(campaignAdjustmentRequests.id, id))
  );

  await logActivity({
    action: "update_status",
    entityType: "campaign_adjustment_request",
    entityId: id,
    summary: `Cambió una solicitud de ajuste de campaña a "${status}"`,
  });

  revalidatePath("/admin/solicitudes");
}
