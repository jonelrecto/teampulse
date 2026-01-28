import { useApi } from './useApi';
import { useCheckInStore } from '~/stores/checkIn';
import type { CheckInDraft } from '@team-pulse/shared';

export const useCheckIn = () => {
  const api = useApi();
  const checkInStore = useCheckInStore();

  const saveDraft = (teamId: string, draft: Partial<CheckInDraft>) => {
    const fullDraft: CheckInDraft = {
      teamId,
      yesterday: draft.yesterday || '',
      today: draft.today || '',
      blockers: draft.blockers || '',
      mood: draft.mood,
      energy: draft.energy,
      timestamp: Date.now(),
    };
    checkInStore.setDraft(fullDraft);
    localStorage.setItem(`checkIn-draft-${teamId}`, JSON.stringify(fullDraft));
  };

  const loadDraft = (teamId: string): CheckInDraft | null => {
    const stored = localStorage.getItem(`checkIn-draft-${teamId}`);
    if (stored) {
      try {
        const draft = JSON.parse(stored);
        // Check if draft is less than 24 hours old
        if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
          return draft;
        }
      } catch (e) {
        // Invalid draft
      }
    }
    return null;
  };

  const clearDraft = (teamId: string) => {
    checkInStore.clearDraft();
    localStorage.removeItem(`checkIn-draft-${teamId}`);
  };

  const createCheckIn = async (
    teamId: string,
    data: {
      yesterday: string;
      today: string;
      blockers?: string;
      mood: string;
      energy: number;
    },
  ) => {
    const checkIn = await api.post<any>(`/teams/${teamId}/check-ins`, data);
    clearDraft(teamId);
    return checkIn;
  };

  const fetchCheckIns = async (
    teamId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      userIds?: string[];
      hasBlockers?: boolean;
      page?: number;
      limit?: number;
    },
  ) => {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.userIds) params.append('userIds', filters.userIds.join(','));
    if (filters?.hasBlockers !== undefined)
      params.append('hasBlockers', filters.hasBlockers.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const result = await api.get<any>(
      `/teams/${teamId}/check-ins${params.toString() ? `?${params.toString()}` : ''}`,
    );
    return result;
  };

  const fetchTodayCheckIn = async (teamId: string) => {
    const checkIn = await api.get<any>(`/teams/${teamId}/check-ins/mine/today`);
    return checkIn;
  };

  const updateCheckIn = async (
    teamId: string,
    checkInId: string,
    data: {
      yesterday?: string;
      today?: string;
      blockers?: string;
      mood?: string;
      energy?: number;
    },
  ) => {
    const checkIn = await api.patch<any>(`/teams/${teamId}/check-ins/${checkInId}`, data);
    return checkIn;
  };

  const uploadAttachment = async (
    teamId: string,
    checkInId: string,
    file: File,
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const config = useRuntimeConfig();
    const supabase = useSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${config.public.apiUrl}/teams/${teamId}/check-ins/${checkInId}/attachments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  };

  return {
    draft: computed(() => checkInStore.draft),
    saveDraft,
    loadDraft,
    clearDraft,
    createCheckIn,
    fetchCheckIns,
    fetchTodayCheckIn,
    updateCheckIn,
    uploadAttachment,
  };
};
