import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { AgentConfigPanel } from "@/components/dashboard/AgentConfigPanel";
import { isStaffUser } from "@/lib/staff";
import { getViewedClient } from "../../data";

export default async function AgenteIAPage() {
  const { userId } = await auth();
  if (!userId && !(await isStaffUser())) {
    redirect("/sign-in");
  }

  const { client: ownClient } = await getViewedClient(userId ?? null);
  if (!ownClient) {
    return <NoClientProfile />;
  }

  return <AgentConfigPanel businessName={ownClient.businessName} />;
}
