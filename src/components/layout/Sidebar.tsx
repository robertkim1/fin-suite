"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-sidebar px-3 py-4 shrink-0">
      <div className="mb-6 px-2">
        <h1 className="text-sm font-semibold text-sidebar-foreground">Personal Finance</h1>
        {user && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const active = pathname.startsWith(mod.href);
          return (
            <Link
              key={mod.id}
              href={mod.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {mod.label}
            </Link>
          );
        })}
      </nav>

      {isAuthenticated && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 justify-start gap-2 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      )}
    </aside>
  );
}
