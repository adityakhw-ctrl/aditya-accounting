import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/api")({
  head: () => ({ meta: [{ title: "API Management — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="API Management" subtitle="Manage API keys, quotas and versions." sections={["API Keys","Rate Limits","Versions","Webhooks","Docs"]}>
    </SaPlaceholder>
  );
}
