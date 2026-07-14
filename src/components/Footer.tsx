import { useI18n } from "@/lib/i18n";
import { Sparkles } from "lucide-react";

export function Footer() {
  const { t } = useI18n();
  const soon = t("footer.soon");
  const upcoming = [
    t("footer.gst"),
    t("footer.tds"),
    t("footer.itr"),
    t("footer.payroll"),
    t("footer.registration"),
    t("footer.aiauto"),
  ];
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-12 pt-8">
      <div className="glass-strong rounded-3xl p-8 md:p-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                <Sparkles className="h-5 w-5 text-white" />
              </span>
              <span className="font-semibold tracking-tight">Aditya Accounting</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{t("footer.tag")}</p>
          </div>

          <div>
            <div className="text-sm font-semibold">{t("footer.services")}</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="text-foreground">{t("footer.accounting")}</li>
              {upcoming.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  {s}
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    {soon}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">{t("footer.company")}</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-foreground">{t("nav.about")}</a></li>
              <li><a href="#contact" className="hover:text-foreground">{t("nav.contact")}</a></li>
              <li><a href="#features" className="hover:text-foreground">{t("nav.features")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Aditya Accounting. {t("footer.rights")}</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-foreground">{t("footer.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
