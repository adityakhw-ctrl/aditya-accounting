import type { ReactNode } from "react";

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
          <span className="gradient-text">{title}</span>
        </h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
      </header>
      {children}
    </div>
  );
}

export function FeatureGrid({ items }: { items: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((label) => (
        <div
          key={label}
          id={label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          className="glass group scroll-mt-24 rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
        >
          <div
            className="mb-3 grid h-10 w-10 place-items-center rounded-xl text-white text-sm font-semibold"
            style={{ background: "var(--gradient-primary)" }}
          >
            {label
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="font-medium">{label}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Placeholder — coming soon.
          </div>
        </div>
      ))}
    </div>
  );
}
