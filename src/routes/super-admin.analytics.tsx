import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/analytics")({
  head: () => ({ meta: [{ title: "Platform Analytics — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Platform Analytics" subtitle="Cross-tenant analytics for growth and usage." sections={["Growth","Retention","Engagement","Cohorts","Funnels","Custom Metrics"]}>
    </SaPlaceholder>
  );
}
