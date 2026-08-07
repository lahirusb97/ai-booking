import { tool } from '@livekit/agents';
import { z } from 'zod';
import { ReservationsService } from '../reservations/reservations.service';

export interface ToolHooks {
  onReservationCreated: () => void;
  onNoAvailability: () => void;
}

export function buildTools(
  reservationsService: ReservationsService,
  hooks: ToolHooks,
) {
  return {
    check_availability: tool({
      description:
        'Check if a table is available for a given date, time, and party size.',
      parameters: z.object({
        date: z.string().describe('Reservation date in YYYY-MM-DD format'),
        time: z.string().describe('Reservation time in HH:MM 24-hour format'),
        party_size: z.number().int().describe('Number of people in the party'),
      }),
      execute: async ({ date, time, party_size }) => {
        const available = await reservationsService.checkAvailability(
          date,
          time,
          party_size,
        );
        if (!available) hooks.onNoAvailability();
        return { available };
      },
    }),
    create_reservation: tool({
      description:
        'Create a confirmed reservation once all details are collected and availability is confirmed.',
      parameters: z.object({
        name: z.string().describe('Customer full name'),
        phone: z.string().describe('Customer phone number'),
        date: z.string().describe('Reservation date in YYYY-MM-DD format'),
        time: z.string().describe('Reservation time in HH:MM 24-hour format'),
        party_size: z.number().int().describe('Number of people in the party'),
      }),
      execute: async ({ name, phone, date, time, party_size }) => {
        const reservation = await reservationsService.createReservation({
          customerName: name,
          customerPhone: phone,
          partySize: party_size,
          reservationDate: date,
          reservationTime: time,
        });
        hooks.onReservationCreated();
        return { reservationId: reservation.id };
      },
    }),
  };
}
