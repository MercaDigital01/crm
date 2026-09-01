"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { campaignAdjustmentRequests, campaigns } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { logActivity } from "@/lib/activity-log";
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

  const ownedCampaign = await withAppUser((tx) =>
    tx.query.campaigns.findFirst({
      where: and(eq(campaigns.id, campaignId), eq(campaigns.clientId, client.id)),
    })
  );
  if (!ownedCampaign) {
    throw new Error("Esa campaña no pertenece a tu cuenta");
  }

  await withAppUser((tx) =>
    tx.insert(campaignAdjustmentRequests).values({
      clientId: client.id,
      campaignId,
      requestType,
      notes: notes || null,
    })
  );

  await logActivity({
    action: "create",
    entityType: "campaign_adjustment_request",
    entityId: client.id,
    summary: `${client.businessName} solicitó "${requestType}" en la campaña "${ownedCampaign.name}"`,
  });

  revalidatePath("/dashboard/campanas");
}
