import { createContext } from "react";

export type Role = "ADMIN" | "AGENT" | "CUSTOMER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
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
