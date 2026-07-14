import { useI18n } from "@/lib/i18n";
import { ArrowRight, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          maskImage: "linear-gradient(180deg, black 40%, transparent)",
        }}
      />
      <div className="mx-auto max-w-5xl px-6 text-center fade-up">
        <div className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {t("hero.badge")}
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
          <span className="gradient-text">{t("hero.title")}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {t("hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#contact" className="btn-hero inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium">
            {t("hero.cta1")} <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#contact"
            className="glass inline-flex items-center rounded-full px-6 py-3 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5"
          >
            {t("hero.cta2")}
          </a>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4">
          {[
            { k: "99.9%", v: t("hero.stat1") },
            { k: "AI+", v: t("hero.stat2") },
            { k: "24/7", v: t("hero.stat3") },
          ].map((s) => (
            <div key={s.v} className="glass rounded-2xl px-3 py-5">
              <div className="text-2xl font-semibold gradient-text sm:text-3xl">{s.k}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
