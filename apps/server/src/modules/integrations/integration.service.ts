import type { User } from '@prisma/client';
import {
  ERROR_CODES,
  type GoogleConnectResult,
  type GoogleIntegrationStatus,
} from '@calendly/shared';
import { logger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/app-error.js';
import { openSecret, sealSecret } from '../../shared/crypto/secret-box.js';
import { readPurposeToken, signPurposeToken } from '../../shared/auth/session.js';
import {
  buildConsentUrl,
  createMeetEvent,
  deleteCalendarEvent,
  exchangeCode,
  GOOGLE_CALENDAR_SCOPE,
  googleErrorStatus,
  isGoogleConfigured,
  isRevokedGrant,
  revokeRefreshToken,
  type MeetEventInput,
} from './google.client.js';
import { integrationRepository, IntegrationRepository } from './integration.repository.js';

const STATE_AUDIENCE = 'calendly:google-connect';
const STATE_TTL_SECONDS = 10 * 60;

export type GoogleCallbackInput = {
  code?: string;
  state?: string;
  error?: string;
  /** The host logged in on the browser that Google redirected back. */
  sessionUserId: string | null;
};

function describeError(error: unknown) {
  return {
    status: googleErrorStatus(error),
    message: error instanceof Error ? error.message : String(error),
  };
}

export class IntegrationService {
  constructor(private readonly repo: IntegrationRepository = integrationRepository) {}

  async googleStatus(host: User): Promise<GoogleIntegrationStatus> {
    const connection = await this.repo.findGoogleByUser(host.id);
    return {
      configured: isGoogleConfigured(),
      connected: Boolean(connection),
      email: connection?.googleEmail ?? null,
    };
  }

  /** The Google consent URL for this host, with a signed, short-lived state. */
  googleConnectUrl(host: User): string {
    if (!isGoogleConfigured()) {
      throw new AppError(
        503,
        ERROR_CODES.INTEGRATION_UNAVAILABLE,
        'Google Calendar is not set up on the server yet.',
      );
    }
    return buildConsentUrl(signPurposeToken(host.id, STATE_AUDIENCE, STATE_TTL_SECONDS));
  }

  /**
   * Finishes the OAuth flow. Never throws: every outcome becomes a result code
   * the web app shows to the host.
   */
  async completeGoogleConnect(input: GoogleCallbackInput): Promise<GoogleConnectResult> {
    if (input.error) return 'denied';

    const stateUserId = readPurposeToken(input.state, STATE_AUDIENCE);
    if (!stateUserId || !input.code) return 'error';
    // The consent must finish in the same host's browser that started it.
    // Otherwise a host tricked into opening someone else's consent link would
    // attach their Google Calendar to the other person's account.
    if (input.sessionUserId !== stateUserId) return 'session_mismatch';

    try {
      const grant = await exchangeCode(input.code);
      if (!grant.scopes.includes(GOOGLE_CALENDAR_SCOPE)) {
        if (grant.refreshToken) await revokeRefreshToken(grant.refreshToken).catch(() => {});
        return 'missing_scope';
      }
      if (!grant.refreshToken || !grant.email) return 'error';

      await this.repo.upsertGoogle(stateUserId, grant.email, sealSecret(grant.refreshToken));
      logger.info('Google Calendar connected', { userId: stateUserId });
      return 'connected';
    } catch (error) {
      logger.warn('Google Calendar connect failed', {
        userId: stateUserId,
        ...describeError(error),
      });
      return 'error';
    }
  }

  async disconnectGoogle(host: User): Promise<void> {
    const connection = await this.repo.findGoogleByUser(host.id);
    if (!connection) return;
    await this.repo.deleteGoogle(host.id);

    const refreshToken = openSecret(connection.refreshToken);
    if (refreshToken) {
      await revokeRefreshToken(refreshToken).catch((error: unknown) => {
        logger.warn('Google token revoke failed', { userId: host.id, ...describeError(error) });
      });
    }
  }

  /**
   * Creates the host's calendar event with a Google Meet link. Never throws:
   * returns null when the host has not connected Google or Google fails, so
   * the booking itself always goes through.
   */
  async createMeetForBooking(
    hostId: string,
    input: MeetEventInput,
  ): Promise<{ eventId: string; meetUrl: string | null } | null> {
    const refreshToken = await this.usableRefreshToken(hostId);
    if (!refreshToken) return null;

    try {
      return await createMeetEvent(refreshToken, input);
    } catch (error) {
      await this.handleGoogleFailure(hostId, 'create', error);
      return null;
    }
  }

  /** Removes the calendar event of a cancelled meeting. Never throws. */
  async deleteMeetEvent(hostId: string, eventId: string): Promise<void> {
    const refreshToken = await this.usableRefreshToken(hostId);
    if (!refreshToken) return;

    try {
      await deleteCalendarEvent(refreshToken, eventId);
    } catch (error) {
      await this.handleGoogleFailure(hostId, 'delete', error);
    }
  }

  private async usableRefreshToken(hostId: string): Promise<string | null> {
    if (!isGoogleConfigured()) return null;
    const connection = await this.repo.findGoogleByUser(hostId);
    if (!connection) return null;

    const refreshToken = openSecret(connection.refreshToken);
    if (!refreshToken) {
      // JWT_SECRET changed since the token was stored: the host must reconnect.
      logger.warn('Stored Google token unreadable; disconnecting', { userId: hostId });
      await this.repo.deleteGoogle(hostId);
    }
    return refreshToken;
  }

  private async handleGoogleFailure(hostId: string, action: string, error: unknown) {
    if (isRevokedGrant(error)) {
      // The host removed access in their Google account: show them as disconnected.
      logger.warn('Google access revoked; disconnecting', { userId: hostId, action });
      await this.repo.deleteGoogle(hostId);
      return;
    }
    logger.warn('Google Calendar call failed', { userId: hostId, action, ...describeError(error) });
  }
}

export const integrationService = new IntegrationService();
