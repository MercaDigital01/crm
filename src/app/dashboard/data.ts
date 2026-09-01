import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import {
  agentConfigs,
  campaignStats,
  campaigns,
  clients,
  contentItems,
  plans,
  whatsappEvents,
} from "@/db/schema";
import { withAppUser } from "@/db/session";
import { isStaffUser } from "@/lib/staff";
import { SUPPORT_VIEW_COOKIE } from "@/lib/support-view";

async function claimUnclaimedProfile(userId: string) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) return;

  const unclaimed = await db.query.clients.findFirst({
    where: and(isNull(clients.clerkUserId), eq(clients.contactEmail, email)),
  });
  if (!unclaimed) return;

  await db
    .update(clients)
    .set({ clerkUserId: userId, updatedAt: new Date() })
    .where(eq(clients.id, unclaimed.id));
}

export const getOwnClient = cache(async (userId: string) => {
  let ownClient = await withAppUser((tx) =>
    tx.query.clients.findFirst({ where: eq(clients.clerkUserId, userId) })
  );

  if (!ownClient) {
    await claimUnclaimedProfile(userId);
    ownClient = await withAppUser((tx) =>
      tx.query.clients.findFirst({ where: eq(clients.clerkUserId, userId) })
    );
  }

  return ownClient ?? null;
});

export async function getClientById(clientId: string) {
  return withAppUser((tx) =>
    tx.query.clients.findFirst({ where: eq(clients.id, clientId) })
  );
}

export type ViewedClient = {
  client: NonNullable<Awaited<ReturnType<typeof getOwnClient>>> | null;
  isSupportView: boolean;
};

// Resolves which client's data the current dashboard request should show:
// the signed-in user's own client row, or — for staff with an active Vista
// de Soporte cookie — the client they're impersonating (read-only, see
// docs/terminos-de-servicio.md §10). Every dashboard page calls this instead
// of getOwnClient directly so the two never drift out of sync.
//
// `userId` is null for staff, who authenticate via the separate admin-session
// system (src/lib/admin-session.ts) and have no Clerk identity at all.
export const getViewedClient = cache(
  async (userId: string | null): Promise<ViewedClient> => {
    if (await isStaffUser()) {
      const cookieStore = await cookies();
      const supportClientId = cookieStore.get(SUPPORT_VIEW_COOKIE)?.value;
      if (supportClientId) {
        const client = await getClientById(supportClientId);
        if (client) {
          return { client, isSupportView: true };
        }
      }
      return { client: null, isSupportView: false };
    }

    if (!userId) return { client: null, isSupportView: false };
    return { client: await getOwnClient(userId), isSupportView: false };
  }
);

export async function getOwnPlan(planId: string | null) {
  if (!planId) return null;
  return withAppUser((tx) =>
    tx.query.plans.findFirst({ where: eq(plans.id, planId) })
  );
}

export async function getContentItems(clientId: string) {
  return withAppUser((tx) =>
    tx.query.contentItems.findMany({
      where: eq(contentItems.clientId, clientId),
      orderBy: [desc(contentItems.scheduledDate)],
    })
  );
}

export async function getAgentConfig(clientId: string) {
  return withAppUser((tx) =>
    tx.query.agentConfigs.findFirst({
      where: eq(agentConfigs.clientId, clientId),
    })
  );
}

export async function getWhatsappEvents(clientId: string) {
  return withAppUser((tx) =>
    tx.query.whatsappEvents.findMany({
      where: eq(whatsappEvents.clientId, clientId),
      orderBy: [desc(whatsappEvents.occurredAt)],
    })
  );
}

export type CampaignWithLatestStat = typeof campaigns.$inferSelect & {
  latestStat: typeof campaignStats.$inferSelect | null;
};

export async function getCampaignsWithStats(
  clientId: string
): Promise<CampaignWithLatestStat[]> {
  return withAppUser(async (tx) => {
    const rows = await tx.query.campaigns.findMany({
      where: eq(campaigns.clientId, clientId),
      orderBy: [desc(campaigns.createdAt)],
    });
    if (rows.length === 0) return [];

    const campaignIds = rows.map((c) => c.id);
    const stats = await tx.query.campaignStats.findMany({
      where: inArray(campaignStats.campaignId, campaignIds),
      orderBy: [desc(campaignStats.statDate)],
    });

    const latestByCampaign = new Map<string, (typeof stats)[number]>();
    for (const stat of stats) {
      if (!latestByCampaign.has(stat.campaignId)) {
        latestByCampaign.set(stat.campaignId, stat);
      }
    }

    return rows.map((c) => ({
      ...c,
      latestStat: latestByCampaign.get(c.id) ?? null,
    }));
  });
}
