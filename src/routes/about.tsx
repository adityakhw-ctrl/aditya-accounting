import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { About as AboutSection } from "@/components/sections/About";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Aditya Accounting" }] }),
  component: () => (
    <PageShell title="About Aditya Accounting" subtitle="AI-first, human-reviewed accounting.">
      <AboutSection />
    </PageShell>
  ),
});
