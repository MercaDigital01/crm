"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { agentConfigs } from "@/db/schema";
import { SubmitButton } from "@/components/ui/SubmitButton";

const CARD = "admin-card flex flex-col gap-5 md:p-8";
const LABEL = "text-xs font-medium text-white/60";
const CAPTION = "text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70";
const INPUT = "text-sm";

const TONE_OPTIONS = [
  { value: "cercano_amigable", label: "Cercano y amigable" },
  { value: "profesional_formal", label: "Profesional y formal" },
  { value: "divertido_desenfadado", label: "Divertido y desenfadado" },
] as const;

const GOAL_OPTIONS = [
  { value: "agendar_cita", label: "Agendar una cita" },
  { value: "cerrar_venta", label: "Cerrar una venta" },
  { value: "calificar_lead", label: "Calificar el interés (lead)" },
  { value: "soporte", label: "Dar soporte y resolver dudas" },
] as const;

function Field({
  id,
  label,
  children,
  hint,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-md-admin-rose-muted">{hint}</span>}
    </div>
  );
}

function Toggle({
  name,
  checked,
  onChange,
  label,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-white">{label}</span>
        {hint && <span className="text-xs text-md-admin-rose-muted">{hint}</span>}
      </div>
      <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-white/15 transition-colors peer-checked:bg-md-admin-gold" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );
}

type AgentConfig = typeof agentConfigs.$inferSelect;

export function AgentConfigPanel({
  businessName,
  initialConfig,
  saveAgentConfig,
}: {
  businessName: string;
  initialConfig: AgentConfig | null;
  saveAgentConfig: (formData: FormData) => Promise<void>;
}) {
  const [autoReplyOutsideHours, setAutoReplyOutsideHours] = useState(
    initialConfig?.autoReplyOutsideHours ?? true
  );

  return (
    <form action={saveAgentConfig} className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/conversaciones"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Conversaciones
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="admin-h1">
            Agente de IA para WhatsApp.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-md-admin-rose-muted">
            Configura cómo responde el agente a tus clientes por WhatsApp.
            {initialConfig
              ? ` Última actualización: ${new Date(
                  initialConfig.updatedAt
                ).toLocaleString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}.`
              : " Todavía no has guardado una configuración."}
          </p>
        </div>
      </div>

      <div className={CARD}>
        <span className={CAPTION}>Conexión</span>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="w-fit rounded-full bg-md-admin-gold/20 px-3 py-1 text-xs font-medium text-md-admin-gold">
              No conectado
            </span>
            <span className="text-sm text-md-admin-rose-muted">
              Ningún número de WhatsApp Business está vinculado todavía.
            </span>
          </div>
          <button
            type="button"
            disabled
            className="w-fit cursor-not-allowed rounded-full border border-white/15 px-4 py-2 text-sm text-white/40"
          >
            Conectar WhatsApp Business
          </button>
        </div>
      </div>

      <div className={CARD}>
        <span className={CAPTION}>Identidad del agente</span>

        <Field id="agentName" label="Nombre del agente">
          <input
            id="agentName"
            name="agentName"
            required
            defaultValue={initialConfig?.agentName ?? `Asistente de ${businessName}`}
            className={INPUT}
          />
        </Field>

        <Field id="tone" label="Tono de voz">
          <select
            id="tone"
            name="tone"
            defaultValue={initialConfig?.tone ?? TONE_OPTIONS[0].value}
            className={INPUT}
          >
            {TONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="welcomeMessage" label="Mensaje de bienvenida">
          <textarea
            id="welcomeMessage"
            name="welcomeMessage"
            required
            defaultValue={
              initialConfig?.welcomeMessage ??
              `¡Hola! 👋 Gracias por escribirle a ${businessName}. ¿En qué te puedo ayudar hoy?`
            }
            rows={3}
            className={`${INPUT} resize-none`}
          />
        </Field>
      </div>

      <div className={CARD}>
        <span className={CAPTION}>Base de conocimiento del negocio</span>

        <Field id="businessHours" label="Horario de atención">
          <input
            id="businessHours"
            name="businessHours"
            required
            defaultValue={initialConfig?.businessHours ?? "Lun-Sáb, 9:00-19:00"}
            className={INPUT}
          />
        </Field>

        <Field id="knowledgeBase" label="Productos, precios y promociones vigentes">
          <textarea
            id="knowledgeBase"
            name="knowledgeBase"
            defaultValue={initialConfig?.knowledgeBase ?? ""}
            rows={4}
            placeholder="Ej. Paleta de yogurt $35, promo 2x1 los martes, envíos a domicilio con costo de $30..."
            className={`${INPUT} resize-none`}
          />
        </Field>

        <Field id="faqs" label="Preguntas frecuentes">
          <textarea
            id="faqs"
            name="faqs"
            defaultValue={initialConfig?.faqs ?? ""}
            rows={4}
            placeholder="Ej. ¿Tienen servicio a domicilio? Sí, en un radio de 5 km..."
            className={`${INPUT} resize-none`}
          />
        </Field>
      </div>

      <div className={CARD}>
        <span className={CAPTION}>Reglas de comportamiento</span>

        <Toggle
          name="autoReplyOutsideHours"
          checked={autoReplyOutsideHours}
          onChange={setAutoReplyOutsideHours}
          label="Responder automáticamente fuera de horario"
          hint="Si está apagado, los mensajes fuera de horario esperan a un humano."
        />

        {autoReplyOutsideHours && (
          <Field id="outsideHoursMessage" label="Mensaje fuera de horario">
            <textarea
              id="outsideHoursMessage"
              name="outsideHoursMessage"
              defaultValue={
                initialConfig?.outsideHoursMessage ??
                "Gracias por tu mensaje. En este momento estamos fuera de horario, te respondemos en cuanto abramos."
              }
              rows={2}
              className={`${INPUT} resize-none`}
            />
          </Field>
        )}

        <Field
          id="escalationKeywords"
          label="Palabras clave que transfieren a un humano"
          hint="Separadas por coma. Si el cliente escribe alguna de estas palabras, el agente deja de responder y avisa al equipo."
        >
          <input
            id="escalationKeywords"
            name="escalationKeywords"
            defaultValue={
              initialConfig?.escalationKeywords ??
              "hablar con alguien, queja, urgente, cancelar"
            }
            className={INPUT}
          />
        </Field>

        <Field id="maxAutoMessages" label="Mensajes automáticos antes de transferir a un humano">
          <input
            id="maxAutoMessages"
            type="number"
            name="maxAutoMessages"
            min={1}
            defaultValue={initialConfig?.maxAutoMessages ?? 6}
            className={`${INPUT} max-w-[8rem]`}
          />
        </Field>
      </div>

      <div className={CARD}>
        <span className={CAPTION}>Objetivo de la conversación</span>
        <Field id="conversationGoal" label="¿Qué debe lograr el agente en cada conversación?">
          <select
            id="conversationGoal"
            name="conversationGoal"
            defaultValue={initialConfig?.conversationGoal ?? GOAL_OPTIONS[0].value}
            className={INPUT}
          >
            {GOAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <SubmitButton className="w-fit rounded-full bg-md-admin-gold px-5 py-2.5 text-sm font-medium text-md-admin-card-deep transition-colors hover:bg-md-admin-gold/90">
          Guardar cambios
        </SubmitButton>
      </div>
    </form>
  );
}
