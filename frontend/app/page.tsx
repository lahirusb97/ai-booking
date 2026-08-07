"use client";

import Link from "next/link";
import { CalendarCheck2, Clock3, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppShell } from "@/components/layout/app-shell";
import { useRequireAuth } from "@/lib/use-require-auth";

export default function Home() {
  const { organization, isReady } = useRequireAuth();

  if (!isReady || !organization) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <AppShell>
      <h1 className="text-3xl">Welcome back, {organization.name}</h1>
      <p className="mt-2 text-muted-foreground">
        Here&apos;s a quick overview of your reservation system.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="size-5 text-primary" />
              <CardTitle>Reservations</CardTitle>
            </div>
            <CardDescription>
              View and manage upcoming bookings.
            </CardDescription>
          </CardHeader>
        </Card>
        <Link href="/availability">
          <Card className="transition-colors hover:bg-accent/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock3 className="size-5 text-primary" />
                <CardTitle>Availability</CardTitle>
              </div>
              <CardDescription>
                Configure open hours and slot capacity.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <CardTitle>Organization</CardTitle>
            </div>
            <CardDescription>{organization.email}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AppShell>
  );
}
