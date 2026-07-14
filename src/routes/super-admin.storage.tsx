import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/storage")({
  head: () => ({ meta: [{ title: "Storage Manager — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Storage Manager" subtitle="Cluster-wide storage capacity and lifecycle." sections={["Buckets","Lifecycle Rules","Quotas","Cold Storage","Cleanup Jobs"]}>
    </SaPlaceholder>
  );
}
