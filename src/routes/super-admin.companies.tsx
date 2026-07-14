import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/companies")({
  head: () => ({ meta: [{ title: "Companies — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Companies" subtitle="Every tenant company on the platform." sections={["All Companies","New Signups","KYC Pending","Suspended","Archived"]}>
    </SaPlaceholder>
  );
}
