import { ENDPOINTS } from '@calendly/shared';
import type { UpdateAvailabilityDto, WeeklyAvailability } from '@calendly/shared';
import { api } from '@/lib/api-client';

export const availabilityService = {
  get: () => api.get<WeeklyAvailability>(ENDPOINTS.availability.get),
  update: (payload: UpdateAvailabilityDto) =>
    api.put<WeeklyAvailability>(ENDPOINTS.availability.update, payload),
};
