import { createFileRoute } from "@tanstack/react-router";
import { SaPlaceholder } from "@/components/SaPlaceholder";

export const Route = createFileRoute("/super-admin/ai-control")({
  head: () => ({ meta: [{ title: "AI Control — Super Admin · Aditya Accounting" }] }),
  component: Page,
});

function Page() {
  return (
    <SaPlaceholder title="AI Control" subtitle="Manage AI models, prompts and safety." sections={["Models","Prompts","Guardrails","Fine-tuning","Usage Limits"]}>
    </SaPlaceholder>
  );
}
