"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { campaignAdjustmentRequests } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { getViewedClient } from "../data";

const REQUEST_TYPES = [
  "pausar",
  "aumentar_presupuesto",
  "reducir_presupuesto",
  "otro",
] as const;

export async function createCampaignAdjustmentRequest(formData: FormData) {
  const { userId } = await auth();
  const { client } = await getViewedClient(userId ?? null);
  if (!client) {
    throw new Error("No hay un perfil de cliente activo");
  }

  const campaignId = String(formData.get("campaignId") ?? "");
  const requestTypeRaw = String(formData.get("requestType") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!campaignId) {
    throw new Error("Falta la campaña");
  }
  const requestType = REQUEST_TYPES.includes(
    requestTypeRaw as (typeof REQUEST_TYPES)[number]
  )
    ? (requestTypeRaw as (typeof REQUEST_TYPES)[number])
    : "otro";

  await withAppUser((tx) =>
    tx.insert(campaignAdjustmentRequests).values({
      clientId: client.id,
      campaignId,
      requestType,
      notes: notes || null,
    })
  );

  revalidatePath("/dashboard/campanas");
}
