"use client";

import Link from "next/link";
import { IconCalendarCheck, IconClock, IconUsers } from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export default function AdminHome() {
  const { organization } = useAuth();

  return (
    <>
      <h1 className="text-3xl">Welcome back, {organization?.name}</h1>
      <p className="mt-2 text-muted-foreground">
        Here&apos;s a quick overview of your reservation system.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/reservations">
          <Card className="transition-colors hover:bg-accent/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconCalendarCheck className="size-5 text-primary" />
                <CardTitle>Reservations</CardTitle>
              </div>
              <CardDescription>
                View and manage upcoming bookings.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/availability">
          <Card className="transition-colors hover:bg-accent/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconClock className="size-5 text-primary" />
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
              <IconUsers className="size-5 text-primary" />
              <CardTitle>Organization</CardTitle>
            </div>
            <CardDescription>{organization?.email}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}
