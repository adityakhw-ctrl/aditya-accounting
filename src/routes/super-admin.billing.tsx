import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/billing")({
  head: () => ({ meta: [{ title: "Billing — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Billing" subtitle="Platform revenue, invoices and subscriptions." sections={["Plans","Invoices","Coupons","Failed Payments","Tax Settings"]}>
    </SaPlaceholder>
  );
}
