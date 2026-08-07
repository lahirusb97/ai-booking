import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { Payment } from './entities/payment.entity';
import { AvailabilityRulesService } from '../availability-rules/availability-rules.service';
import { CustomersService } from '../customers/customers.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AvailableSlot } from './types/slot.types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.slice(0, 5).split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly availabilityRulesService: AvailabilityRulesService,
    private readonly customersService: CustomersService,
  ) {}

  findAll(): Promise<Reservation[]> {
    return this.reservationRepo.find({ order: { reservationDate: 'DESC', startTime: 'ASC' } });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepo.findOne({ where: { id } });
    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }
    return reservation;
  }

  async getAvailableSlots(
    date: string,
    areaName?: string,
  ): Promise<AvailableSlot[]> {
    if (!date || !DATE_PATTERN.test(date)) {
      throw new BadRequestException('date must be a valid date in YYYY-MM-DD format');
    }

    const rules = await this.availabilityRulesService.findAll();
    const activeRules = rules.filter((rule) => {
      if (areaName && rule.areaName !== areaName) return false;
      if (rule.ruleExpiredDate && rule.ruleExpiredDate < date) return false;
      return true;
    });

    if (activeRules.length === 0) {
      return [];
    }

    const existing = await this.reservationRepo.find({
      where: { reservationDate: date },
    });

    const slots: AvailableSlot[] = [];

    for (const rule of activeRules) {
      let cursor = rule.dayStartTime.slice(0, 5);
      const closeTime = rule.dayEndTime.slice(0, 5);

      while (addMinutes(cursor, rule.slotDurationMinutes) <= closeTime) {
        const slotStart = cursor;
        const slotEnd = addMinutes(cursor, rule.slotDurationMinutes);

        const bookedCount = existing.filter(
          (r) =>
            r.areaName === rule.areaName &&
            r.startTime.slice(0, 5) === slotStart &&
            r.status !== ReservationStatus.COMPLETED,
        ).length;

        const remainingCapacity = rule.maxCapacityPerSlot - bookedCount;

        if (remainingCapacity > 0) {
          slots.push({
            areaName: rule.areaName,
            startTime: slotStart,
            endTime: slotEnd,
            remainingCapacity,
            maxCapacityPerSlot: rule.maxCapacityPerSlot,
          });
        }

        cursor = slotEnd;
      }
    }

    return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  async create(data: CreateReservationDto): Promise<Reservation> {
    this.validate(data);

    const rule = await this.findMatchingRule(data.areaName, data.reservationDate, data.startTime);
    if (data.partySize < rule.minCapacityPerSlot || data.partySize > rule.maxCapacityPerSlot) {
      throw new BadRequestException(
        `partySize must be between ${rule.minCapacityPerSlot} and ${rule.maxCapacityPerSlot} for ${rule.areaName}`,
      );
    }

    const endTime = addMinutes(data.startTime, rule.slotDurationMinutes);

    const bookedCount = await this.reservationRepo.count({
      where: {
        areaName: data.areaName,
        reservationDate: data.reservationDate,
        startTime: data.startTime,
      },
    });
    if (bookedCount >= rule.maxCapacityPerSlot) {
      throw new BadRequestException('This slot is fully booked');
    }

    const customer = await this.customersService.findOrCreate(
      data.customerName.trim(),
      data.customerPhone.trim(),
    );

    const reservation = this.reservationRepo.create({
      customer,
      customerId: customer.id,
      areaName: data.areaName,
      partySize: data.partySize,
      reservationDate: data.reservationDate,
      startTime: data.startTime,
      endTime,
      status: ReservationStatus.PENDING,
    });

    if (data.amount != null) {
      reservation.payment = this.paymentRepo.create({ amount: data.amount });
    }

    return this.reservationRepo.save(reservation);
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const reservation = await this.findOne(id);
    reservation.status = status;
    return this.reservationRepo.save(reservation);
  }

  async remove(id: string): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationRepo.remove(reservation);
  }

  private async findMatchingRule(areaName: string, date: string, startTime: string) {
    const rules = await this.availabilityRulesService.findAll();
    const rule = rules.find((r) => {
      if (r.areaName !== areaName) return false;
      if (r.ruleExpiredDate && r.ruleExpiredDate < date) return false;
      return startTime >= r.dayStartTime.slice(0, 5) && startTime < r.dayEndTime.slice(0, 5);
    });
    if (!rule) {
      throw new BadRequestException(
        `No availability rule covers ${areaName} at ${startTime} on ${date}`,
      );
    }
    return rule;
  }

  private validate(data: CreateReservationDto): void {
    if (!data.customerName || !data.customerName.trim()) {
      throw new BadRequestException('customerName is required');
    }
    if (!data.customerPhone || !data.customerPhone.trim()) {
      throw new BadRequestException('customerPhone is required');
    }
    if (!data.areaName || !data.areaName.trim()) {
      throw new BadRequestException('areaName is required');
    }
    if (!data.partySize || data.partySize <= 0) {
      throw new BadRequestException('partySize must be a positive number');
    }
    if (!data.reservationDate || !DATE_PATTERN.test(data.reservationDate)) {
      throw new BadRequestException('reservationDate must be a valid date in YYYY-MM-DD format');
    }
    if (!data.startTime || !TIME_PATTERN.test(data.startTime)) {
      throw new BadRequestException('startTime must be a valid time in HH:mm format');
    }
    if (data.amount != null && data.amount < 0) {
      throw new BadRequestException('amount must be a non-negative number');
    }
  }

  // --- Legacy voice/LLM integration compatibility ---

  async checkAvailability(
    date: string,
    time: string,
    partySize: number,
  ): Promise<boolean> {
    const slots = await this.getAvailableSlots(date);
    return slots.some(
      (slot) =>
        slot.startTime === time.slice(0, 5) &&
        slot.remainingCapacity > 0 &&
        partySize <= slot.maxCapacityPerSlot,
    );
  }

  async createReservation(data: {
    customerName: string;
    customerPhone: string;
    partySize: number;
    reservationDate: string;
    reservationTime: string;
  }): Promise<Reservation> {
    const slots = await this.getAvailableSlots(data.reservationDate);
    const slot = slots.find((s) => s.startTime === data.reservationTime.slice(0, 5));
    if (!slot) {
      throw new BadRequestException('No availability for the requested time');
    }

    return this.create({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      areaName: slot.areaName,
      partySize: data.partySize,
      reservationDate: data.reservationDate,
      startTime: data.reservationTime.slice(0, 5),
    });
  }
}
