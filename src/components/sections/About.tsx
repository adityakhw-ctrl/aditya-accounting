import { useI18n } from "@/lib/i18n";
import { Check } from "lucide-react";

export function About() {
  const { t } = useI18n();
  const points = [t("about.point1"), t("about.point2"), t("about.point3")];
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-20">
      <div className="glass-strong grid gap-10 rounded-3xl p-8 md:grid-cols-2 md:p-14">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("about.title")}
          </h2>
          <p className="mt-5 text-muted-foreground">{t("about.body")}</p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Check className="h-3 w-3" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div
            className="absolute inset-0 rounded-3xl opacity-40 blur-2xl"
            style={{ background: "var(--gradient-primary)" }}
          />
          <div className="glass relative flex h-full flex-col justify-center rounded-3xl p-8">
            <div className="text-6xl font-bold gradient-text">10+</div>
            <div className="mt-2 text-sm text-muted-foreground">years of combined accounting experience</div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-4">
                <div className="text-2xl font-semibold">500+</div>
                <div className="text-xs text-muted-foreground">Books maintained</div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-2xl font-semibold">100%</div>
                <div className="text-xs text-muted-foreground">Confidential</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
