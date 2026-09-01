import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { AgentConfigPanel } from "@/components/dashboard/AgentConfigPanel";
import { isStaffUser } from "@/lib/staff";
import { getAgentConfig, getViewedClient } from "../../data";
import { saveAgentConfig } from "./actions";

export default async function AgenteIAPage() {
  const { userId } = await auth();
  if (!userId && !(await isStaffUser())) {
    redirect("/sign-in");
  }

  const { client: ownClient } = await getViewedClient(userId ?? null);
  if (!ownClient) {
    return <NoClientProfile />;
  }

  const config = await getAgentConfig(ownClient.id);

  return (
    <AgentConfigPanel
      key={config?.updatedAt.toString() ?? "new"}
      businessName={ownClient.businessName}
      initialConfig={config ?? null}
      saveAgentConfig={saveAgentConfig}
    />
  );
}
