import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/security")({
  head: () => ({ meta: [{ title: "Security Center — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Security Center" subtitle="Platform security posture and controls." sections={["Threats","MFA Policy","IP Allowlists","Sessions","Vulnerability Scans"]}>
    </SaPlaceholder>
  );
}
