import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CalendarioView } from "@/components/dashboard/CalendarioView";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { isStaffUser } from "@/lib/staff";
import { getContentItems, getViewedClient } from "../data";

export default async function CalendarioPage() {
  const { userId } = await auth();
  if (!userId && !(await isStaffUser())) {
    redirect("/sign-in");
  }

  const { client: ownClient } = await getViewedClient(userId ?? null);
  if (!ownClient) {
    return <NoClientProfile />;
  }

  const items = await getContentItems(ownClient.id);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-semibold text-gray-900">
        Tu calendario de contenido.
      </h1>

      {items.length === 0 ? (
        <p className="max-w-xl text-base leading-relaxed text-gray-500">
          Todavía no hay contenido programado en tu calendario.
        </p>
      ) : (
        <CalendarioView
          items={items.map((item) => ({
            id: item.id,
            scheduledDate: item.scheduledDate,
            title: item.title,
            platform: item.platform,
            pillar: item.pillar,
            status: item.status,
            format: item.format,
          }))}
        />
      )}
    </div>
  );
}
