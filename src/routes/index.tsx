import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Shield, Zap, BarChart3, Monitor, Smartphone, Link2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aditya Accounting — Smart Accounting. Powered by AI." },
      {
        name: "description",
        content:
          "Premium AI-powered accounting for business owners, traders, shop owners, small businesses and startups.",
      },
    ],
  }),
  component: Index,
});

function DownloadCard({
  icon: Icon,
  title,
  desc,
  btnText,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  btnText: string;
  onClick?: () => void;
}) {
  return (
    <div className="glass rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className="mb-3 grid h-11 w-11 place-items-center rounded-xl text-white"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-semibold text-foreground">{title}</div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      <button
        onClick={onClick}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        {btnText}
      </button>
    </div>
  );
}

function Index() {
  const handleDownload = (platform: string) => {
    alert(`${platform} download coming soon!`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16 md:py-24">
      {/* Hero Section */}
      <section className="text-center fade-up">
        <div className="mx-auto mb-5 flex justify-center sm:mb-6">
          <Logo size={64} />
        </div>
        <div className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Accounting
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:mt-6 sm:text-6xl">
          <span className="gradient-text">Smart Accounting. Powered by AI.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:mt-5 sm:text-lg">
          Aditya Accounting helps business owners, traders, shop owners, small businesses and
          startups keep their finances accurate, organised and audit-ready.
        </p>
        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center">
          <Link
            to="/contact"
            className="btn-hero inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/about"
            className="glass inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-3 text-sm font-medium"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mt-12 grid gap-4 sm:mt-20 sm:grid-cols-3 sm:gap-5">
        {[
          { icon: Shield, t: "Accurate & Secure", d: "Bank-grade security with AI-assisted verification." },
          { icon: Zap, t: "AI Automation", d: "Automate repetitive work and reduce human errors." },
          { icon: BarChart3, t: "Clear Insights", d: "Monthly reports and analytics for smarter decisions." },
        ].map((f) => (
          <div key={f.t} className="glass rounded-2xl p-5 sm:p-6">
            <div
              className="mb-3 grid h-11 w-11 place-items-center rounded-xl text-white sm:mb-4"
              style={{ background: "var(--gradient-primary)" }}
            >
              <f.icon className="h-5 w-5" />
            </div>
            <div className="font-medium">{f.t}</div>
            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>

      {/* Download Section */}
      <section className="mt-12 sm:mt-16">
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Download Aditya Accounting
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Get the app on your preferred platform. Sync across all your devices.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <DownloadCard
              icon={Monitor}
              title="Download for Windows"
              desc="Desktop app for Windows 10/11"
              btnText="Download"
              onClick={() => handleDownload("Windows")}
            />
            <DownloadCard
              icon={Smartphone}
              title="Download for Android"
              desc="Mobile app for Android devices"
              btnText="Download"
              onClick={() => handleDownload("Android")}
            />
            <DownloadCard
              icon={Link2}
              title="Download Tally Connector"
              desc="Sync with Tally ERP 9 / Prime"
              btnText="Download"
              onClick={() => handleDownload("Tally Connector")}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-12 glass-strong rounded-3xl p-6 text-center sm:mt-16 sm:p-8 md:p-12">
        <h2 className="text-xl font-semibold tracking-tight sm:text-3xl">
          Everything you need to run your books
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Use the sidebar to access Daily Entry, Data Analysis, Remote Control, Documents and more.
        </p>
        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            to="/daily-entry"
            className="btn-hero inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium"
          >
            Open Daily Entry
          </Link>
          <Link
            to="/client-login"
            className="glass inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium"
          >
            Client Login
          </Link>
        </div>
      </section>
    </div>
  );
}
