"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";
const CARD = `flex flex-col gap-5 rounded-2xl bg-white p-6 md:p-8 ${CARD_SHADOW}`;
const LABEL = "text-xs font-medium text-gray-600";
const CAPTION = "text-xs font-medium uppercase tracking-wide text-gray-400";
const INPUT = "rounded border border-gray-300 px-3 py-2 text-sm text-gray-900";

const TONE_OPTIONS = [
  "Cercano y amigable",
  "Profesional y formal",
  "Divertido y desenfadado",
] as const;

const GOAL_OPTIONS = [
  "Agendar una cita",
  "Cerrar una venta",
  "Calificar el interés (lead)",
  "Dar soporte y resolver dudas",
] as const;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-md-teal" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function AgentConfigPanel({ businessName }: { businessName: string }) {
  const [agentName, setAgentName] = useState(`Asistente de ${businessName}`);
  const [tone, setTone] = useState<(typeof TONE_OPTIONS)[number]>(
    TONE_OPTIONS[0]
  );
  const [welcomeMessage, setWelcomeMessage] = useState(
    `¡Hola! 👋 Gracias por escribirle a ${businessName}. ¿En qué te puedo ayudar hoy?`
  );
  const [businessHours, setBusinessHours] = useState("Lun-Sáb, 9:00-19:00");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [faqs, setFaqs] = useState("");
  const [conversationGoal, setConversationGoal] = useState<
    (typeof GOAL_OPTIONS)[number]
  >(GOAL_OPTIONS[0]);
  const [autoReplyOutsideHours, setAutoReplyOutsideHours] = useState(true);
  const [outsideHoursMessage, setOutsideHoursMessage] = useState(
    "Gracias por tu mensaje. En este momento estamos fuera de horario, te respondemos en cuanto abramos."
  );
  const [escalationKeywords, setEscalationKeywords] = useState(
    "hablar con alguien, queja, urgente, cancelar"
  );
  const [maxAutoMessages, setMaxAutoMessages] = useState("6");
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/conversaciones"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Conversaciones
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Agente de IA para WhatsApp.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-gray-500">
            Configura cómo responde el agente a tus clientes por WhatsApp.
            Este panel es una vista previa — la conexión con WhatsApp Business
            y el guardado de estos ajustes llegan en la siguiente fase.
          </p>
        </div>
      </div>

      <div className={CARD}>
        <span className={CAPTION}>Conexión</span>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="w-fit rounded-full bg-md-gold/10 px-3 py-1 text-xs font-medium text-[#a5790a]">
              No conectado
            </span>
            <span className="text-sm text-gray-500">
              Ningún número de WhatsApp Business está vinculado todavía.
            </span>
          </div>
          <button
            type="button"
            disabled
            className="w-fit cursor-not-allowed rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-400"
          >
            Conectar WhatsApp Business
          </button>
        </div>
      </div>

      <div className={CARD}>
        <span className={CAPTION}>Identidad del agente</span>

        <Field label="Nombre del agente">
          <input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Tono de voz">
          <select
            value={tone}
            onChange={(e) =>
              setTone(e.target.value as (typeof TONE_OPTIONS)[number])
            }
            className={INPUT}
          >
            {TONE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Mensaje de bienvenida">
          <textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            rows={3}
            className={`${INPUT} resize-none`}
          />
        </Field>
      </div>

      <div className={CARD}>
        <span className={CAPTION}>Base de conocimiento del negocio</span>

        <Field label="Horario de atención">
          <input
            value={businessHours}
            onChange={(e) => setBusinessHours(e.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Productos, precios y promociones vigentes">
          <textarea
            value={knowledgeBase}
            onChange={(e) => setKnowledgeBase(e.target.value)}
            rows={4}
            placeholder="Ej. Paleta de yogurt $35, promo 2x1 los martes, envíos a domicilio con costo de $30..."
            className={`${INPUT} resize-none`}
          />
        </Field>

        <Field label="Preguntas frecuentes">
          <textarea
            value={faqs}
            onChange={(e) => setFaqs(e.target.value)}
            rows={4}
            placeholder="Ej. ¿Tienen servicio a domicilio? Sí, en un radio de 5 km..."
            className={`${INPUT} resize-none`}
          />
        </Field>
      </div>

      <div className={CARD}>
        <span className={CAPTION}>Reglas de comportamiento</span>

        <Toggle
          checked={autoReplyOutsideHours}
          onChange={setAutoReplyOutsideHours}
          label="Responder automáticamente fuera de horario"
          hint="Si está apagado, los mensajes fuera de horario esperan a un humano."
        />

        {autoReplyOutsideHours && (
          <Field label="Mensaje fuera de horario">
            <textarea
              value={outsideHoursMessage}
              onChange={(e) => setOutsideHoursMessage(e.target.value)}
              rows={2}
              className={`${INPUT} resize-none`}
            />
          </Field>
        )}

        <Field label="Palabras clave que transfieren a un humano">
          <input
            value={escalationKeywords}
            onChange={(e) => setEscalationKeywords(e.target.value)}
            className={INPUT}
          />
          <span className="text-xs text-gray-500">
            Separadas por coma. Si el cliente escribe alguna de estas
            palabras, el agente deja de responder y avisa al equipo.
          </span>
        </Field>

        <Field label="Mensajes automáticos antes de transferir a un humano">
          <input
            type="number"
            min={1}
            value={maxAutoMessages}
            onChange={(e) => setMaxAutoMessages(e.target.value)}
            className={`${INPUT} max-w-[8rem]`}
          />
        </Field>
      </div>

      <div className={CARD}>
        <span className={CAPTION}>Objetivo de la conversación</span>
        <Field label="¿Qué debe lograr el agente en cada conversación?">
          <select
            value={conversationGoal}
            onChange={(e) =>
              setConversationGoal(
                e.target.value as (typeof GOAL_OPTIONS)[number]
              )
            }
            className={INPUT}
          >
            {GOAL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={() => setSaved(true)}
          className="w-fit rounded-full bg-md-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-md-teal/90"
        >
          Guardar cambios
        </button>
        {saved && (
          <span className="text-xs text-gray-500">
            Vista previa guardada localmente — todavía no se sincroniza con
            WhatsApp.
          </span>
        )}
      </div>
    </div>
  );
}
