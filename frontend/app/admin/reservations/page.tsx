"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { NewReservationDialog } from "@/components/reservations/new-reservation-dialog";
import {
  createReservation,
  listReservations,
  updateReservationStatus,
  type CreateReservationInput,
  type Reservation,
  type ReservationStatus,
} from "@/lib/reservations";

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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [reservationsError, setReservationsError] = useState<string | null>(null);

  const [newReservationOpen, setNewReservationOpen] = useState(false);

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
    loadReservations();
  }, [loadReservations]);

  async function handleCreateReservation(input: CreateReservationInput) {
    await createReservation(input);
    await loadReservations();
  }

  async function handleStatusChange(id: string, status: ReservationStatus) {
    await updateReservationStatus(id, status);
    await loadReservations();
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Reservations</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage table reservations.
          </p>
        </div>
        <Button onClick={() => setNewReservationOpen(true)}>
          <IconPlus className="size-4" />
          New reservation
        </Button>
      </div>

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

      <NewReservationDialog
        open={newReservationOpen}
        onOpenChange={setNewReservationOpen}
        onSubmit={handleCreateReservation}
      />
    </>
  );
}
