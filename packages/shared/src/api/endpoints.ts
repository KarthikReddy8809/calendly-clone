/**
 * Single source of truth for API paths, shared by the server router and the
 * web client. Functions encode path params so callers never hand-build URLs.
 */
export const API_PREFIX = '/api/v1';

export const ENDPOINTS = {
  health: '/health',

  auth: {
    signup: '/auth/signup',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },

  events: {
    list: '/events',
    create: '/events',
    byId: (id: string) => `/events/${id}`,
    update: (id: string) => `/events/${id}`,
    remove: (id: string) => `/events/${id}`,
  },

  availability: {
    get: '/availability',
    update: '/availability',
  },

  meetings: {
    list: '/meetings',
    cancel: (id: string) => `/meetings/${id}/cancel`,
  },

  integrations: {
    google: '/integrations/google',
    googleConnect: '/integrations/google/connect',
  },

  invitations: {
    send: '/invitations',
  },

  booking: {
    getEventType: (username: string, slug: string) => `/book/${username}/${slug}`,
    getSlots: (username: string, slug: string) => `/book/${username}/${slug}/slots`,
    create: (username: string, slug: string) => `/book/${username}/${slug}`,
  },
} as const;
