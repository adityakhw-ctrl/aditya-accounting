import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/email")({
  head: () => ({ meta: [{ title: "Email Settings — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Email Settings" subtitle="Transactional email configuration." sections={["SMTP","Templates","Deliverability","Suppression List","Domains"]}>
    </SaPlaceholder>
  );
}
