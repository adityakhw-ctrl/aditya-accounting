import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Admin Reports — Aditya Accounting" }] }),
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <PageShell title="Reports" subtitle="Generate and view business reports.">
        <div className="glass rounded-3xl p-6 text-center sm:p-8">
          <div
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <ClipboardList className="h-6 w-6" />
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Reporting dashboard coming soon. Generate financial, tax, and analytical reports.
          </p>
        </div>
      </PageShell>
    </ProtectedRoute>
  ),
});
