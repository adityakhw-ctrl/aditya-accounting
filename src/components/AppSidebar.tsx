import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Home,
  FileText,
  BarChart3,
  MonitorSmartphone,
  FolderLock,
  Settings,
  LogIn,
  LogOut,
  Info,
  Mail,
  ChevronDown,
  Menu,
  X,
  Users,
  ClipboardList,
  Bell,
  ListChecks,
  Building2,
  ShieldCheck,
  LineChart,
  ScrollText,
  Bot,
  Plug,
  HardDrive,
  DatabaseBackup,
  CreditCard,
  Code2,
  Lock,
  Cog,
  Wrench,
  ToggleRight,
  Activity,
  LifeBuoy,
  ShieldAlert,
  Crown,
} from "lucide-react";
import { Logo } from "./Logo";
import { useRole, roleLabel, type Role } from "@/lib/role";

type LeafItem = {
  kind: "leaf";
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type GroupItem = {
  kind: "group";
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
};

type Item = LeafItem | GroupItem;

const l = (to: string, label: string, icon: LeafItem["icon"]): LeafItem => ({
  kind: "leaf",
  to,
  label,
  icon,
});

const commonBase: LeafItem[] = [
  l("/", "Home", Home),
  l("/daily-entry", "Daily Entry", FileText),
  l("/data-analysis", "Data Analysis", BarChart3),
  l("/remote-control", "Remote Control", MonitorSmartphone),
];

const settingsBlock: LeafItem[] = [
  l("/settings", "Settings", Settings),
  l("/about", "About", Info),
  l("/contact", "Contact", Mail),
];

const adminGroup: GroupItem = {
  kind: "group",
  key: "admin",
  label: "Admin",
  icon: ShieldAlert,
  children: [
    { to: "/admin/clients", label: "Clients", icon: Users },
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
    { to: "/admin/reports", label: "Reports", icon: ClipboardList },
    { to: "/admin/work-queue", label: "Work Queue", icon: ListChecks },
  ],
};

const superAdminGroup: GroupItem = {
  kind: "group",
  key: "super-admin",
  label: "Super Admin",
  icon: Crown,
  children: [
    { to: "/super-admin/ai-control", label: "AI Control", icon: Bot },
    { to: "/super-admin/analytics", label: "Analytics", icon: LineChart },
    { to: "/super-admin/api", label: "API", icon: Code2 },
    { to: "/super-admin/audit-logs", label: "Audit Logs", icon: ScrollText },
    { to: "/super-admin/backup", label: "Backup", icon: DatabaseBackup },
    { to: "/super-admin/billing", label: "Billing", icon: CreditCard },
    { to: "/super-admin/companies", label: "Companies", icon: Building2 },
    { to: "/super-admin/dev-tools", label: "Dev Tools", icon: Wrench },
    { to: "/super-admin/roles", label: "Roles & Permissions", icon: ShieldCheck },
    { to: "/super-admin/health", label: "Platform Health", icon: Activity },
    { to: "/super-admin/security", label: "Security Center", icon: Lock },
    { to: "/super-admin/storage", label: "Storage Manager", icon: HardDrive },
    { to: "/super-admin/system", label: "System Settings", icon: Cog },
    { to: "/super-admin/integrations", label: "Integrations", icon: Plug },
    { to: "/super-admin/features", label: "Feature Manager", icon: ToggleRight },
    { to: "/super-admin/users", label: "User Management", icon: Users },
  ],
};

const supportLeaf: LeafItem = l("/support", "Support", LifeBuoy);

function itemsForRole(role: Role | null): Item[] {
  if (role === "SUPER_ADMIN") {
    return [
      ...commonBase,
      l("/documents", "Documents", FolderLock),
      ...settingsBlock,
      adminGroup,
      superAdminGroup,
      supportLeaf,
    ];
  }
  if (role === "ADMIN") {
    return [
      ...commonBase,
      l("/documents", "Documents", FolderLock),
      ...settingsBlock,
      adminGroup,
      supportLeaf,
    ];
  }
  // CLIENT (or logged out) — no Documents, no admin groups
  return [...commonBase, ...settingsBlock, supportLeaf];
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const { role, user, signOut } = useRole();
  const navigate = useNavigate();
  const isSuper = role === "SUPER_ADMIN";
  const items = useMemo(() => itemsForRole(role), [role]);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSignOut = () => {
    signOut();
    setOpen(false);
    navigate({ to: "/client-login" });
  };

  const bgGradient = isSuper
    ? "linear-gradient(180deg, #030918 0%, #0a1230 40%, #050a1c 100%)"
    : "linear-gradient(180deg, #0a1734 0%, #0b1a3d 45%, #081227 100%)";

  return (
    <>
      <div
        className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0b1a3a]/95 px-4 py-3 text-white backdrop-blur md:hidden"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Logo size={32} />
          <span className="truncate font-semibold tracking-tight">Aditya Accounting</span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 text-white/90 transition active:scale-95 hover:bg-white/10"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <button
        aria-label="close menu"
        onClick={() => setOpen(false)}
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-xs flex-col border-r border-white/5 text-slate-200 shadow-2xl transition-transform duration-300 ease-out md:w-72 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: bgGradient }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={`absolute -top-24 -left-16 h-64 w-64 rounded-full blur-3xl ${
              isSuper ? "bg-indigo-500/20" : "bg-blue-500/15"
            }`}
          />
          <div
            className={`absolute bottom-0 -right-20 h-72 w-72 rounded-full blur-3xl ${
              isSuper ? "bg-cyan-500/10" : "bg-indigo-500/10"
            }`}
          />
        </div>

        <div className="relative flex items-center gap-3 px-5 py-6">
          <div className="rounded-2xl bg-white/5 p-1 ring-1 ring-white/10">
            <Logo size={38} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold tracking-tight text-white">
              Aditya Accounting
            </div>
            <div
              className={`truncate text-[11px] uppercase tracking-wider ${
                isSuper ? "text-cyan-300/80" : "text-blue-300/80"
              }`}
            >
              {isSuper ? "Enterprise Console" : "Smart · AI-Powered"}
            </div>
          </div>
        </div>

        {role && (
          <div className="relative mx-5 mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                Signed in · {roleLabel[role]}
              </div>
              <div className="truncate font-medium text-white">
                {user?.name || roleLabel[role]}
              </div>
            </div>
          </div>
        )}

        <div className="relative mx-5 mb-3 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <nav className="relative flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-0.5">
            {items.map((item) =>
              item.kind === "leaf" ? (
                <SidebarLeaf
                  key={item.to}
                  item={item}
                  onNavigate={() => setOpen(false)}
                  premium={isSuper}
                />
              ) : (
                <SidebarGroup
                  key={item.key}
                  group={item}
                  onNavigate={() => setOpen(false)}
                  premium={isSuper}
                />
              ),
            )}
            {!role && (
              <li>
                <Link
                  to="/client-login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-white/5 text-blue-200">
                    <LogIn className="h-3.5 w-3.5" />
                  </span>
                  Sign in
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {role && (
          <div className="relative px-3 pb-3">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-white/5 text-blue-200">
                <LogOut className="h-3.5 w-3.5" />
              </span>
              Logout
            </button>
          </div>
        )}

        <div className="relative border-t border-white/10 px-5 py-4 text-[11px] text-slate-400">
          © {new Date().getFullYear()} Aditya Accounting
        </div>
      </aside>
    </>
  );
}

function SidebarLeaf({
  item,
  onNavigate,
  premium,
}: {
  item: LeafItem;
  onNavigate: () => void;
  premium: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
  const Icon = item.icon;

  const activeIconBg = premium
    ? "bg-gradient-to-br from-cyan-400 to-indigo-600 text-white shadow-md shadow-indigo-900/40"
    : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-900/40";
  const activeMarker = premium
    ? "bg-gradient-to-b from-cyan-400 to-indigo-500"
    : "bg-gradient-to-b from-blue-400 to-indigo-500";

  return (
    <li>
      <div className="group relative flex items-center">
        {active && (
          <span
            className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full ${activeMarker}`}
          />
        )}
        <Link
          to={item.to}
          onClick={onNavigate}
          className={`flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
            active
              ? "bg-white/10 text-white font-medium shadow-inner"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span
            className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${
              active ? activeIconBg : "bg-white/5 text-blue-200 group-hover:bg-white/10"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">{item.label}</span>
        </Link>
      </div>
    </li>
  );
}

function SidebarGroup({
  group,
  onNavigate,
  premium,
}: {
  group: GroupItem;
  onNavigate: () => void;
  premium: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const anyActive = group.children.some(
    (c) => pathname === c.to || pathname.startsWith(c.to + "/"),
  );
  const [expanded, setExpanded] = useState(anyActive);
  useEffect(() => {
    if (anyActive) setExpanded(true);
  }, [anyActive]);
  const Icon = group.icon;

  const headerClass = premium
    ? "text-cyan-200"
    : "text-blue-200";

  return (
    <li className="mt-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
          anyActive
            ? "bg-white/10 text-white font-medium shadow-inner"
            : "text-slate-200 hover:bg-white/5 hover:text-white"
        }`}
      >
        <span
          className={`grid h-7 w-7 place-items-center rounded-md bg-white/5 ${headerClass}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex-1 truncate text-left text-[11px] uppercase tracking-[0.14em]">
          {group.label}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <ul className="ml-3 mt-1 space-y-0.5 border-l border-white/10 pl-2">
          {group.children.map((c) => {
            const active = pathname === c.to || pathname.startsWith(c.to + "/");
            const CIcon = c.icon;
            return (
              <li key={c.to}>
                <Link
                  to={c.to}
                  onClick={onNavigate}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <CIcon className="h-3.5 w-3.5 opacity-80" />
                  <span className="truncate">{c.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
