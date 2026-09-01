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
    thumbnailUrl: text("thumbnail_url"),
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

export const requestStatus = pgEnum("request_status", [
  "pendiente",
  "revisado",
  "descartado",
]);

export const contentRequests = pgTable(
  "content_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    title: text("title").notNull(),
    notes: text("notes"),
    status: requestStatus("status").notNull().default("pendiente"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("content_requests_own_client", {
      for: "all",
      to: appRuntime,
      using: sql`${table.clientId} in (select id from clients where clerk_user_id = current_setting('app.clerk_user_id', true))`,
      withCheck: sql`${table.clientId} in (select id from clients where clerk_user_id = current_setting('app.clerk_user_id', true))`,
    }),
    pgPolicy("content_requests_staff_full_access", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
      withCheck: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

export const campaignAdjustmentType = pgEnum("campaign_adjustment_type", [
  "pausar",
  "aumentar_presupuesto",
  "reducir_presupuesto",
  "otro",
]);

export const campaignAdjustmentRequests = pgTable(
  "campaign_adjustment_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    requestType: campaignAdjustmentType("request_type").notNull(),
    notes: text("notes"),
    status: requestStatus("status").notNull().default("pendiente"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("campaign_adjustment_requests_own_client", {
      for: "all",
      to: appRuntime,
      using: sql`${table.clientId} in (select id from clients where clerk_user_id = current_setting('app.clerk_user_id', true))`,
      withCheck: sql`${table.clientId} in (select id from clients where clerk_user_id = current_setting('app.clerk_user_id', true))`,
    }),
    pgPolicy("campaign_adjustment_requests_staff_full_access", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
      withCheck: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

// Client side is read-only by design here (staff upload from the admin
// panel in a later pass) — own-client policy is SELECT-only, unlike the
// for:"all" pattern used elsewhere for client-writable tables.
export const deliverables = pgTable(
  "deliverables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    title: text("title").notNull(),
    fileUrl: text("file_url").notNull(),
    cloudinaryPublicId: text("cloudinary_public_id").notNull(),
    fileType: text("file_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("deliverables_own_client_read", {
      for: "select",
      to: appRuntime,
      using: sql`${table.clientId} in (select id from clients where clerk_user_id = current_setting('app.clerk_user_id', true))`,
    }),
    pgPolicy("deliverables_staff_full_access", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
      withCheck: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

// Same read-only-for-client shape as deliverables — staff record payments
// from the admin panel in a later pass, matching how billing is still
// coordinated manually per dashboard/pago's existing copy.
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    amountMxnCents: integer("amount_mxn_cents").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }).notNull(),
    method: text("method"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("payments_own_client_read", {
      for: "select",
      to: appRuntime,
      using: sql`${table.clientId} in (select id from clients where clerk_user_id = current_setting('app.clerk_user_id', true))`,
    }),
    pgPolicy("payments_staff_full_access", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
      withCheck: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

// Lightweight staff activity log — one line per mutation, not a full
// field-level diff. Staff-only, same shape as support_access_log.
export const activityLog = pgTable(
  "activity_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUsername: text("actor_username").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    summary: text("summary").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => [
    pgPolicy("activity_log_staff_only", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
      withCheck: sql`current_setting('app.is_staff', true) = 'true'`,
    }),
  ]
);

// Internal staff checklist per client — not client-visible, staff-only.
export const clientTasks = pgTable(
  "client_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    title: text("title").notNull(),
    done: boolean("done").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => [
    pgPolicy("client_tasks_staff_only", {
      for: "all",
      to: appRuntime,
      using: sql`current_setting('app.is_staff', true) = 'true'`,
      withCheck: sql`current_setting('app.is_staff', true) = 'true'`,
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
