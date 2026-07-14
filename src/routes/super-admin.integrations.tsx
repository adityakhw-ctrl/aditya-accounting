import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Integrations" subtitle="Third-party integrations across the platform." sections={["Payment Gateways","Banks","Email Providers","Cloud Storage","Webhooks"]}>
    </SaPlaceholder>
  );
}
