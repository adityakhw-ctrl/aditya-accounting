import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ListChecks } from "lucide-react";

export const Route = createFileRoute("/admin/work-queue")({
  head: () => ({ meta: [{ title: "Admin Work Queue — Aditya Accounting" }] }),
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <PageShell title="Work Queue" subtitle="Manage pending tasks and approvals.">
        <div className="glass rounded-3xl p-6 text-center sm:p-8">
          <div
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <ListChecks className="h-6 w-6" />
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Work queue management coming soon. Track and manage all pending tasks, approvals, and assignments.
          </p>
        </div>
      </PageShell>
    </ProtectedRoute>
  ),
});
