import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "Admin Notifications — Aditya Accounting" }] }),
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <PageShell title="Notifications" subtitle="System notifications and alerts.">
        <div className="glass rounded-3xl p-6 text-center sm:p-8">
          <div
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Bell className="h-6 w-6" />
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Notification center coming soon. Manage alerts, announcements, and system notifications.
          </p>
        </div>
      </PageShell>
    </ProtectedRoute>
  ),
});
