"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { clients, supportAccessLog } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { isStaffUser } from "@/lib/staff";
import {
  SUPPORT_VIEW_COOKIE,
  SUPPORT_VIEW_MAX_AGE_SECONDS,
} from "@/lib/support-view";

export async function createClient(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "")
    .trim()
    .toLowerCase();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();

  if (!businessName || !contactEmail) {
    throw new Error("Nombre del negocio y correo son obligatorios");
  }

  await withAppUser((tx) =>
    tx.insert(clients).values({
      businessName,
      contactEmail,
      contactPhone: contactPhone || null,
    })
  );

  revalidatePath("/admin/clients");
}

export async function updateClientStatus(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const clientId = String(formData.get("clientId") ?? "");
  const status = String(formData.get("status") ?? "") as
    | "pendiente_de_pago"
    | "activo"
    | "en_gracia"
    | "suspendido"
    | "cancelado";

  if (!clientId || !status) {
    throw new Error("Faltan datos para actualizar el estado");
  }

  await withAppUser((tx) =>
    tx
      .update(clients)
      .set({ status, updatedAt: new Date() })
      .where(eq(clients.id, clientId))
  );

  revalidatePath("/admin/clients");
}

export async function updateClientPlan(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const clientId = String(formData.get("clientId") ?? "");
  const planId = String(formData.get("planId") ?? "");

  if (!clientId) {
    throw new Error("Falta el cliente a actualizar");
  }

  await withAppUser((tx) =>
    tx
      .update(clients)
      .set({ planId: planId || null, updatedAt: new Date() })
      .where(eq(clients.id, clientId))
  );

  revalidatePath("/admin/clients");
}

export async function enterSupportView(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const clientId = String(formData.get("clientId") ?? "");
  if (!clientId) {
    throw new Error("Falta el cliente a consultar");
  }

  const admin = await getAdminSession();

  await withAppUser((tx) =>
    tx.insert(supportAccessLog).values({
      adminUsername: admin?.username ?? "desconocido",
      targetClientId: clientId,
    })
  );

  const cookieStore = await cookies();
  cookieStore.set(SUPPORT_VIEW_COOKIE, clientId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SUPPORT_VIEW_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect("/dashboard");
}

export async function exitSupportView() {
  const cookieStore = await cookies();
  cookieStore.delete(SUPPORT_VIEW_COOKIE);
  redirect("/admin/clients");
}
