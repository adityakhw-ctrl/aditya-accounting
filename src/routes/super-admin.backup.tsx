import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/backup")({
  head: () => ({ meta: [{ title: "Backup & Restore — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="Backup & Restore" subtitle="Backup schedules, snapshots and recovery." sections={["Schedules","Snapshots","Restore Points","Disaster Recovery","Verification"]}>
    </SaPlaceholder>
  );
}
