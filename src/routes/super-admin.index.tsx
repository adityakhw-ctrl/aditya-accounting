import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Building2,
  Users,
  LogIn,
  Wallet,
  HardDrive,
  FileText,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Bell,
  Server,
  CheckCircle2,
} from "lucide-react";
import { SuperAdminShell, SaCard } from "@/components/SuperAdminShell";

export const Route = createFileRoute("/super-admin/")({
  head: () => ({ meta: [{ title: "Super Admin — Aditya Accounting" }] }),
  component: SuperAdminDashboard,
});

const topCards = [
  { label: "Total Clients", value: "1,284", delta: "+4.2%", icon: Building2, color: "from-cyan-400 to-blue-500" },
  { label: "Active Users", value: "3,912", delta: "+1.8%", icon: Users, color: "from-indigo-400 to-purple-500" },
  { label: "Today's Logins", value: "612", delta: "+12%", icon: LogIn, color: "from-sky-400 to-cyan-500" },
  { label: "Revenue", value: "₹ 18.4L", delta: "+8.3%", icon: Wallet, color: "from-emerald-400 to-teal-500" },
  { label: "Storage Used", value: "412 GB", delta: "68%", icon: HardDrive, color: "from-amber-400 to-orange-500" },
  { label: "Documents", value: "94,201", delta: "+327", icon: FileText, color: "from-fuchsia-400 to-pink-500" },
  { label: "API Requests", value: "2.1M", delta: "24h", icon: Zap, color: "from-yellow-400 to-amber-500" },
  { label: "System Health", value: "99.98%", delta: "Optimal", icon: ShieldCheck, color: "from-green-400 to-emerald-500" },
];

