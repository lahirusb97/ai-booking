"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
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
import { PublicBookingForm } from "@/components/booking/public-booking-form";
import {
  createReservation,
  getAvailableSlots,
  type AvailableSlot,
  type CreateReservationInput,
} from "@/lib/reservations";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PublicSlotBrowser() {
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

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

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

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
    setBookingConfirmed(true);
    await loadSlots();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a table</CardTitle>
        <CardDescription>Pick a date to see open slots.</CardDescription>
      </CardHeader>
      <CardContent>
        {bookingConfirmed && (
          <p className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
            Booking confirmed! We look forward to seeing you.
          </p>
        )}

        <div className="flex flex-col gap-1.5 sm:max-w-xs">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => {
              setBookingConfirmed(false);
              setDate(e.target.value);
            }}
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
              No open slots for this date. Try another day.
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
                        onClick={() => {
                          setBookingConfirmed(false);
                          setSelectedSlot(slot);
                        }}
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

      <Dialog
        open={selectedSlot !== null}
        onOpenChange={(open) => !open && setSelectedSlot(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book this slot</DialogTitle>
            <DialogDescription>
              Enter your details to confirm the reservation.
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <PublicBookingForm
              date={date}
              slot={selectedSlot}
              onCancel={() => setSelectedSlot(null)}
              onSubmit={handleBook}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
