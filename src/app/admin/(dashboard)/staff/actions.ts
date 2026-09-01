"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { staffUsers } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { hashPassword } from "@/lib/admin-session";
import { logActivity } from "@/lib/activity-log";
import { isStaffUser } from "@/lib/staff";

export async function createStaffUser(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || password.length < 8) {
    throw new Error(
      "Usuario obligatorio, contraseña de al menos 8 caracteres"
    );
  }

  const existing = await withAppUser((tx) =>
    tx.query.staffUsers.findFirst({ where: eq(staffUsers.username, username) })
  );
  if (existing) {
    throw new Error("Ese nombre de usuario ya existe");
  }

  await withAppUser((tx) =>
    tx.insert(staffUsers).values({
      username,
      passwordHash: hashPassword(password),
    })
  );

  await logActivity({
    action: "create",
    entityType: "staff_user",
    summary: `Creó la cuenta de staff "${username}"`,
  });

  revalidatePath("/admin/staff");
}

export async function deleteStaffUser(formData: FormData) {
  if (!(await isStaffUser())) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Falta la cuenta a eliminar");
  }

  const remaining = await withAppUser((tx) => tx.query.staffUsers.findMany());
  if (remaining.length <= 1) {
    throw new Error("No puedes eliminar la única cuenta de staff existente");
  }

  await withAppUser((tx) => tx.delete(staffUsers).where(eq(staffUsers.id, id)));

  await logActivity({
    action: "delete",
    entityType: "staff_user",
    entityId: id,
    summary: "Eliminó una cuenta de staff",
  });

  revalidatePath("/admin/staff");
}
