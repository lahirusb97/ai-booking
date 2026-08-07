import { apiFetch } from "@/lib/api";

export type ReservationStatus = "pending" | "confirmed" | "seated" | "completed";

export interface AvailableSlot {
  areaName: string;
  startTime: string;
  endTime: string;
  remainingCapacity: number;
  maxCapacityPerSlot: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  createdAt: string;
}

export interface Reservation {
  id: string;
  customer: Customer;
  customerId: string;
  areaName: string;
  partySize: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  payment: Payment | null;
  createdAt: string;
}

export interface CreateReservationInput {
  customerName: string;
  customerPhone: string;
  areaName: string;
  partySize: number;
  reservationDate: string;
  startTime: string;
  amount?: number;
}

export function getAvailableSlots(
  date: string,
  areaName?: string,
): Promise<AvailableSlot[]> {
  const params = new URLSearchParams({ date });
  if (areaName) params.set("areaName", areaName);
  return apiFetch<AvailableSlot[]>(`/reservations/slots?${params.toString()}`);
}

export function listReservations(): Promise<Reservation[]> {
  return apiFetch<Reservation[]>("/reservations");
}

export function createReservation(
  input: CreateReservationInput,
): Promise<Reservation> {
  return apiFetch<Reservation>("/reservations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<Reservation> {
  return apiFetch<Reservation>(`/reservations/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteReservation(id: string): Promise<void> {
  return apiFetch<void>(`/reservations/${id}`, {
    method: "DELETE",
  });
}
