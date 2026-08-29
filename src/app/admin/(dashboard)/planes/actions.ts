"use server";

import { revalidatePath } from "next/cache";
import { plans } from "@/db/schema";
import { withAppUser } from "@/db/session";
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

  revalidatePath("/admin/planes");
  revalidatePath("/admin/clients");
}
