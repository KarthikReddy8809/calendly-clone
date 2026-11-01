import { Router } from 'express';
import { ENDPOINTS } from '@calendly/shared';
import { healthRoutes } from './modules/health/health.routes.js';
import { eventTypeRoutes } from './modules/event-types/event-type.routes.js';
import { availabilityRoutes } from './modules/availability/availability.routes.js';
import { meetingRoutes } from './modules/meetings/meeting.routes.js';
import { bookingRoutes } from './modules/bookings/booking.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { integrationRoutes } from './modules/integrations/integration.routes.js';
import { invitationRoutes } from './modules/invitations/invitation.routes.js';
import { requireAuth } from './shared/middleware/require-auth.js';

/**
 * Central API router. Each feature module exposes its own Router; this file is
 * the only place that knows the full route map, keeping modules decoupled.
 */
export const apiRouter: Router = Router();

apiRouter.use(ENDPOINTS.health, healthRoutes);
apiRouter.use('/auth', authRoutes);
// Mixed: the OAuth callback is public (state-protected), the rest require a host.
apiRouter.use('/integrations', integrationRoutes);

// Public: invitees book without an account.
apiRouter.use('/book', bookingRoutes);

// Host-only: everything below acts on the logged-in host's own data.
apiRouter.use('/events', requireAuth, eventTypeRoutes);
apiRouter.use('/availability', requireAuth, availabilityRoutes);
apiRouter.use('/meetings', requireAuth, meetingRoutes);
apiRouter.use('/invitations', requireAuth, invitationRoutes);
