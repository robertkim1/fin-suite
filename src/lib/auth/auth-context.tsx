"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { authClient } from "./auth-client";

type User = {
  id: string;
  email: string;
  name?: string;
  image?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  const signInWithGoogle = async () => {
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/balance-tracker" });
    if (error) throw new Error(error.message ?? "Sign in failed");
  };

  const signOut = async () => {
    const { error } = await authClient.signOut();
    if (error) throw new Error(error.message ?? "Sign out failed");
  };

  const user = useMemo<User | null>(() => {
    if (!session) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image ?? undefined,
    };
  }, [session]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!session && !isPending, isLoading: isPending, user, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("Missing AuthProvider");
  return ctx;
}
