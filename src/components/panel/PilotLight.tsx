const COLOR_MAP = {
  teal: "var(--md-teal)",
  gold: "var(--md-gold)",
  red: "var(--md-red)",
  blue: "var(--md-blue)",
} as const;

export function PilotLight({
  color,
  label,
  detail,
  delay = 0,
}: {
  color: keyof typeof COLOR_MAP;
  label: string;
  detail?: string;
  delay?: number;
}) {
  const hex = COLOR_MAP[color];
  return (
    <div className="flex items-center gap-3">
      <span
        className="pilot-light relative inline-flex h-3 w-3 shrink-0 rounded-full"
        style={{
          backgroundColor: hex,
          boxShadow: `0 0 2px 1px ${hex}, 0 0 10px 2px ${hex}66, inset 0 -1px 1px rgba(0,0,0,0.35)`,
          animationDelay: `${delay}ms`,
        }}
      />
      {label && (
        <div className="flex flex-col">
          <span className="font-panel-mono text-[11px] uppercase tracking-[0.14em] text-panel-ink">
            {label}
          </span>
          {detail && (
            <span className="font-panel-mono text-[10px] uppercase tracking-[0.1em] text-panel-ink-dim">
              {detail}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
