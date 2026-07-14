import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export function Contact() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">{t("contact.title")}</h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t("contact.subtitle")}</p>
      </div>

      {/* Contact details on top */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <a
          href="mailto:adityakhw@gmail.com"
          className="glass rounded-2xl p-5 transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Mail className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
              <div className="truncate text-sm font-medium">adityakhw@gmail.com</div>
            </div>
          </div>
        </a>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Phone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Phone</div>
              <div className="truncate text-sm font-medium">+91 00000 00000</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Office</div>
              <div className="truncate text-sm font-medium">India</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form below */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        className="glass mt-8 rounded-3xl p-5 sm:p-8"
      >
        {sent ? (
          <div className="flex min-h-[240px] items-center justify-center text-center">
            <div>
              <div
                className="mx-auto grid h-14 w-14 place-items-center rounded-full text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Send className="h-6 w-6" />
              </div>
              <p className="mt-4 font-medium">{t("contact.sent")}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder={t("contact.name")}
              className="rounded-xl border border-border bg-white/60 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              required
              type="email"
              placeholder={t("contact.email")}
              className="rounded-xl border border-border bg-white/60 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              placeholder={t("contact.phone")}
              className="rounded-xl border border-border bg-white/60 px-4 py-3 text-sm outline-none focus:border-primary sm:col-span-2"
            />
            <textarea
              required
              rows={4}
              placeholder={t("contact.message")}
              className="resize-none rounded-xl border border-border bg-white/60 px-4 py-3 text-sm outline-none focus:border-primary sm:col-span-2"
            />
            <button
              type="submit"
              className="btn-hero inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium sm:col-span-2"
            >
              {t("contact.send")} <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
