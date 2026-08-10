"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCalendarClock } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const router = useRouter();
  const { organization, signOut } = useAuth();

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <IconCalendarClock className="size-5 text-primary" />
          <span>TableTime</span>
        </Link>

        {organization && (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {organization.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
