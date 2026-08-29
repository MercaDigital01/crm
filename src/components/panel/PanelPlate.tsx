import { type ReactNode } from "react";

const RIVET_CLASS =
  "absolute h-1.5 w-1.5 rounded-full bg-white/10 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_-1px_1px_rgba(0,0,0,0.6)_inset]";

export function PanelPlate({
  children,
  className = "",
  rivets = true,
}: {
  children: ReactNode;
  className?: string;
  rivets?: boolean;
}) {
  return (
    <div
      className={`relative rounded-sm bg-panel-plate ${className}`}
      style={{
        boxShadow:
          "inset 0 1px 0 var(--panel-bezel-light), inset 0 -2px 4px var(--panel-bezel-dark), 0 12px 24px -12px rgba(0,0,0,0.7)",
      }}
    >
      {rivets && (
        <>
          <span className={`${RIVET_CLASS} left-2.5 top-2.5`} />
          <span className={`${RIVET_CLASS} right-2.5 top-2.5`} />
          <span className={`${RIVET_CLASS} bottom-2.5 left-2.5`} />
          <span className={`${RIVET_CLASS} bottom-2.5 right-2.5`} />
        </>
      )}
      {children}
    </div>
  );
}
