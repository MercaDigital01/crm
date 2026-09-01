"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { clientTasks, clients, supportAccessLog } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { logActivity } from "@/lib/activity-log";
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

  await logActivity({
    action: "create",
    entityType: "client",
    summary: `Creó el cliente "${businessName}"`,
  });

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

  await logActivity({
    action: "update_status",
    entityType: "client",
    entityId: clientId,
    summary: `Cambió el estado del cliente a "${status}"`,
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
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

  await logActivity({
    action: "update_plan",
    entityType: "client",
    entityId: clientId,
    summary: "Cambió el plan asignado al cliente",
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function updateClientProfile(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const clientId = String(formData.get("id") ?? "");
  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "")
    .trim()
    .toLowerCase();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();

  if (!clientId || !businessName || !contactEmail) {
    throw new Error("Nombre del negocio y correo son obligatorios");
  }

  await withAppUser((tx) =>
    tx
      .update(clients)
      .set({
        businessName,
        contactEmail,
        contactPhone: contactPhone || null,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
  );

  await logActivity({
    action: "update",
    entityType: "client",
    entityId: clientId,
    summary: `Editó el perfil de "${businessName}"`,
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function createClientTask(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const clientId = String(formData.get("clientId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!clientId || !title) {
    throw new Error("Falta el pendiente");
  }

  await withAppUser((tx) => tx.insert(clientTasks).values({ clientId, title }));

  revalidatePath(`/admin/clients/${clientId}`);
}

export async function toggleClientTask(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  const done = formData.get("done") === "true";
  if (!id) {
    throw new Error("Falta el pendiente");
  }

  await withAppUser((tx) =>
    tx.update(clientTasks).set({ done: !done }).where(eq(clientTasks.id, id))
  );

  revalidatePath(`/admin/clients/${clientId}`);
}

export async function deleteClientTask(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  if (!id) {
    throw new Error("Falta el pendiente");
  }

  await withAppUser((tx) => tx.delete(clientTasks).where(eq(clientTasks.id, id)));

  revalidatePath(`/admin/clients/${clientId}`);
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
