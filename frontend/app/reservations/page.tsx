"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingForm } from "@/components/reservations/booking-form";
import { useRequireAuth } from "@/lib/use-require-auth";
import {
  createReservation,
  getAvailableSlots,
  listReservations,
  updateReservationStatus,
  type AvailableSlot,
  type CreateReservationInput,
  type Reservation,
  type ReservationStatus,
} from "@/lib/reservations";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_OPTIONS: ReservationStatus[] = [
  "pending",
  "confirmed",
  "seated",
  "completed",
];

const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  seated: "Seated",
  completed: "Completed",
};

const STATUS_BADGE_CLASS: Record<ReservationStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-accent text-accent-foreground",
  seated: "bg-primary/15 text-primary",
  completed: "bg-muted text-muted-foreground",
};

export default function ReservationsPage() {
  const { isReady } = useRequireAuth();
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [reservationsError, setReservationsError] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const data = await getAvailableSlots(date);
      setSlots(data);
    } catch (err) {
      setSlotsError(err instanceof Error ? err.message : "Failed to load slots");
    } finally {
      setSlotsLoading(false);
    }
  }, [date]);

  const loadReservations = useCallback(async () => {
    setReservationsLoading(true);
    setReservationsError(null);
    try {
      const data = await listReservations();
      setReservations(data);
    } catch (err) {
      setReservationsError(
        err instanceof Error ? err.message : "Failed to load reservations",
      );
    } finally {
      setReservationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isReady) loadSlots();
  }, [isReady, loadSlots]);

  useEffect(() => {
    if (isReady) loadReservations();
  }, [isReady, loadReservations]);

  const slotsByArea = useMemo(() => {
    const groups = new Map<string, AvailableSlot[]>();
    for (const slot of slots) {
      const group = groups.get(slot.areaName) ?? [];
      group.push(slot);
      groups.set(slot.areaName, group);
    }
    return groups;
  }, [slots]);

  async function handleBook(input: CreateReservationInput) {
    await createReservation(input);
    setSelectedSlot(null);
    await Promise.all([loadSlots(), loadReservations()]);
  }

  async function handleStatusChange(id: string, status: ReservationStatus) {
    await updateReservationStatus(id, status);
    await loadReservations();
  }

  if (!isReady) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <AppShell>
      <h1 className="text-3xl">Reservations</h1>
      <p className="mt-2 text-muted-foreground">
        Pick a date to see open slots, then book a table.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Available slots</CardTitle>
          <CardDescription>
            Slots are generated from your availability rules for the selected date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5 sm:max-w-xs">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="mt-6">
            {slotsError && (
              <p role="alert" className="text-sm text-destructive">
                {slotsError}
              </p>
            )}

            {slotsLoading ? (
              <p className="text-sm text-muted-foreground">Loading slots…</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No open slots for this date. Check your availability rules.
              </p>
            ) : (
              <div className="flex flex-col gap-6">
                {Array.from(slotsByArea.entries()).map(([areaName, areaSlots]) => (
                  <div key={areaName}>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                      {areaName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {areaSlots.map((slot) => (
                        <Button
                          key={`${slot.areaName}-${slot.startTime}`}
                          variant="outline"
                          className="flex-col items-start gap-0.5 h-auto py-2"
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <span className="font-medium">{slot.startTime}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="size-3" />
                            {slot.remainingCapacity} left
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All reservations</CardTitle>
          <CardDescription>
            {reservations.length} reservation{reservations.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reservationsError && (
            <p role="alert" className="mb-4 text-sm text-destructive">
              {reservationsError}
            </p>
          )}

          {reservationsLoading ? (
            <p className="text-sm text-muted-foreground">Loading reservations…</p>
          ) : reservations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reservations yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Date &amp; time</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{r.customer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.customer.phone}
                      </div>
                    </TableCell>
                    <TableCell>{r.areaName}</TableCell>
                    <TableCell>
                      {r.reservationDate} · {r.startTime.slice(0, 5)}–
                      {r.endTime.slice(0, 5)}
                    </TableCell>
                    <TableCell>{r.partySize}</TableCell>
                    <TableCell>
                      {r.payment ? `$${Number(r.payment.amount).toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.status}
                        onValueChange={(value) =>
                          handleStatusChange(r.id, value as ReservationStatus)
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className={STATUS_BADGE_CLASS[r.status]}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {STATUS_LABEL[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={selectedSlot !== null}
        onOpenChange={(open) => !open && setSelectedSlot(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book this slot</DialogTitle>
            <DialogDescription>
              Enter the customer&apos;s details to place the reservation.
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <BookingForm
              date={date}
              slot={selectedSlot}
              onCancel={() => setSelectedSlot(null)}
              onSubmit={handleBook}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
