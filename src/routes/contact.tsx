import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Contact as ContactSection } from "@/components/sections/Contact";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Aditya Accounting" }] }),
  component: () => (
    <PageShell title="Contact" subtitle="Tell us about your business — we'll take it from here.">
      <ContactSection />
    </PageShell>
  ),
});
