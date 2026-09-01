import { activityLog } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { getAdminSession } from "./admin-session";

export async function logActivity({
  action,
  entityType,
  entityId,
  summary,
}: {
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
}) {
  const session = await getAdminSession();
  await withAppUser((tx) =>
    tx.insert(activityLog).values({
      actorUsername: session?.username ?? "desconocido",
      action,
      entityType,
      entityId: entityId ?? null,
      summary,
    })
  );
}
