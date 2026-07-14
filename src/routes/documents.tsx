import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FolderLock, Upload, Search } from "lucide-react";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents — Aditya Accounting" }] }),
  component: DocumentsPage,
});

function DocumentsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <PageShell title="Documents" subtitle="Encrypted, organised, and easy to find.">
        <div className="glass rounded-3xl p-6 text-center sm:p-8">
          <div
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <FolderLock className="h-6 w-6" />
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Secure document management. Upload, categorise and search all your bills,
            invoices and statements in one place.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <button className="btn-hero inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm">
              <Upload className="h-4 w-4" /> Upload Document
            </button>
            <button className="glass inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm">
              <Search className="h-4 w-4" /> Browse Documents
            </button>
          </div>
        </div>

        {/* Document Categories */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Bills & Invoices", count: "24 files" },
            { label: "Bank Statements", count: "12 files" },
            { label: "GST Returns", count: "8 files" },
            { label: "Receipts", count: "36 files" },
            { label: "Reports", count: "15 files" },
            { label: "Miscellaneous", count: "7 files" },
          ].map((cat) => (
            <div
              key={cat.label}
              className="glass group flex items-center justify-between rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
            >
              <div>
                <div className="font-medium text-sm">{cat.label}</div>
                <div className="text-xs text-muted-foreground">{cat.count}</div>
              </div>
              <FolderLock className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition" />
            </div>
          ))}
        </div>
      </PageShell>
    </ProtectedRoute>
  );
}
