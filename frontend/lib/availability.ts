import { apiFetch } from "@/lib/api";

export interface AvailabilityRule {
  id: string;
  areaName: string;
  dayStartTime: string;
  dayEndTime: string;
  slotDurationMinutes: number;
  maxCapacityPerSlot: number;
  minCapacityPerSlot: number;
  ruleExpiredDate: string | null;
  createdAt: string;
}

export interface AvailabilityRuleInput {
  areaName: string;
  dayStartTime: string;
  dayEndTime: string;
  slotDurationMinutes: number;
  maxCapacityPerSlot: number;
  minCapacityPerSlot: number;
  ruleExpiredDate?: string | null;
}

export function listAvailabilityRules(): Promise<AvailabilityRule[]> {
  return apiFetch<AvailabilityRule[]>("/availability-rules");
}

export function createAvailabilityRule(
  input: AvailabilityRuleInput,
): Promise<AvailabilityRule> {
  return apiFetch<AvailabilityRule>("/availability-rules", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAvailabilityRule(
  id: string,
  input: Partial<AvailabilityRuleInput>,
): Promise<AvailabilityRule> {
  return apiFetch<AvailabilityRule>(`/availability-rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteAvailabilityRule(id: string): Promise<void> {
  return apiFetch<void>(`/availability-rules/${id}`, {
    method: "DELETE",
  });
}
