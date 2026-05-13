"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { signInWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed. Please try again.");
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Personal Finance Suite</h1>
      <p className="text-muted-foreground text-sm">Sign in to get started</p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button onClick={handleSignIn} disabled={isLoading}>
        Sign in with Google
      </Button>
    </div>
  );
}
