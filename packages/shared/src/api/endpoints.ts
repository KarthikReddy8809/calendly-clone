/**
 * Single source of truth for API paths, shared by the server router and the
 * web client. Functions encode path params so callers never hand-build URLs.
 */
export const API_PREFIX = '/api/v1';

export const ENDPOINTS = {
  health: '/health',

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

  booking: {
    getEventType: (slug: string) => `/book/${slug}`,
    getSlots: (slug: string) => `/book/${slug}/slots`,
    create: (slug: string) => `/book/${slug}`,
  },
} as const;
