import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Support" subtitle="We're here to help you 24/7.">
      <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
        Email <a className="text-primary underline" href="mailto:adityakhw@gmail.com">adityakhw@gmail.com</a> or use the Contact page to reach our team.
      </div>
    </PageShell>
  );
}
