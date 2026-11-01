import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { env } from '../../config/env.js';

/**
 * Thin wrapper over Google's OAuth and Calendar REST APIs. No business rules
 * here: the service decides when to call, and what to do when a call fails.
 */

export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const SCOPES = ['openid', 'email', GOOGLE_CALENDAR_SCOPE];
const CALENDAR_EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
/** Google calls get a deadline so a slow Google never hangs a booking request. */
const GOOGLE_TIMEOUT_MS = 10_000;

export function isGoogleConfigured(): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI);
}

function oauthClient(refreshToken?: string): OAuth2Client {
  const client = new OAuth2Client({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
  });
  if (refreshToken) client.setCredentials({ refresh_token: refreshToken });
  return client;
}

/** The Google consent screen URL. `prompt=consent` makes Google return a refresh token. */
export function buildConsentUrl(state: string): string {
  return oauthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: true,
    scope: SCOPES,
    state,
  });
}

export type GoogleGrant = { refreshToken: string | null; email: string | null; scopes: string[] };

/** Trades the one-time `code` from the callback for tokens and the account email. */
export async function exchangeCode(code: string): Promise<GoogleGrant> {
  const client = oauthClient();
  const { tokens } = await client.getToken(code);

  let email: string | null = null;
  if (tokens.id_token) {
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    email = ticket.getPayload()?.email ?? null;
  }

  return {
    refreshToken: tokens.refresh_token ?? null,
    email,
    scopes: (tokens.scope ?? '').split(' ').filter(Boolean),
  };
}

/** Best-effort: tells Google to forget the grant when a host disconnects. */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await oauthClient().revokeToken(refreshToken);
}

const createdEventSchema = z.object({
  id: z.string(),
  hangoutLink: z.string().url().optional(),
  conferenceData: z
    .object({
      entryPoints: z.array(z.object({ entryPointType: z.string(), uri: z.string() })).optional(),
    })
    .optional(),
});

export type MeetEventInput = {
  /** Our meeting id: Google uses it to make conference creation idempotent. */
  requestId: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  timeZone: string;
  attendee: { email: string; name: string };
};

/**
 * Creates an event on the host's primary calendar with a new Google Meet.
 * `sendUpdates=none`: our own emails carry the link, so Google does not send
 * a second invitation.
 */
export async function createMeetEvent(
  refreshToken: string,
  input: MeetEventInput,
): Promise<{ eventId: string; meetUrl: string | null }> {
  const res = await oauthClient(refreshToken).request<unknown>({
    url: CALENDAR_EVENTS_URL,
    method: 'POST',
    params: { conferenceDataVersion: 1, sendUpdates: 'none' },
    timeout: GOOGLE_TIMEOUT_MS,
    data: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.start.toISOString(), timeZone: input.timeZone },
      end: { dateTime: input.end.toISOString(), timeZone: input.timeZone },
      attendees: [{ email: input.attendee.email, displayName: input.attendee.name }],
      conferenceData: {
        createRequest: {
          requestId: input.requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  const event = createdEventSchema.parse(res.data);
  const videoEntry = event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video');
  const meetUrl = event.hangoutLink ?? videoEntry?.uri ?? null;
  return { eventId: event.id, meetUrl: meetUrl?.startsWith('https://') ? meetUrl : null };
}

/** Deletes the host's calendar event. A 404 or 410 means it is already gone. */
export async function deleteCalendarEvent(refreshToken: string, eventId: string): Promise<void> {
  try {
    await oauthClient(refreshToken).request({
      url: `${CALENDAR_EVENTS_URL}/${encodeURIComponent(eventId)}`,
      method: 'DELETE',
      params: { sendUpdates: 'none' },
      timeout: GOOGLE_TIMEOUT_MS,
    });
  } catch (error) {
    const status = googleErrorStatus(error);
    if (status === 404 || status === 410) return;
    throw error;
  }
}

/** HTTP status of a failed Google call, if there was one. */
export function googleErrorStatus(error: unknown): number | undefined {
  const status = (error as { status?: unknown; response?: { status?: unknown } })?.response?.status;
  return typeof status === 'number' ? status : undefined;
}

/** True when the refresh token was revoked or expired: the host must reconnect. */
export function isRevokedGrant(error: unknown): boolean {
  const data = (error as { response?: { data?: { error?: unknown } } })?.response?.data;
  return data?.error === 'invalid_grant';
}
