"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { contentRequests } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { getViewedClient } from "../data";

export async function createContentRequest(formData: FormData) {
  const { userId } = await auth();
  const { client } = await getViewedClient(userId ?? null);
  if (!client) {
    throw new Error("No hay un perfil de cliente activo");
  }

  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title) {
    throw new Error("Falta el título de la idea");
  }

  await withAppUser((tx) =>
    tx.insert(contentRequests).values({
      clientId: client.id,
      title,
      notes: notes || null,
    })
  );

  revalidatePath("/dashboard/calendario");
}
