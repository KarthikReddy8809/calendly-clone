import { create } from 'zustand';
import type { EventType } from '@calendly/shared';

/** Calendly meeting "kinds" surfaced in the Create dropdown. */
export type EventKind =
  | 'one_on_one'
  | 'group'
  | 'round_robin'
  | 'collective'
  | 'one_off'
  | 'meeting_poll';

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  one_on_one: 'One-on-One',
  group: 'Group',
  round_robin: 'Round Robin',
  collective: 'Collective',
  one_off: 'One-off meeting',
  meeting_poll: 'Meeting Poll',
};

interface EventEditorState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  kind: EventKind;
  editing: EventType | null;
  openCreate: (kind: EventKind) => void;
  openEdit: (eventType: EventType) => void;
  close: () => void;
}

/**
 * Global editor drawer state so any "Create" button (sidebar or page header)
 * can open the same right-side drawer, mirroring Calendly's UX.
 */
export const useEventEditorStore = create<EventEditorState>((set) => ({
  isOpen: false,
  mode: 'create',
  kind: 'one_on_one',
  editing: null,
  openCreate: (kind) => set({ isOpen: true, mode: 'create', kind, editing: null }),
  openEdit: (eventType) => set({ isOpen: true, mode: 'edit', kind: 'one_on_one', editing: eventType }),
  close: () => set({ isOpen: false }),
}));
