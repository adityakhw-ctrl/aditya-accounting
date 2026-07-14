import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, AlertCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/client-login")({
  head: () => ({ meta: [{ title: "Sign in — Aditya Accounting" }] }),
  component: ClientLogin,
});

type View = "login" | "forgot" | "signup";
type LoginRole = "client" | "admin" | "super_admin";

function toUserFacingAuthMessage(error: unknown, view: View) {
  const raw =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: string }).message ?? "")
      : "";

  const message = raw.toLowerCase();

  if (!message) {
    return view === "login"
      ? "Unable to sign in right now. Please try again."
      : "Unable to continue right now. Please try again.";
  }

  if (message.includes("unexpected token") || message.includes("not valid json")) {
    return "Sign in service is temporarily unavailable. Please try again.";
  }
  if (message.includes("user not found")) {
    return "User not found.";
  }
  if (message.includes("wrong password")) {
    return "Wrong password.";
  }
  if (message.includes("invalid email or password")) {
    return "Wrong email or password.";
  }
  if (message.includes("account is deactivated")) {
    return "Your account is deactivated. Please contact support.";
  }
  if (message.includes("invalid email address")) {
    return "Please enter a valid email address.";
  }
  if (message.includes("password is required")) {
    return "Please enter your password.";
  }
  if (message.includes("password must be at least")) {
    return "Password must be at least 6 characters.";
  }
  if (message.includes("account creation is unavailable")) {
    return "New account creation is not available right now.";
  }
  if (message.includes("already exists")) {
    return "An account with this email already exists.";
  }

  return view === "login"
    ? "Unable to sign in right now. Please try again."
    : "Unable to continue right now. Please try again.";
}

function ClientLogin() {
  const [view, setView] = useState<View>("login");
  const [submitted, setSubmitted] = useState(false);
  const [role, setRoleSel] = useState<LoginRole>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { login, register, isLoginLoading, isRegisterLoading, loginError, registerError, isAuthenticated } =
    useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (view === "login") {
      try {
        await login(email, password);
        // Navigation will happen via role-based redirect
        window.location.href = "/";
      } catch (err: any) {
        setErrorMsg(toUserFacingAuthMessage(err, view));
      }
      return;
    }

    if (view === "signup") {
      try {
        // Only client and admin can self-register. Super Admin must be created by existing Super Admin.
        const registerRole = role === "super_admin" ? "client" : role;
        await register({ name, email, password, role: registerRole as "client" | "admin" });
        window.location.href = "/";
      } catch (err: any) {
        setErrorMsg(toUserFacingAuthMessage(err, view));
      }
      return;
    }

    // Forgot password
    setSubmitted(true);
  };

  const displayError =
    errorMsg ||
    toUserFacingAuthMessage(loginError, view) ||
    toUserFacingAuthMessage(registerError, view);

  // Role display names
  const roleDisplay: Record<LoginRole, string> = {
    client: "Client Login",
    admin: "Admin Login",
    super_admin: "Super Admin Login",
  };

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] w-full items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] md:min-h-[calc(100vh-3.5rem)] md:py-16">
      <div className="mx-auto w-full max-w-sm">
        <div className="glass rounded-3xl px-6 py-8 shadow-xl sm:px-8 sm:py-10">
          <div className="flex flex-col items-center">
            <Logo size={56} />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
              Aditya Accounting
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {view === "login" && "Sign in to your workspace"}
              {view === "forgot" && "Reset your password"}
              {view === "signup" && "Create your account"}
            </p>
          </div>

          {/* Role toggle — Client / Admin / Super Admin */}
          <div className="mt-6 grid grid-cols-3 gap-1.5 rounded-xl border border-blue-100 bg-blue-50/50 p-1">
            {(["client", "admin", "super_admin"] as LoginRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleSel(r)}
                className={`rounded-lg px-2 py-2 text-xs font-medium transition ${
                  role === r
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-blue-700 hover:bg-blue-100/50"
                }`}
              >
                {r === "client" && "Client"}
                {r === "admin" && "Admin"}
                {r === "super_admin" && (
                  <span className="flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Super
                  </span>
                )}
              </button>
            ))}
          </div>

          {submitted ? (
            <div className="mt-8 text-center">
              <div
                className="mx-auto grid h-12 w-12 place-items-center rounded-2xl text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                <LogIn className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {view === "forgot"
                  ? "If an account exists, a reset link has been sent."
                  : "Account request received. We'll be in touch shortly."}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setView("login");
                }}
                className="mt-6 text-sm font-medium text-blue-600 hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="mt-8 space-y-3">
              {/* Error Display */}
              {displayError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{displayError}</span>
                </div>
              )}

              {view === "signup" && (
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              )}
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {view !== "forgot" && (
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  minLength={6}
                  className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              )}

              {/* Role info for Super Admin */}
              {role === "super_admin" && view === "login" && (
                <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-700">
                  <ShieldCheck className="mr-1 inline h-3 w-3" />
                  Super Admin access only for authorized personnel.
                </p>
              )}

              <button
                type="submit"
                disabled={isLoginLoading || isRegisterLoading}
                className="mt-2 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoginLoading || isRegisterLoading
                  ? "Please wait..."
                  : view === "login"
                    ? `Sign in as ${roleDisplay[role].replace(" Login", "")}`
                    : view === "forgot"
                      ? "Send reset link"
                      : "Create account"}
              </button>

              {view === "login" && (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      or
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="block w-full text-center text-sm font-medium text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </>
              )}
            </form>
          )}
        </div>

        {!submitted && (
          <div className="glass mt-4 rounded-2xl px-8 py-5 text-center text-sm">
            {view === "login" && (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => {
                    setView("signup");
                    setErrorMsg("");
                  }}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Create new account
                </button>
              </>
            )}
            {view === "signup" && (
              <>
                Have an account?{" "}
                <button
                  onClick={() => {
                    setView("login");
                    setErrorMsg("");
                  }}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Log in
                </button>
              </>
            )}
            {view === "forgot" && (
              <>
                Remembered it?{" "}
                <button
                  onClick={() => {
                    setView("login");
                    setErrorMsg("");
                  }}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Back to sign in
                </button>
              </>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Secured by Aditya Accounting &middot; Unified Portal
        </p>
      </div>
    </div>
  );
}
