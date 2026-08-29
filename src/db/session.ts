import { auth } from "@clerk/nextjs/server";
import { Pool } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle, NeonDatabase } from "drizzle-orm/neon-serverless";
import { getAdminSession } from "@/lib/admin-session";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_APP_URL! });
const appDb = drizzle(pool, { schema });

export async function withAppUser<T>(
  callback: (tx: NeonDatabase<typeof schema>) => Promise<T>
): Promise<T> {
  // Two independent identities can reach here: a real client via Clerk, or
  // staff via the separate admin-session system (src/lib/admin-session.ts).
  // Staff never has a clerk_user_id — RLS staff policies key only on
  // app.is_staff, never on app.clerk_user_id, so a blank id is safe.
  const adminSession = await getAdminSession();
  const { userId } = await auth();

  if (!adminSession && !userId) {
    throw new Error("No hay sesión activa");
  }

  return appDb.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.clerk_user_id', ${userId ?? ""}, true)`
    );
    await tx.execute(
      sql`select set_config('app.is_staff', ${adminSession ? "true" : "false"}, true)`
    );
    return callback(tx);
  });
}
