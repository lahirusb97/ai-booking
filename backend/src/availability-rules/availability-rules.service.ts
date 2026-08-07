import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilityRule } from './entities/availability-rule.entity';
import { CreateAvailabilityRuleDto } from './dto/create-availability-rule.dto';
import { UpdateAvailabilityRuleDto } from './dto/update-availability-rule.dto';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Injectable()
export class AvailabilityRulesService {
  constructor(
    @InjectRepository(AvailabilityRule)
    private readonly ruleRepo: Repository<AvailabilityRule>,
  ) {}

  findAll(): Promise<AvailabilityRule[]> {
    return this.ruleRepo.find();
  }

  async findOne(id: string): Promise<AvailabilityRule> {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Availability rule ${id} not found`);
    }
    return rule;
  }

  create(data: CreateAvailabilityRuleDto): Promise<AvailabilityRule> {
    this.validate(data);
    const rule = this.ruleRepo.create({
      ...data,
      ruleExpiredDate: data.ruleExpiredDate ?? null,
    });
    return this.ruleRepo.save(rule);
  }

  async update(
    id: string,
    data: UpdateAvailabilityRuleDto,
  ): Promise<AvailabilityRule> {
    const rule = await this.findOne(id);
    this.validate({ ...rule, ...data });
    Object.assign(rule, data);
    return this.ruleRepo.save(rule);
  }

  async remove(id: string): Promise<void> {
    const rule = await this.findOne(id);
    await this.ruleRepo.remove(rule);
  }

  private validate(data: {
    areaName?: string;
    dayStartTime?: string;
    dayEndTime?: string;
    slotDurationMinutes?: number;
    maxCapacityPerSlot?: number;
    minCapacityPerSlot?: number;
    ruleExpiredDate?: string | null;
  }): void {
    if (!data.areaName || !data.areaName.trim()) {
      throw new BadRequestException('areaName is required');
    }
    if (!data.dayStartTime || !TIME_PATTERN.test(data.dayStartTime)) {
      throw new BadRequestException(
        'dayStartTime must be a valid time in HH:mm format',
      );
    }
    if (!data.dayEndTime || !TIME_PATTERN.test(data.dayEndTime)) {
      throw new BadRequestException(
        'dayEndTime must be a valid time in HH:mm format',
      );
    }
    if (data.dayStartTime >= data.dayEndTime) {
      throw new BadRequestException('dayStartTime must be before dayEndTime');
    }
    if (!data.slotDurationMinutes || data.slotDurationMinutes <= 0) {
      throw new BadRequestException(
        'slotDurationMinutes must be a positive number',
      );
    }
    if (!data.maxCapacityPerSlot || data.maxCapacityPerSlot <= 0) {
      throw new BadRequestException(
        'maxCapacityPerSlot must be a positive number',
      );
    }
    if (data.minCapacityPerSlot == null || data.minCapacityPerSlot < 0) {
      throw new BadRequestException(
        'minCapacityPerSlot must be a non-negative number',
      );
    }
    if (data.minCapacityPerSlot > data.maxCapacityPerSlot) {
      throw new BadRequestException(
        'minCapacityPerSlot cannot be greater than maxCapacityPerSlot',
      );
    }
    if (data.ruleExpiredDate && !DATE_PATTERN.test(data.ruleExpiredDate)) {
      throw new BadRequestException(
        'ruleExpiredDate must be a valid date in YYYY-MM-DD format',
      );
    }
  }
}
