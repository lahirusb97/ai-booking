"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clearSession,
  getStoredOrganization,
  getStoredToken,
  storeSession,
  type AuthResult,
} from "@/lib/auth";

type Organization = AuthResult["organization"];

interface AuthContextValue {
  organization: Organization | null;
  token: string | null;
  isLoading: boolean;
  signIn: (result: AuthResult) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setToken(getStoredToken());
    setOrganization(getStoredOrganization());
    setIsLoading(false);
  }, []);

  const signIn = useCallback((result: AuthResult) => {
    storeSession(result);
    setToken(result.accessToken);
    setOrganization(result.organization);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setToken(null);
    setOrganization(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ organization, token, isLoading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
