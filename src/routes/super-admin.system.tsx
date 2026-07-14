import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/system")({
  head: () => ({ meta: [{ title: "System Settings — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="System Settings" subtitle="Global platform configuration." sections={["General","Localisation","Feature Flags","Maintenance Mode","Branding"]}>
    </SaPlaceholder>
  );
}
