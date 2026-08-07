"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import type { AvailabilityRule, AvailabilityRuleInput } from "@/lib/availability";

interface AvailabilityRuleFormProps {
  initial?: AvailabilityRule;
  onSubmit: (input: AvailabilityRuleInput) => Promise<void>;
  onCancel: () => void;
}

export function AvailabilityRuleForm({
  initial,
  onSubmit,
  onCancel,
}: AvailabilityRuleFormProps) {
  const [areaName, setAreaName] = useState(initial?.areaName ?? "");
  const [dayStartTime, setDayStartTime] = useState(
    initial?.dayStartTime?.slice(0, 5) ?? "09:00",
  );
  const [dayEndTime, setDayEndTime] = useState(
    initial?.dayEndTime?.slice(0, 5) ?? "17:00",
  );
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(
    String(initial?.slotDurationMinutes ?? 30),
  );
  const [maxCapacityPerSlot, setMaxCapacityPerSlot] = useState(
    String(initial?.maxCapacityPerSlot ?? 4),
  );
  const [minCapacityPerSlot, setMinCapacityPerSlot] = useState(
    String(initial?.minCapacityPerSlot ?? 1),
  );
  const [ruleExpiredDate, setRuleExpiredDate] = useState(
    initial?.ruleExpiredDate ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        areaName,
        dayStartTime,
        dayEndTime,
        slotDurationMinutes: Number(slotDurationMinutes),
        maxCapacityPerSlot: Number(maxCapacityPerSlot),
        minCapacityPerSlot: Number(minCapacityPerSlot),
        ruleExpiredDate: ruleExpiredDate || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="areaName">Area name</Label>
        <Input
          id="areaName"
          required
          value={areaName}
          onChange={(e) => setAreaName(e.target.value)}
          placeholder="Main dining room"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dayStartTime">Opens at</Label>
          <Input
            id="dayStartTime"
            type="time"
            required
            value={dayStartTime}
            onChange={(e) => setDayStartTime(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dayEndTime">Closes at</Label>
          <Input
            id="dayEndTime"
            type="time"
            required
            value={dayEndTime}
            onChange={(e) => setDayEndTime(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slotDurationMinutes">Slot (min)</Label>
          <Input
            id="slotDurationMinutes"
            type="number"
            min={1}
            required
            value={slotDurationMinutes}
            onChange={(e) => setSlotDurationMinutes(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="minCapacityPerSlot">Min party</Label>
          <Input
            id="minCapacityPerSlot"
            type="number"
            min={0}
            required
            value={minCapacityPerSlot}
            onChange={(e) => setMinCapacityPerSlot(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxCapacityPerSlot">Max party</Label>
          <Input
            id="maxCapacityPerSlot"
            type="number"
            min={1}
            required
            value={maxCapacityPerSlot}
            onChange={(e) => setMaxCapacityPerSlot(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ruleExpiredDate">Expires on (optional)</Label>
        <Input
          id="ruleExpiredDate"
          type="date"
          value={ruleExpiredDate ?? ""}
          onChange={(e) => setRuleExpiredDate(e.target.value)}
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
          {isSubmitting ? "Saving…" : initial ? "Save changes" : "Create rule"}
        </Button>
      </DialogFooter>
    </form>
  );
}
