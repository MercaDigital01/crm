import { auth } from "@clerk/nextjs/server";
import { Download, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { isStaffUser } from "@/lib/staff";
import { getDeliverables, getViewedClient } from "../data";

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

export default async function EntregablesPage() {
  const { userId } = await auth();
  if (!userId && !(await isStaffUser())) {
    redirect("/sign-in");
  }

  const { client: ownClient } = await getViewedClient(userId ?? null);
  if (!ownClient) {
    return <NoClientProfile />;
  }

  const files = await getDeliverables(ownClient.id);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Entregables.</h1>
        <p className="mt-1 text-sm text-gray-500">
          Logos, fotos, diseños y videos que te compartimos.
        </p>
      </div>

      {files.length === 0 ? (
        <p className="max-w-xl text-base leading-relaxed text-gray-500">
          Todavía no hay entregables compartidos contigo.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const isImage = file.fileType.startsWith("image");
            return (
              <a
                key={file.id}
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer"
                className={`group flex flex-col gap-3 rounded-2xl bg-white p-4 transition-shadow hover:shadow-md ${CARD_SHADOW}`}
              >
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.fileUrl}
                      alt={file.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileText size={28} strokeWidth={1.5} className="text-gray-300" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {file.title}
                  </p>
                  <Download
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 text-gray-400 transition-colors group-hover:text-md-teal"
                  />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
