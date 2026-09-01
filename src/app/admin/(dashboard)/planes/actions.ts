"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { clients, plans } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { logActivity } from "@/lib/activity-log";
import { isStaffUser } from "@/lib/staff";

export async function createPlan(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const name = String(formData.get("name") ?? "").trim();
  const priceMxn = Number(formData.get("priceMxn") ?? 0);
  const description = String(formData.get("description") ?? "").trim();

  if (!name || !Number.isFinite(priceMxn) || priceMxn <= 0) {
    throw new Error("Nombre y precio son obligatorios");
  }

  await withAppUser((tx) =>
    tx.insert(plans).values({
      name,
      priceMxnCents: Math.round(priceMxn * 100),
      description: description || null,
    })
  );

  await logActivity({
    action: "create",
    entityType: "plan",
    summary: `Creó el plan "${name}"`,
  });

  revalidatePath("/admin/planes");
  revalidatePath("/admin/clients");
}

export async function updatePlan(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const priceMxn = Number(formData.get("priceMxn") ?? 0);
  const description = String(formData.get("description") ?? "").trim();

  if (!id || !name || !Number.isFinite(priceMxn) || priceMxn <= 0) {
    throw new Error("Nombre y precio son obligatorios");
  }

  await withAppUser((tx) =>
    tx
      .update(plans)
      .set({
        name,
        priceMxnCents: Math.round(priceMxn * 100),
        description: description || null,
      })
      .where(eq(plans.id, id))
  );

  await logActivity({
    action: "update",
    entityType: "plan",
    entityId: id,
    summary: `Editó el plan "${name}"`,
  });

  revalidatePath("/admin/planes");
  revalidatePath("/admin/clients");
}

export async function deletePlan(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Falta el plan a eliminar");
  }

  const inUse = await withAppUser((tx) =>
    tx.query.clients.findFirst({ where: eq(clients.planId, id) })
  );
  if (inUse) {
    throw new Error(
      `No se puede eliminar: "${inUse.businessName}" todavía tiene este plan asignado.`
    );
  }

  await withAppUser((tx) => tx.delete(plans).where(eq(plans.id, id)));

  await logActivity({
    action: "delete",
    entityType: "plan",
    entityId: id,
    summary: "Eliminó un plan",
  });

  revalidatePath("/admin/planes");
}