function Sparkline({ color = "#22d3ee" }: { color?: string }) {
  const pts = [8, 14, 10, 22, 18, 28, 24, 34, 30, 44, 40, 52];
  const max = Math.max(...pts);
  const w = 300;
  const h = 90;
  const step = w / (pts.length - 1);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${i * step},${h - (p / max) * h}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function SuperAdminDashboard() {
  return (
    <SuperAdminShell
      title="Platform Overview"
      subtitle="Real-time signals across clients, revenue, infrastructure and AI usage."
      actions={
        <>
          <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
            Last 24h
          </button>
          <button className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-900/40 hover:brightness-110">
            Export
          </button>
        </>
      }
    >
      {/* Top Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topCards.map((c) => (
          <SaCard key={c.label}>
            <div className="flex items-start justify-between">
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-lg`}
              >
                <c.icon className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                <ArrowUpRight className="h-3 w-3" /> {c.delta}
              </span>
            </div>
            <div className="mt-4 text-2xl font-semibold tracking-tight">{c.value}</div>
            <div className="text-xs text-slate-400">{c.label}</div>
          </SaCard>
        ))}
      </div>

      {/* Middle charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SaCard>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Revenue</div>
              <div className="text-xs text-slate-400">Trailing 12 months</div>
            </div>
            <div className="text-lg font-semibold text-emerald-300">₹ 1.84 Cr</div>
          </div>
          <Sparkline color="#34d399" />
        </SaCard>
        <SaCard>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">User Growth</div>
              <div className="text-xs text-slate-400">Weekly active users</div>
            </div>
            <div className="text-lg font-semibold text-indigo-300">+18.4%</div>
          </div>
          <Sparkline color="#818cf8" />
        </SaCard>
        <SaCard>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Storage Usage</div>
              <div className="text-xs text-slate-400">Cluster-wide capacity</div>
            </div>
            <div className="text-lg font-semibold text-amber-300">412 / 600 GB</div>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
              style={{ width: "68%" }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs text-slate-400">
            <div>
              <div className="text-slate-200">231 GB</div>
              Documents
            </div>
            <div>
              <div className="text-slate-200">128 GB</div>
              Backups
            </div>
            <div>
              <div className="text-slate-200">53 GB</div>
              Logs
            </div>
          </div>
        </SaCard>
        <SaCard>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">AI Usage</div>
              <div className="text-xs text-slate-400">Requests / tokens</div>
            </div>
            <div className="text-lg font-semibold text-cyan-300">2.1M</div>
          </div>
          <Sparkline color="#22d3ee" />
        </SaCard>
      </div>

      {/* Bottom */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <SaCard className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-300" />
            <div className="text-sm font-medium">Recent Activities</div>
          </div>
          <ul className="divide-y divide-white/5 text-sm">
            {[
              ["Client onboarded", "Sharma Traders", "2m ago"],
              ["Invoice batch approved", "Aditya Retail", "18m ago"],
              ["AI model retrained", "GST classifier v3.2", "1h ago"],
              ["Backup completed", "eu-west-1 · 128GB", "2h ago"],
              ["Role updated", "Priya → Admin", "5h ago"],
            ].map(([a, b, c]) => (
              <li key={b} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-slate-100">{a}</div>
                  <div className="text-xs text-slate-400">{b}</div>
                </div>
                <div className="text-xs text-slate-500">{c}</div>
              </li>
            ))}
          </ul>
        </SaCard>

        <SaCard>
          <div className="mb-4 flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-300" />
            <div className="text-sm font-medium">Server Status</div>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              ["API Gateway", "operational"],
              ["Database Primary", "operational"],
              ["AI Inference", "operational"],
              ["Object Storage", "degraded"],
              ["Email Service", "operational"],
            ].map(([n, s]) => (
              <li key={n} className="flex items-center justify-between">
                <span className="text-slate-200">{n}</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                    s === "operational"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-amber-500/10 text-amber-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      s === "operational" ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </SaCard>

        <SaCard>
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-300" />
            <div className="text-sm font-medium">Pending Approvals</div>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              ["New Company: Kohli Exports", "KYC review"],
              ["Refund request #4821", "₹ 12,400"],
              ["Role: Auditor for Rahul", "elevated"],
              ["API key rotation", "prod-eu"],
            ].map(([t, s]) => (
              <li key={t} className="flex items-center justify-between">
                <div>
                  <div className="text-slate-100">{t}</div>
                  <div className="text-xs text-slate-400">{s}</div>
                </div>
                <button className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10">
                  Review
                </button>
              </li>
            ))}
          </ul>
        </SaCard>

        <SaCard className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-300" />
            <div className="text-sm font-medium">Audit Logs</div>
          </div>
          <div className="-mx-1 overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-3 py-2">Actor</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["aditya@aa.io", "role.grant", "priya → Admin", "2m ago"],
                  ["system", "backup.run", "eu-west-1", "1h ago"],
                  ["arjun@aa.io", "feature.toggle", "AI Insights", "3h ago"],
                  ["neha@aa.io", "user.suspend", "acct#3921", "6h ago"],
                ].map((r) => (
                  <tr key={r[3]} className="text-slate-200">
                    <td className="whitespace-nowrap px-3 py-2">{r[0]}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-cyan-300">{r[1]}</td>
                    <td className="whitespace-nowrap px-3 py-2">{r[2]}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-400">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SaCard>

        <SaCard>
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-300" />
            <div className="text-sm font-medium">Notifications</div>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-amber-100">
              Storage nearing 70% — plan capacity expansion.
            </li>
            <li className="rounded-lg border border-white/10 bg-white/5 p-3 text-slate-200">
              3 new client signups awaiting KYC.
            </li>
            <li className="rounded-lg border border-white/10 bg-white/5 p-3 text-slate-200">
              AI model v3.2 deployed to production.
            </li>
          </ul>
        </SaCard>
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <SaCard>
          <div className="mb-4 text-sm font-medium">Quick Actions</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Add Company",
              "Invite User",
              "Run Backup",
              "Rotate API Keys",
              "Broadcast Notice",
              "Toggle Feature",
              "Open Audit Trail",
              "System Health Check",
            ].map((q) => (
              <button
                key={q}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
              >
                {q}
              </button>
            ))}
          </div>
        </SaCard>
      </div>
    </SuperAdminShell>
  );
}
