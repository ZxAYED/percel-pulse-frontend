import React, { useMemo, useState } from "react";
import { AuthContext, type AuthContextValue, type AuthUser, type Role } from "./AuthContextBase";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    return {
      token: storedToken,
      user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null,
    };
  });

  const value = useMemo<AuthContextValue>(() => ({
    token: state.token,
    user: state.user,
    role: state.user?.role ?? null,
    isAuthenticated: !!state.token,
    login: ({ token, user }) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ token, user });
    },
    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setState({ token: null, user: null });
    },
    setUser: (user) => {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
      setState((prev) => ({ ...prev, user }));
    },
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
