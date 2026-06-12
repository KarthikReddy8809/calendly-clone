import {
  createEventTypeSchema,
  updateEventTypeSchema,
  type CreateEventTypeDto,
  type EventType,
  type UpdateEventTypeDto,
} from '@calendly/shared';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import { eventTypeRepository, EventTypeRepository } from './event-type.repository.js';
import { toEventTypeDto } from './event-type.mapper.js';

/**
 * Business logic for event types. Validation has already run at the route
 * boundary; this layer enforces invariants (unique slug per host) and maps to
 * DTOs. It depends on the repository abstraction, not Prisma directly.
 */
export class EventTypeService {
  constructor(private readonly repo: EventTypeRepository = eventTypeRepository) {}

  async list(userId: string): Promise<EventType[]> {
    const rows = await this.repo.findManyByUser(userId);
    return rows.map(toEventTypeDto);
  }

  async getById(userId: string, id: string): Promise<EventType> {
    const row = await this.repo.findById(id, userId);
    if (!row) throw new NotFoundError('Event type not found');
    return toEventTypeDto(row);
  }

  async create(userId: string, input: CreateEventTypeDto): Promise<EventType> {
    const dto = createEventTypeSchema.parse(input);

    const existing = await this.repo.findBySlug(userId, dto.slug);
    if (existing) throw new ConflictError('That booking link is already in use');

    const row = await this.repo.create({
      userId,
      title: dto.title,
      slug: dto.slug,
      description: dto.description ?? null,
      durationMinutes: dto.durationMinutes,
      color: dto.color,
      locationType: dto.locationType,
      locationValue: dto.locationValue ?? null,
      isActive: dto.isActive,
    });

    return toEventTypeDto(row);
  }

  async update(userId: string, id: string, input: UpdateEventTypeDto): Promise<EventType> {
    const dto = updateEventTypeSchema.parse(input);
    await this.getById(userId, id);

    if (dto.slug) {
      const clash = await this.repo.findBySlug(userId, dto.slug);
      if (clash && clash.id !== id) {
        throw new ConflictError('That booking link is already in use');
      }
    }

    const row = await this.repo.update(id, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.slug !== undefined && { slug: dto.slug }),
      ...(dto.description !== undefined && { description: dto.description ?? null }),
      ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
      ...(dto.color !== undefined && { color: dto.color }),
      ...(dto.locationType !== undefined && { locationType: dto.locationType }),
      ...(dto.locationValue !== undefined && { locationValue: dto.locationValue ?? null }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });

    return toEventTypeDto(row);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getById(userId, id);
    await this.repo.softDelete(id);
  }
}

export const eventTypeService = new EventTypeService();
