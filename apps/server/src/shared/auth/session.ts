import type { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';
import { isProduction, jwtSecret } from '../../config/env.js';

export const SESSION_COOKIE = 'calendly_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
/**
 * Every token we sign names its purpose in `aud`, so a token minted for one
 * job (say an OAuth `state`) can never be replayed as a login session.
 */
const SESSION_AUDIENCE = 'calendly:session';

/**
 * In production the web app and API live on different origins (Vercel), so
 * the cookie must be SameSite=None + Secure to travel on cross-site XHR.
 * Locally the Vite proxy makes it same-origin, so Lax is enough.
 */
function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}

export function setSessionCookie(res: Response, userId: string): void {
  const token = jwt.sign({}, jwtSecret, {
    subject: userId,
    audience: SESSION_AUDIENCE,
    expiresIn: SESSION_TTL_SECONDS,
    algorithm: 'HS256',
  });
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_TTL_SECONDS * 1000 });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}

/** Returns the user id from a valid session token, or null when invalid/expired. */
export function readSessionUserId(token: unknown): string | null {
  if (typeof token !== 'string' || token.length === 0) return null;
  try {
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
      audience: SESSION_AUDIENCE,
    });
    return typeof payload === 'object' && typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Short-lived signed token for one purpose, e.g. the Google OAuth `state`. */
export function signPurposeToken(userId: string, audience: string, ttlSeconds: number): string {
  return jwt.sign({}, jwtSecret, {
    subject: userId,
    audience,
    expiresIn: ttlSeconds,
    algorithm: 'HS256',
  });
}

/** Returns the user id if the token is valid for this purpose, else null. */
export function readPurposeToken(token: unknown, audience: string): string | null {
  if (typeof token !== 'string' || token.length === 0) return null;
  try {
    const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'], audience });
    return typeof payload === 'object' && typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}
