import type { ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

/**
 * Premium page shell for the Super Admin console.
 * Dark navy + glassmorphism theme, distinct from the client/admin white UI.
 * Automatically wrapped with ProtectedRoute for super_admin only.
 */
export function SuperAdminShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <div
        className="min-h-[calc(100vh-3.5rem)] text-slate-100"
        style={{
          background:
            "radial-gradient(1200px 700px at 90% -10%, rgba(56,189,248,0.18), transparent 55%), radial-gradient(900px 500px at -10% 20%, rgba(99,102,241,0.22), transparent 60%), linear-gradient(180deg, #030816 0%, #060d24 45%, #030818 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10">
          <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80 sm:text-[11px]">
                Super Admin Console
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">
                <span className="bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
                  {title}
                </span>
              </h1>
              {subtitle && (
                <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </header>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export function SaCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_40px_-20px_rgba(56,189,248,0.35)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
