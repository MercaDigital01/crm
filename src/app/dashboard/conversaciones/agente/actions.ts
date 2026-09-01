"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { agentConfigs } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { getViewedClient } from "../../data";

const TONE_VALUES = [
  "cercano_amigable",
  "profesional_formal",
  "divertido_desenfadado",
] as const;

const GOAL_VALUES = [
  "agendar_cita",
  "cerrar_venta",
  "calificar_lead",
  "soporte",
] as const;

export async function saveAgentConfig(formData: FormData) {
  const { userId } = await auth();
  const { client } = await getViewedClient(userId ?? null);
  if (!client) {
    throw new Error("No hay un perfil de cliente activo");
  }

  const agentName = String(formData.get("agentName") ?? "").trim();
  const toneRaw = String(formData.get("tone") ?? "");
  const welcomeMessage = String(formData.get("welcomeMessage") ?? "").trim();
  const businessHours = String(formData.get("businessHours") ?? "").trim();
  const knowledgeBase = String(formData.get("knowledgeBase") ?? "").trim();
  const faqs = String(formData.get("faqs") ?? "").trim();
  const goalRaw = String(formData.get("conversationGoal") ?? "");
  const autoReplyOutsideHours = formData.get("autoReplyOutsideHours") === "on";
  const outsideHoursMessage = String(
    formData.get("outsideHoursMessage") ?? ""
  ).trim();
  const escalationKeywords = String(
    formData.get("escalationKeywords") ?? ""
  ).trim();
  const maxAutoMessagesRaw = String(formData.get("maxAutoMessages") ?? "6");

  if (!agentName || !welcomeMessage || !businessHours) {
    throw new Error("Nombre del agente, saludo y horario son obligatorios");
  }

  const tone = TONE_VALUES.includes(toneRaw as (typeof TONE_VALUES)[number])
    ? (toneRaw as (typeof TONE_VALUES)[number])
    : "cercano_amigable";
  const conversationGoal = GOAL_VALUES.includes(
    goalRaw as (typeof GOAL_VALUES)[number]
  )
    ? (goalRaw as (typeof GOAL_VALUES)[number])
    : "agendar_cita";
  const maxAutoMessages = Math.max(
    1,
    Number.parseInt(maxAutoMessagesRaw, 10) || 6
  );

  await withAppUser((tx) =>
    tx
      .insert(agentConfigs)
      .values({
        clientId: client.id,
        agentName,
        tone,
        welcomeMessage,
        businessHours,
        knowledgeBase: knowledgeBase || null,
        faqs: faqs || null,
        conversationGoal,
        autoReplyOutsideHours,
        outsideHoursMessage: outsideHoursMessage || null,
        escalationKeywords: escalationKeywords || null,
        maxAutoMessages,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: agentConfigs.clientId,
        set: {
          agentName,
          tone,
          welcomeMessage,
          businessHours,
          knowledgeBase: knowledgeBase || null,
          faqs: faqs || null,
          conversationGoal,
          autoReplyOutsideHours,
          outsideHoursMessage: outsideHoursMessage || null,
          escalationKeywords: escalationKeywords || null,
          maxAutoMessages,
          updatedAt: new Date(),
        },
      })
  );

  revalidatePath("/dashboard/conversaciones/agente");
}
