import { auth } from "@clerk/nextjs/server";
import { Download, FileText } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { isStaffUser } from "@/lib/staff";
import { getDeliverables, getViewedClient } from "../data";

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
        <h1 className="admin-h1">Entregables.</h1>
        <p className="admin-subtle mt-1 text-sm">
          Logos, fotos, diseños y videos que te compartimos.
        </p>
      </div>

      {files.length === 0 ? (
        <p className="max-w-xl text-base leading-relaxed text-md-admin-rose-muted">
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
                className="admin-card group flex flex-col gap-3 p-4 transition-colors hover:bg-white/[0.09]"
              >
                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-black/20">
                  {isImage ? (
                    <Image
                      src={file.fileUrl}
                      alt={file.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <FileText size={28} strokeWidth={1.5} className="text-white/25" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-white">
                    {file.title}
                  </p>
                  <Download
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 text-white/40 transition-colors group-hover:text-md-admin-gold"
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
