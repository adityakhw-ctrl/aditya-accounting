import type { ReactNode } from "react";
import { SuperAdminShell, SaCard } from "./SuperAdminShell";

/**
 * Placeholder Super Admin page — dark navy premium theme.
 */
export function SaPlaceholder({
  title,
  subtitle,
  sections,
  children,
}: {
  title: string;
  subtitle?: string;
  sections?: string[];
  children?: ReactNode;
}) {
  return (
    <SuperAdminShell title={title} subtitle={subtitle}>
      {children}
      {sections && sections.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <SaCard key={s}>
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 text-xs font-semibold text-white">
                {s
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="text-sm font-medium text-slate-100">{s}</div>
              <div className="mt-1 text-xs text-slate-400">
                Module scaffolded — awaiting backend wiring.
              </div>
            </SaCard>
          ))}
        </div>
      )}
    </SuperAdminShell>
  );
}
