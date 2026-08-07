import { CreateAvailabilityRuleDto } from './create-availability-rule.dto';

export class UpdateAvailabilityRuleDto
  implements Partial<CreateAvailabilityRuleDto>
{
  areaName?: string;
  dayStartTime?: string;
  dayEndTime?: string;
  slotDurationMinutes?: number;
  maxCapacityPerSlot?: number;
  minCapacityPerSlot?: number;
  ruleExpiredDate?: string | null;
}
