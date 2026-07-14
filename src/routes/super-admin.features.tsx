import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/features")({
  head: () => ({ meta: [{ title: "Feature Manager — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Feature Manager" subtitle="Enable, disable, hide or show modules." sections={["Enable Module","Disable Module","Hide Menu","Show Menu","Future Module Toggle"]}>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Client Portal", true],
          ["Daily Entry", true],
          ["Data Analysis", true],
          ["Remote Control", true],
          ["GST Module (future)", false],
          ["TDS Module (future)", false],
          ["ITR Module (future)", false],
          ["Payroll (future)", false],
          ["AI Automation Pro", false],
        ].map(([label, on]) => (
          <div key={label as string} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div>
              <div className="text-sm text-slate-100">{label}</div>
              <div className="text-xs text-slate-400">{on ? "Enabled for all tenants" : "Hidden · placeholder"}</div>
            </div>
            <span className={`inline-flex h-6 w-11 items-center rounded-full transition ${on ? "bg-emerald-500/70" : "bg-white/10"}`}>
              <span className={`h-5 w-5 transform rounded-full bg-white transition ${on ? "translate-x-5" : "translate-x-1"}`} />
            </span>
          </div>
        ))}
      </div>
    </SaPlaceholder>
  );
}
