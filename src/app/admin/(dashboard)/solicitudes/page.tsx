import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { SelectAndSubmit } from "@/components/admin/SelectAndSubmit";
import { campaignAdjustmentRequests, campaigns, clients, contentRequests } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { requireStaffOrRedirect } from "@/lib/staff";
import { updateCampaignAdjustmentRequestStatus, updateContentRequestStatus } from "./actions";

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "revisado", label: "Revisado" },
  { value: "descartado", label: "Descartado" },
] as const;

const ADJUSTMENT_TYPE_COPY = {
  pausar: "Pausar campaña",
  aumentar_presupuesto: "Aumentar presupuesto",
  reducir_presupuesto: "Reducir presupuesto",
  otro: "Otro ajuste",
} as const;

export default async function AdminSolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  await requireStaffOrRedirect("/admin/solicitudes");
  const { clientId } = await searchParams;

  const [contentReqs, adjustmentReqs] = await Promise.all([
    withAppUser((tx) =>
      tx
        .select({
          id: contentRequests.id,
          title: contentRequests.title,
          notes: contentRequests.notes,
          status: contentRequests.status,
          createdAt: contentRequests.createdAt,
          clientId: contentRequests.clientId,
          businessName: clients.businessName,
        })
        .from(contentRequests)
        .innerJoin(clients, eq(contentRequests.clientId, clients.id))
        .orderBy(desc(contentRequests.createdAt))
    ),
    withAppUser((tx) =>
      tx
        .select({
          id: campaignAdjustmentRequests.id,
          requestType: campaignAdjustmentRequests.requestType,
          notes: campaignAdjustmentRequests.notes,
          status: campaignAdjustmentRequests.status,
          createdAt: campaignAdjustmentRequests.createdAt,
          clientId: campaignAdjustmentRequests.clientId,
          businessName: clients.businessName,
          campaignName: campaigns.name,
        })
        .from(campaignAdjustmentRequests)
        .innerJoin(clients, eq(campaignAdjustmentRequests.clientId, clients.id))
        .innerJoin(campaigns, eq(campaignAdjustmentRequests.campaignId, campaigns.id))
        .orderBy(desc(campaignAdjustmentRequests.createdAt))
    ),
  ]);

  const filteredContentReqs = clientId
    ? contentReqs.filter((r) => r.clientId === clientId)
    : contentReqs;
  const filteredAdjustmentReqs = clientId
    ? adjustmentReqs.filter((r) => r.clientId === clientId)
    : adjustmentReqs;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="admin-h1">Solicitudes</h1>
        <p className="admin-subtle mt-1 text-sm">
          Ideas de contenido y ajustes de campaña que los clientes te mandan
          desde su dashboard.
        </p>
        {clientId && (
          <Link
            href="/admin/solicitudes"
            className="mt-1 inline-block text-xs font-medium text-md-admin-gold hover:underline"
          >
            Ver de todos los clientes →
          </Link>
        )}
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <h2 className="px-5 pt-5 text-sm font-semibold text-md-admin-cream">
          Ideas de contenido ({filteredContentReqs.length})
        </h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Idea</th>
              <th className="px-4 py-3">Notas</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredContentReqs.map((req) => (
              <tr key={req.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/clients/${req.clientId}`}
                    className="font-medium text-white hover:text-md-admin-gold hover:underline"
                  >
                    {req.businessName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-white">{req.title}</td>
                <td className="px-4 py-3 text-md-admin-rose-muted">{req.notes ?? "—"}</td>
                <td className="px-4 py-3">
                  <SelectAndSubmit
                    action={updateContentRequestStatus}
                    hiddenFields={{ id: req.id }}
                    name="status"
                    defaultValue={req.status}
                    options={[...STATUS_OPTIONS]}
                  />
                </td>
              </tr>
            ))}
            {filteredContentReqs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-md-admin-rose-muted">
                  Sin ideas de contenido pendientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <h2 className="px-5 pt-5 text-sm font-semibold text-md-admin-cream">
          Ajustes de campaña ({filteredAdjustmentReqs.length})
        </h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Campaña</th>
              <th className="px-4 py-3">Solicitud</th>
              <th className="px-4 py-3">Notas</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdjustmentReqs.map((req) => (
              <tr key={req.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/clients/${req.clientId}`}
                    className="font-medium text-white hover:text-md-admin-gold hover:underline"
                  >
                    {req.businessName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-md-admin-rose-muted">{req.campaignName}</td>
                <td className="px-4 py-3 text-white">
                  {ADJUSTMENT_TYPE_COPY[req.requestType]}
                </td>
                <td className="px-4 py-3 text-md-admin-rose-muted">{req.notes ?? "—"}</td>
                <td className="px-4 py-3">
                  <SelectAndSubmit
                    action={updateCampaignAdjustmentRequestStatus}
                    hiddenFields={{ id: req.id }}
                    name="status"
                    defaultValue={req.status}
                    options={[...STATUS_OPTIONS]}
                  />
                </td>
              </tr>
            ))}
            {filteredAdjustmentReqs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-md-admin-rose-muted">
                  Sin ajustes de campaña pendientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
