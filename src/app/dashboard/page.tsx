import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { clients } from "@/db/schema";
import { withAppUser } from "@/db/session";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const ownClient = await withAppUser((tx) =>
    tx.query.clients.findFirst({
      where: eq(clients.clerkUserId, userId),
    })
  );

  return (
    <div className="flex flex-1 flex-col items-center gap-6 py-16 px-8">
      <div className="flex w-full max-w-xl items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <UserButton />
      </div>
      {ownClient ? (
        <pre className="w-full max-w-xl rounded bg-black/[.06] p-4 text-sm dark:bg-white/[.08]">
          {JSON.stringify(ownClient, null, 2)}
        </pre>
      ) : (
        <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
          Todavía no tienes un perfil de cliente creado.
        </p>
      )}
    </div>
  );
}
