import { type LucideIcon } from "lucide-react";

const COLOR_MAP = {
  teal: "var(--md-teal)",
  gold: "var(--md-gold)",
  red: "var(--md-red)",
  blue: "var(--md-blue)",
} as const;

const LEVEL_COPY = {
  alerta: "Atención",
  proceso: "En proceso",
  activo: "Activo",
} as const;

export function StatusRow({
  icon: Icon,
  label,
  level,
  color,
}: {
  icon: LucideIcon;
  label: string;
  level: keyof typeof LEVEL_COPY;
  color: keyof typeof COLOR_MAP;
}) {
  const hex = COLOR_MAP[color];
  return (
    <div className="flex items-center gap-4">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/[0.08] bg-panel-chassis"
        style={{ color: hex }}
      >
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <div className="flex flex-1 flex-col">
        <span className="font-panel-display text-sm font-medium text-panel-ink">
          {label}
        </span>
        <span className="font-panel-mono text-[10px] uppercase tracking-[0.14em] text-panel-ink-dim">
          {LEVEL_COPY[level]}
        </span>
      </div>
      <span
        className="pilot-light h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          backgroundColor: hex,
          boxShadow: `0 0 5px 1px ${hex}`,
        }}
      />
    </div>
  );
}
