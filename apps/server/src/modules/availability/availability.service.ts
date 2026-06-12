import {
  updateAvailabilitySchema,
  type AvailabilityRule,
  type UpdateAvailabilityDto,
  type WeeklyAvailability,
} from '@calendly/shared';
import type { AvailabilityRule as PrismaRule } from '@prisma/client';
import { availabilityRepository, AvailabilityRepository } from './availability.repository.js';

function toRuleDto(row: PrismaRule): AvailabilityRule {
  return {
    id: row.id,
    weekday: row.weekday,
    startTime: row.startTime,
    endTime: row.endTime,
  };
}

export class AvailabilityService {
  constructor(private readonly repo: AvailabilityRepository = availabilityRepository) {}

  async get(userId: string, timezone: string): Promise<WeeklyAvailability> {
    const rules = await this.repo.findRulesByUser(userId);
    return { timezone, rules: rules.map(toRuleDto) };
  }

  async update(userId: string, input: UpdateAvailabilityDto): Promise<WeeklyAvailability> {
    const dto = updateAvailabilitySchema.parse(input);
    const rows = await this.repo.replaceRules(userId, dto.timezone, dto.rules);
    return { timezone: dto.timezone, rules: rows.map(toRuleDto) };
  }
}

export const availabilityService = new AvailabilityService();
