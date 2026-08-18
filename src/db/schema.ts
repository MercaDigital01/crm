import { sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgPolicy,
  pgRole,
  pgTable,
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
  ]
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
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
