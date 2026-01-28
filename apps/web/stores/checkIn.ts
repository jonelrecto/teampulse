import { defineStore } from 'pinia';
import type { CheckInDraft } from '@team-pulse/shared';

export const useCheckInStore = defineStore('checkIn', {
  state: () => ({
    draft: null as CheckInDraft | null,
  }),

  actions: {
    setDraft(draft: CheckInDraft) {
      this.draft = draft;
    },

    clearDraft() {
      this.draft = null;
    },
  },
});
