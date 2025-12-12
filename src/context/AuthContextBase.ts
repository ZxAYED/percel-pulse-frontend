import { createContext } from "react";

export type Role = "admin" | "agent" | "customer";

export type AuthUser = {
  name: string;
  email: string;
  role: Role;
};

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (payload: { token: string; user: AuthUser }) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
