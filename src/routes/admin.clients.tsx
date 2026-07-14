import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Users } from "lucide-react";

export const Route = createFileRoute("/admin/clients")({
  head: () => ({ meta: [{ title: "Admin Clients — Aditya Accounting" }] }),
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <PageShell title="Clients" subtitle="Manage your client accounts.">
        <div className="glass rounded-3xl p-6 text-center sm:p-8">
          <div
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Users className="h-6 w-6" />
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Client management dashboard coming soon. View, add, and manage all your client accounts from one place.
          </p>
        </div>
      </PageShell>
    </ProtectedRoute>
  ),
});
