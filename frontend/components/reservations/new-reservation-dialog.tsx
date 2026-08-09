"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingForm } from "@/components/reservations/booking-form";
import {
  getAvailableSlots,
  type AvailableSlot,
  type CreateReservationInput,
} from "@/lib/reservations";

interface NewReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateReservationInput) => Promise<void>;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function NewReservationDialog({
  open,
  onOpenChange,
  onSubmit,
}: NewReservationDialogProps) {
  const [date, setDate] = useState(todayIso());
  const [partySize, setPartySize] = useState("2");
  const [slots, setSlots] = useState<AvailableSlot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  function reset() {
    setDate(todayIso());
    setPartySize("2");
    setSlots(null);
    setSlotsError(null);
    setSelectedSlot(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  useEffect(() => {
    if (!open) return;

    const size = Number(partySize);
    if (!date || !partySize || !(size >= 1)) {
      setSlots(null);
      return;
    }

    let cancelled = false;
    setSlotsError(null);
    setSlotsLoading(true);
    setSelectedSlot(null);

    getAvailableSlots(date)
      .then((data) => {
        if (cancelled) return;
        setSlots(
          data.filter(
            (slot) => size <= slot.maxCapacityPerSlot && slot.remainingCapacity > 0,
          ),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setSlotsError(err instanceof Error ? err.message : "Failed to load slots");
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, date, partySize]);

  async function handleSubmit(input: CreateReservationInput) {
    await onSubmit(input);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New reservation</DialogTitle>
          <DialogDescription>
            Pick a date and party size, then choose an available slot.
          </DialogDescription>
        </DialogHeader>

        {!selectedSlot && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-res-date">Date</Label>
                <Input
                  id="new-res-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-res-party-size">Party size</Label>
                <Input
                  id="new-res-party-size"
                  type="number"
                  min={1}
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                />
              </div>
            </div>

            {slotsError && (
              <p role="alert" className="text-sm text-destructive">
                {slotsError}
              </p>
            )}

            {slotsLoading && (
              <p className="text-sm text-muted-foreground">Loading slots…</p>
            )}

            {slots !== null && !slotsLoading && (
              slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No open slots for this date and party size.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {Object.entries(
                    slots.reduce<Record<string, AvailableSlot[]>>((acc, slot) => {
                      (acc[slot.areaName] ??= []).push(slot);
                      return acc;
                    }, {}),
                  ).map(([areaName, areaSlots]) => (
                    <div key={areaName}>
                      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                        {areaName}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {areaSlots.map((slot) => (
                          <Button
                            key={`${slot.areaName}-${slot.startTime}`}
                            type="button"
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
              )
            )}
          </div>
        )}

        {selectedSlot && (
          <BookingForm
            date={date}
            slot={selectedSlot}
            onCancel={() => setSelectedSlot(null)}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
