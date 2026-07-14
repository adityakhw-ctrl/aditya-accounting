import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Audit Logs" subtitle="Every privileged action, searchable and exportable." sections={["Live Stream","Filters","Exports","Alerts","Retention"]}>
    </SaPlaceholder>
  );
}
