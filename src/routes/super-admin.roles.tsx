import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/roles")({
  head: () => ({ meta: [{ title: "Roles & Permissions — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Roles & Permissions" subtitle="Fine-grained access control across the platform." sections={["Roles","Permissions","Policy Templates","Assignments","Audit"]}>
    </SaPlaceholder>
  );
}
