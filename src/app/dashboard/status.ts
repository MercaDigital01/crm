import { type clients } from "@/db/schema";

type ClientStatus = (typeof clients.$inferSelect)["status"];

export const CLIENT_STATUS_META: Record<
  ClientStatus,
  {
    shortLabel: string;
    label: string;
    color: "teal" | "gold" | "blue" | "red";
    level: "activo" | "proceso" | "alerta";
  }
> = {
  pendiente_de_pago: {
    shortLabel: "Pendiente de pago",
    label: "Pendiente de pago",
    color: "gold",
    level: "proceso",
  },
  activo: {
    shortLabel: "Activo",
    label: "Activo",
    color: "teal",
    level: "activo",
  },
  en_gracia: {
    shortLabel: "En gracia",
    label: "En gracia — actualiza tu pago",
    color: "gold",
    level: "alerta",
  },
  suspendido: {
    shortLabel: "Suspendido",
    label: "Suspendido por falta de pago",
    color: "red",
    level: "alerta",
  },
  cancelado: {
    shortLabel: "Cancelado",
    label: "Cancelado",
    color: "blue",
    level: "alerta",
  },
};
