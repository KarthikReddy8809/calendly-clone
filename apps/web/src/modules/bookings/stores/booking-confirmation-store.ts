import { create } from 'zustand';
import type { BookingConfirmation } from '@calendly/shared';

interface BookingConfirmationState {
  confirmation: BookingConfirmation | null;
  setConfirmation: (confirmation: BookingConfirmation) => void;
  clear: () => void;
}

/**
 * Holds the just-created booking so the success page can render its details
 * without an extra round-trip. Cleared when leaving the success screen.
 */
export const useBookingConfirmationStore = create<BookingConfirmationState>((set) => ({
  confirmation: null,
  setConfirmation: (confirmation) => set({ confirmation }),
  clear: () => set({ confirmation: null }),
}));
