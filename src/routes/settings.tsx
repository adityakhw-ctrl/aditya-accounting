import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/lib/i18n";
import {
  Tag,
  BookOpen,
  Languages,
  Palette,
  Bell,
  Shield,
  LifeBuoy,
  Mail,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Aditya Accounting" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { lang, setLang } = useI18n();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [notif, setNotif] = useState(true);

  return (
    <PageShell title="Settings" subtitle="Manage preferences, language, theme and more.">
      <div className="grid gap-5 md:grid-cols-2">
        <Card icon={Tag} title="Pricing">
          <p className="text-sm text-muted-foreground">
            Transparent, tailored plans for shops, traders, small businesses and startups. Contact
            us for a custom quote.
          </p>
        </Card>

        <Card icon={BookOpen} title="Knowledge Center">
          <p className="text-sm text-muted-foreground">
            Guides, best practices and how-tos to help you run better books.
          </p>
        </Card>

        <Card icon={Languages} title="Language">
          <div className="flex overflow-hidden rounded-full border border-border text-xs">
            <button
              onClick={() => setLang("en")}
              className={`flex-1 px-4 py-2 ${lang === "en" ? "bg-primary text-primary-foreground" : ""}`}
            >
              English
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`flex-1 px-4 py-2 ${lang === "hi" ? "bg-primary text-primary-foreground" : ""}`}
            >
              हिंदी
            </button>
          </div>
        </Card>

        <Card icon={Palette} title="Theme">
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs capitalize ${
                  theme === t ? "border-primary bg-primary/10 text-primary" : "border-border"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Dark mode coming soon.</p>
        </Card>

        <Card icon={Bell} title="Notifications">
          <label className="flex items-center justify-between text-sm">
            <span>Email notifications</span>
            <button
              onClick={() => setNotif((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${notif ? "bg-primary" : "bg-muted"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  notif ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </Card>

        <Card icon={Shield} title="Privacy">
          <p className="text-sm text-muted-foreground">
            Your data is encrypted and never shared. Review our privacy commitments.
          </p>
        </Card>

        <Card icon={LifeBuoy} title="Help & Support">
          <p className="text-sm text-muted-foreground">
            Reach out anytime — our team is here to help you.
          </p>
        </Card>

        <Card icon={Mail} title="Contact Email">
          <a
            href="mailto:adityakhw@gmail.com"
            className="text-sm font-medium text-primary hover:underline"
          >
            adityakhw@gmail.com
          </a>
        </Card>
      </div>
    </PageShell>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-3 flex items-center gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="font-medium">{title}</div>
      </div>
      {children}
    </div>
  );
}
