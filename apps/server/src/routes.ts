import { Router } from 'express';
import { ENDPOINTS } from '@calendly/shared';
import { healthRoutes } from './modules/health/health.routes.js';
import { eventTypeRoutes } from './modules/event-types/event-type.routes.js';
import { availabilityRoutes } from './modules/availability/availability.routes.js';
import { meetingRoutes } from './modules/meetings/meeting.routes.js';
import { bookingRoutes } from './modules/bookings/booking.routes.js';

/**
 * Central API router. Each feature module exposes its own Router; this file is
 * the only place that knows the full route map, keeping modules decoupled.
 */
export const apiRouter: Router = Router();

apiRouter.use(ENDPOINTS.health, healthRoutes);
apiRouter.use('/events', eventTypeRoutes);
apiRouter.use('/availability', availabilityRoutes);
apiRouter.use('/meetings', meetingRoutes);
apiRouter.use('/book', bookingRoutes);
