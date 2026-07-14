import { useCallback } from "react";
import { trpc } from "@/providers/trpc";

export type UserRole = "client" | "admin" | "super_admin";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: user,
    isLoading: isLoadingUser,
    error,
  } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      utils.auth.me.invalidate();
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      utils.auth.me.invalidate();
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem("auth_token");
      utils.auth.me.invalidate();
      utils.invalidate();
    },
  });

  const login = useCallback(
    async (email: string, password: string) => {
      return loginMutation.mutateAsync({ email, password });
    },
    [loginMutation]
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      role?: "client" | "admin";
    }) => {
      return registerMutation.mutateAsync(data);
    },
    [registerMutation]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    logoutMutation.mutate();
    window.location.reload();
  }, [logoutMutation]);

  return {
    user: user as AuthUser | null | undefined,
    isAuthenticated: !!user,
    isLoading: isLoadingUser,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    login,
    register,
    logout,
  };
}
