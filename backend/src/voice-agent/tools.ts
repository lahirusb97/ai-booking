import { Logger } from '@nestjs/common';
import { tool } from '@livekit/agents';
import { z } from 'zod';
import { ReservationsService } from '../reservations/reservations.service';

export interface ToolHooks {
  onReservationCreated: () => void;
  onNoAvailability: () => void;
}

const logger = new Logger('VoiceAgentTools');

export function buildTools(
  reservationsService: ReservationsService,
  hooks: ToolHooks,
) {
  return {
    get_available_slots: tool({
      description:
        "List real available time slots for a given date, grouped by area, with remaining capacity. Use this to tell the customer what times and areas are actually open before offering a time.",
      parameters: z.object({
        date: z.string().describe('Date to check in YYYY-MM-DD format'),
        party_size: z
          .number()
          .int()
          .optional()
          .describe('If given, only return slots that can fit this many people'),
      }),
      execute: async ({ date, party_size }) => {
        const slots = await reservationsService.getAvailableSlots(date);
        const filtered =
          party_size != null
            ? slots.filter((slot) => party_size <= slot.maxCapacityPerSlot)
            : slots;
        if (filtered.length === 0) hooks.onNoAvailability();
        return { slots: filtered };
      },
    }),
    check_availability: tool({
      description:
        'Check if a specific date, time, and party size can be booked. Prefer get_available_slots to see all open options first; use this to confirm one specific time the customer asked for.',
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
    get_customer_reservations: tool({
      description:
        "Look up a customer's existing reservations by phone number. Use this when the caller asks about, changes, or references an existing booking, or to check whether they already have one before creating a new one.",
      parameters: z.object({
        phone: z.string().describe('Customer phone number'),
      }),
      execute: async ({ phone }) => {
        logger.log(`get_customer_reservations: AI-detected phone="${phone}"`);
        const reservations = await reservationsService.findByPhone(phone);
        logger.log(
          `get_customer_reservations: query phone="${phone}" -> ${reservations.length} result(s): ${JSON.stringify(
            reservations.map((r) => ({
              id: r.id,
              date: r.reservationDate,
              startTime: r.startTime.slice(0, 5),
              status: r.status,
            })),
          )}`,
        );
        return {
          reservations: reservations.map((r) => ({
            id: r.id,
            areaName: r.areaName,
            partySize: r.partySize,
            date: r.reservationDate,
            startTime: r.startTime.slice(0, 5),
            endTime: r.endTime.slice(0, 5),
            status: r.status,
          })),
        };
      },
    }),
    create_reservation: tool({
      description:
        'Create a confirmed reservation once all details are collected and availability is confirmed via get_available_slots or check_availability.',
      parameters: z.object({
        name: z.string().describe('Customer full name'),
        phone: z.string().describe('Customer phone number'),
        date: z.string().describe('Reservation date in YYYY-MM-DD format'),
        time: z.string().describe('Reservation time in HH:MM 24-hour format'),
        party_size: z.number().int().describe('Number of people in the party'),
        area_name: z
          .string()
          .describe('The area name for the slot, as returned by get_available_slots'),
      }),
      execute: async ({ name, phone, date, time, party_size, area_name }) => {
        const reservation = await reservationsService.createReservation({
          customerName: name,
          customerPhone: phone,
          partySize: party_size,
          reservationDate: date,
          reservationTime: time,
          areaName: area_name,
        });
        hooks.onReservationCreated();
        return { reservationId: reservation.id };
      },
    }),
  };
}
