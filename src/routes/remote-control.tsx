import { createFileRoute } from "@tanstack/react-router";
import { PageShell, FeatureGrid } from "@/components/PageShell";

export const Route = createFileRoute("/remote-control")({
  head: () => ({ meta: [{ title: "Remote Control — Aditya Accounting" }] }),
  component: () => (
    <PageShell title="Remote Control" subtitle="Securely connect and collaborate across devices.">
      <FeatureGrid
        items={[
          "Connect Mobile to PC",
          "Connect PC to Mobile",
          "Remote Desktop",
          "File Transfer",
          "Screen Sharing",
          "Live Support",
          "AI Assisted Remote Help",
        ]}
      />
    </PageShell>
  ),
});
