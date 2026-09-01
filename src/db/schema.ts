import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgRole,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const appRuntime = pgRole("app_runtime").existing();

export const clientStatus = pgEnum("client_status", [
  "pendiente_de_pago",
  "activo",
  "en_gracia",
  "suspendido",
  "cancelado",
]);

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    priceMxnCents: integer("price_mxn_cents").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("plans_read_all", {
      for: "select",
      to: appRuntime,
      using: sql`true`,
    }),
    pgPolicy("plans_staff_write", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
      withCheck: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").unique(),
    businessName: text("business_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone"),
    status: clientStatus("status").notNull().default("pendiente_de_pago"),
    planId: uuid("plan_id").references(() => plans.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("clients_own_row", {
      for: "all",
      to: appRuntime,
      using: sql`${table.clerkUserId} = current_setting('app.clerk_user_id', true)`,
    }),
    pgPolicy("clients_staff_full_access", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

export const campaignPlatform = pgEnum("campaign_platform", ["meta", "google"]);

export const campaignStatus = pgEnum("campaign_status", [
  "activa",
  "pausada",
  "finalizada",
]);

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    platform: campaignPlatform("platform").notNull(),
    name: text("name").notNull(),
    objective: text("objective"),
    status: campaignStatus("status").notNull().default("activa"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("campaigns_own_client", {
      for: "all",
      to: appRuntime,
      using: sql`${table.clientId} in (select id from clients where clerk_user_id = current_setting('app.clerk_user_id', true))`,
    }),
    pgPolicy("campaigns_staff_full_access", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

// Normalized subset of fields common to Meta Insights API and Google Ads API
// reports, so the dashboard has something typed to sort/display by. `raw`
// keeps the full original response shape (Meta's `actions[]`, Google's
// `cost_micros`/segments) so nothing is lost once real sync lands (Fase 5).
export const campaignStats = pgTable(
  "campaign_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    statDate: date("stat_date").notNull(),
    impressions: integer("impressions").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    spendMxnCents: integer("spend_mxn_cents").notNull().default(0),
    ctr: real("ctr"),
    cpc: real("cpc"),
    conversions: integer("conversions").notNull().default(0),
    raw: jsonb("raw"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("campaign_stats_own_client", {
      for: "all",
      to: appRuntime,
      using: sql`${table.campaignId} in (select c.id from campaigns c join clients cl on cl.id = c.client_id where cl.clerk_user_id = current_setting('app.clerk_user_id', true))`,
    }),
    pgPolicy("campaign_stats_staff_full_access", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

export const whatsappOutcome = pgEnum("whatsapp_outcome", [
  "cita_agendada",
  "venta_cerrada",
  "seguimiento_pendiente",
  "sin_resultado",
]);

export const whatsappEvents = pgTable(
  "whatsapp_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    contactName: text("contact_name"),
    contactPhone: text("contact_phone"),
    outcome: whatsappOutcome("outcome").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("whatsapp_events_own_client", {
      for: "all",
      to: appRuntime,
      using: sql`${table.clientId} in (select id from clients where clerk_user_id = current_setting('app.clerk_user_id', true))`,
    }),
    pgPolicy("whatsapp_events_staff_full_access", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

export const contentStatus = pgEnum("content_status", [
  "borrador",
  "programado",
  "publicado",
]);

export const contentFormat = pgEnum("content_format", [
  "reel",
  "carrusel",
  "imagen",
]);

export const contentItems = pgTable(
  "content_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    scheduledDate: date("scheduled_date").notNull(),
    platform: text("platform").notNull(),
    pillar: text("pillar"),
    title: text("title").notNull(),
    status: contentStatus("status").notNull().default("borrador"),
    format: contentFormat("format").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("content_items_own_client", {
      for: "all",
      to: appRuntime,
      using: sql`${table.clientId} in (select id from clients where clerk_user_id = current_setting('app.clerk_user_id', true))`,
    }),
    pgPolicy("content_items_staff_full_access", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

export const agentTone = pgEnum("agent_tone", [
  "cercano_amigable",
  "profesional_formal",
  "divertido_desenfadado",
]);

export const agentConversationGoal = pgEnum("agent_conversation_goal", [
  "agendar_cita",
  "cerrar_venta",
  "calificar_lead",
  "soporte",
]);

export const agentConfigs = pgTable(
  "agent_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .unique()
      .references(() => clients.id),
    agentName: text("agent_name").notNull(),
    tone: agentTone("tone").notNull().default("cercano_amigable"),
    welcomeMessage: text("welcome_message").notNull(),
    businessHours: text("business_hours").notNull(),
    knowledgeBase: text("knowledge_base"),
    faqs: text("faqs"),
    conversationGoal: agentConversationGoal("conversation_goal")
      .notNull()
      .default("agendar_cita"),
    autoReplyOutsideHours: boolean("auto_reply_outside_hours")
      .notNull()
      .default(true),
    outsideHoursMessage: text("outside_hours_message"),
    escalationKeywords: text("escalation_keywords"),
    maxAutoMessages: integer("max_auto_messages").notNull().default(6),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("agent_configs_own_client", {
      for: "all",
      to: appRuntime,
      using: sql`${table.clientId} in (select id from clients where clerk_user_id = current_setting('app.clerk_user_id', true))`,
    }),
    pgPolicy("agent_configs_staff_full_access", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

// Vista de Soporte audit trail (docs/terminos-de-servicio.md §10.2). Staff-only
// by design — no "own row" policy exists here, a client must never be able to
// read who accessed their account.
export const supportAccessLog = pgTable(
  "support_access_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminUsername: text("admin_username").notNull(),
    targetClientId: uuid("target_client_id")
      .notNull()
      .references(() => clients.id),
    accessedAt: timestamp("accessed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("support_access_log_staff_only", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);
