import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/dev-tools")({
  head: () => ({ meta: [{ title: "Developer Tools — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Developer Tools" subtitle="Internal tooling for platform engineers." sections={["SQL Runner","Job Queues","Feature Flags","Sandbox","Data Export"]}>
    </SaPlaceholder>
  );
}
