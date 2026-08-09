"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import type { AvailableSlot, CreateReservationInput } from "@/lib/reservations";

interface PublicBookingFormProps {
  date: string;
  slot: AvailableSlot;
  onSubmit: (input: CreateReservationInput) => Promise<void>;
  onCancel: () => void;
}

export function PublicBookingForm({
  date,
  slot,
  onSubmit,
  onCancel,
}: PublicBookingFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        customerName,
        customerPhone,
        areaName: slot.areaName,
        partySize: Number(partySize),
        reservationDate: date,
        startTime: slot.startTime,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-lg bg-muted px-3 py-2 text-sm">
        <span className="font-medium">{slot.areaName}</span>
        <span className="text-muted-foreground">
          {" "}
          · {date} · {slot.startTime}–{slot.endTime}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="customerName">Your name</Label>
        <Input
          id="customerName"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Jane Doe"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="customerPhone">Phone</Label>
        <Input
          id="customerPhone"
          type="tel"
          required
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="0771234567"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="partySize">Party size</Label>
        <Input
          id="partySize"
          type="number"
          min={1}
          max={slot.maxCapacityPerSlot}
          required
          value={partySize}
          onChange={(e) => setPartySize(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Booking…" : "Confirm booking"}
        </Button>
      </DialogFooter>
    </form>
  );
}
