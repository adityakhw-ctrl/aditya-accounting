import { createContext, useContext, type ReactNode } from "react";
import { useAuth, type AuthUser } from "@/hooks/useAuth";

export type Role = "CLIENT" | "ADMIN" | "SUPER_ADMIN";

type RoleCtx = {
  role: Role | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (role: Role) => void; // kept for backward compat, but no-op
  signOut: () => void;
};

const Ctx = createContext<RoleCtx>({
  role: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: () => {},
  signOut: () => {},
});

function toFrontendRole(role: string | undefined): Role | null {
  if (role === "client") return "CLIENT";
  if (role === "admin") return "ADMIN";
  if (role === "super_admin") return "SUPER_ADMIN";
  return null;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const role = toFrontendRole(auth.user?.role);

  const signIn = () => {
    // No-op: real auth is handled by the login mutation
  };

  const signOut = () => {
    auth.logout();
  };

  return (
    <Ctx.Provider
      value={{
        role,
        user: auth.user ?? null,
        isLoading: auth.isLoading,
        isAuthenticated: auth.isAuthenticated,
        signIn,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useRole = () => useContext(Ctx);

export const roleLabel: Record<Role, string> = {
  CLIENT: "Client",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};
