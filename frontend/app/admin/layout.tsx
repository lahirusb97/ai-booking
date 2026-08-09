"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useRequireAuth } from "@/lib/use-require-auth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isReady } = useRequireAuth();

  if (!isReady) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
