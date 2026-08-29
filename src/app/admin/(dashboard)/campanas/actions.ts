"use server";

import { revalidatePath } from "next/cache";
import { campaignStats, campaigns } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { isStaffUser } from "@/lib/staff";

export async function createCampaign(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const clientId = String(formData.get("clientId") ?? "");
  const platform = String(formData.get("platform") ?? "") as
    | "meta"
    | "google";
  const name = String(formData.get("name") ?? "").trim();
  const objective = String(formData.get("objective") ?? "").trim();

  if (!clientId || !platform || !name) {
    throw new Error("Faltan datos para crear la campaña");
  }

  await withAppUser((tx) =>
    tx.insert(campaigns).values({
      clientId,
      platform,
      name,
      objective: objective || null,
    })
  );

  revalidatePath("/admin/campanas");
}

export async function createCampaignStat(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const campaignId = String(formData.get("campaignId") ?? "");
  const statDate = String(formData.get("statDate") ?? "");
  const impressions = Number(formData.get("impressions") ?? 0);
  const clicks = Number(formData.get("clicks") ?? 0);
  const spendMxn = Number(formData.get("spendMxn") ?? 0);
  const ctrPercent = formData.get("ctrPercent");
  const cpcMxn = formData.get("cpcMxn");
  const conversions = Number(formData.get("conversions") ?? 0);

  if (!campaignId || !statDate) {
    throw new Error("Faltan datos para registrar la estadística");
  }

  await withAppUser((tx) =>
    tx.insert(campaignStats).values({
      campaignId,
      statDate,
      impressions: Number.isFinite(impressions) ? impressions : 0,
      clicks: Number.isFinite(clicks) ? clicks : 0,
      spendMxnCents: Math.round((Number.isFinite(spendMxn) ? spendMxn : 0) * 100),
      ctr: ctrPercent ? Number(ctrPercent) / 100 : null,
      cpc: cpcMxn ? Number(cpcMxn) : null,
      conversions: Number.isFinite(conversions) ? conversions : 0,
    })
  );

  revalidatePath("/admin/campanas");
}
