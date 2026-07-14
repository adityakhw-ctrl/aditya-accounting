import { createFileRoute } from "@tanstack/react-router";
import { PageShell, FeatureGrid } from "@/components/PageShell";

export const Route = createFileRoute("/data-analysis")({
  head: () => ({ meta: [{ title: "Data Analysis — Aditya Accounting" }] }),
  component: () => (
    <PageShell title="Data Analysis" subtitle="Understand your business through clear, AI-powered insights.">
      <FeatureGrid
        items={[
          "Trial Balance Analysis",
          "Ledger Analysis",
          "Bank Analysis",
          "Expense Analysis",
          "Profit Analysis",
          "Party Wise Report",
          "Graphs",
          "AI Business Insights",
          "Duplicate Entry Detection",
        ]}
      />
    </PageShell>
  ),
});
