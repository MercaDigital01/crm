"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { contentItems, deliverables } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { logActivity } from "@/lib/activity-log";
import { signUploadParams } from "@/lib/cloudinary";
import { isStaffUser } from "@/lib/staff";

export async function getUploadSignature(folder: string) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = signUploadParams({ folder, timestamp });

  return {
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

export async function createDeliverable(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const clientId = String(formData.get("clientId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "");
  const cloudinaryPublicId = String(formData.get("cloudinaryPublicId") ?? "");
  const fileType = String(formData.get("fileType") ?? "");

  if (!clientId || !title || !fileUrl || !cloudinaryPublicId || !fileType) {
    throw new Error("Faltan datos del archivo subido");
  }

  await withAppUser((tx) =>
    tx.insert(deliverables).values({
      clientId,
      title,
      fileUrl,
      cloudinaryPublicId,
      fileType,
    })
  );

  await logActivity({
    action: "create",
    entityType: "deliverable",
    entityId: clientId,
    summary: `Subió el entregable "${title}"`,
  });

  revalidatePath(`/admin/clients/${clientId}`);
}

export async function setContentItemThumbnail(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const itemId = String(formData.get("itemId") ?? "");
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "");
  if (!itemId || !thumbnailUrl) {
    throw new Error("Faltan datos de la miniatura");
  }

  await withAppUser((tx) =>
    tx
      .update(contentItems)
      .set({ thumbnailUrl })
      .where(eq(contentItems.id, itemId))
  );

  revalidatePath("/admin/calendario");
}
