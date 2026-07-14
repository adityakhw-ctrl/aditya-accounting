import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/users")({
  head: () => ({ meta: [{ title: "Users — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Users" subtitle="Global user directory across tenants." sections={["All Users","Invitations","Suspended","Impersonation","Sessions"]}>
    </SaPlaceholder>
  );
}
