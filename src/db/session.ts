import { auth, currentUser } from "@clerk/nextjs/server";
import { Pool } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle, NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_APP_URL! });
const appDb = drizzle(pool, { schema });

export async function withAppUser<T>(
  callback: (tx: NeonDatabase<typeof schema>) => Promise<T>
): Promise<T> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("No hay sesión activa");
  }

  const user = await currentUser();
  const isStaff = user?.publicMetadata?.role === "owner";

  return appDb.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.clerk_user_id', ${userId}, true)`
    );
    await tx.execute(
      sql`select set_config('app.is_staff', ${isStaff ? "true" : "false"}, true)`
    );
    return callback(tx);
  });
}
