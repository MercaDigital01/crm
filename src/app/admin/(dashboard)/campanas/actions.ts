"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { campaignStats, campaigns } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { logActivity } from "@/lib/activity-log";
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

  await logActivity({
    action: "create",
    entityType: "campaign",
    summary: `Creó la campaña "${name}"`,
  });

  revalidatePath("/admin/campanas");
}

export async function updateCampaign(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const objective = String(formData.get("objective") ?? "").trim();
  const status = String(formData.get("status") ?? "") as
    | "activa"
    | "pausada"
    | "finalizada";

  if (!id || !name || !status) {
    throw new Error("Faltan datos para actualizar la campaña");
  }

  await withAppUser((tx) =>
    tx
      .update(campaigns)
      .set({ name, objective: objective || null, status })
      .where(eq(campaigns.id, id))
  );

  await logActivity({
    action: "update",
    entityType: "campaign",
    entityId: id,
    summary: `Editó la campaña "${name}"`,
  });

  revalidatePath("/admin/campanas");
}

export async function deleteCampaign(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Falta la campaña a eliminar");
  }

  await withAppUser(async (tx) => {
    await tx.delete(campaignStats).where(eq(campaignStats.campaignId, id));
    await tx.delete(campaigns).where(eq(campaigns.id, id));
  });

  await logActivity({
    action: "delete",
    entityType: "campaign",
    entityId: id,
    summary: "Eliminó una campaña y sus estadísticas",
  });

  revalidatePath("/admin/campanas");
}

export async function duplicateCampaign(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const campaignId = String(formData.get("campaignId") ?? "");
  const targetClientId = String(formData.get("targetClientId") ?? "");
  if (!campaignId || !targetClientId) {
    throw new Error("Falta el cliente destino");
  }

  const source = await withAppUser((tx) =>
    tx.query.campaigns.findFirst({ where: eq(campaigns.id, campaignId) })
  );
  if (!source) {
    throw new Error("Campaña no encontrada");
  }

  await withAppUser((tx) =>
    tx.insert(campaigns).values({
      clientId: targetClientId,
      platform: source.platform,
      name: source.name,
      objective: source.objective,
    })
  );

  await logActivity({
    action: "duplicate",
    entityType: "campaign",
    entityId: campaignId,
    summary: `Duplicó la campaña "${source.name}" a otro cliente`,
  });

  revalidatePath("/admin/campanas");
}

export async function updateCampaignStat(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  const statDate = String(formData.get("statDate") ?? "");
  const impressions = Number(formData.get("impressions") ?? 0);
  const clicks = Number(formData.get("clicks") ?? 0);
  const spendMxn = Number(formData.get("spendMxn") ?? 0);
  const ctrPercent = formData.get("ctrPercent");
  const cpcMxn = formData.get("cpcMxn");
  const conversions = Number(formData.get("conversions") ?? 0);

  if (!id || !statDate) {
    throw new Error("Faltan datos para actualizar la estadística");
  }

  await withAppUser((tx) =>
    tx
      .update(campaignStats)
      .set({
        statDate,
        impressions: Number.isFinite(impressions) ? impressions : 0,
        clicks: Number.isFinite(clicks) ? clicks : 0,
        spendMxnCents: Math.round(
          (Number.isFinite(spendMxn) ? spendMxn : 0) * 100
        ),
        ctr: ctrPercent ? Number(ctrPercent) / 100 : null,
        cpc: cpcMxn ? Number(cpcMxn) : null,
        conversions: Number.isFinite(conversions) ? conversions : 0,
      })
      .where(eq(campaignStats.id, id))
  );

  await logActivity({
    action: "update",
    entityType: "campaign_stat",
    entityId: id,
    summary: `Editó una estadística del ${statDate}`,
  });

  revalidatePath("/admin/campanas");
}

export async function deleteCampaignStat(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Falta la estadística a eliminar");
  }

  await withAppUser((tx) =>
    tx.delete(campaignStats).where(eq(campaignStats.id, id))
  );

  await logActivity({
    action: "delete",
    entityType: "campaign_stat",
    entityId: id,
    summary: "Eliminó una estadística de campaña",
  });

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

  await logActivity({
    action: "create",
    entityType: "campaign_stat",
    summary: `Registró una estadística del ${statDate}`,
  });

  revalidatePath("/admin/campanas");
}
