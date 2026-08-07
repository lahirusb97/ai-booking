export class CreateAvailabilityRuleDto {
  areaName!: string;
  dayStartTime!: string;
  dayEndTime!: string;
  slotDurationMinutes!: number;
  maxCapacityPerSlot!: number;
  minCapacityPerSlot!: number;
  ruleExpiredDate?: string | null;
}
