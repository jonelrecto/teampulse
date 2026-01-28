import { useSupabaseClient } from '#imports';

export const useApi = () => {
  const config = useRuntimeConfig();
  const supabase = useSupabaseClient();

  const apiCall = async <T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${config.public.apiUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  return {
    get: <T>(endpoint: string) => apiCall<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body?: any) =>
      apiCall<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    patch: <T>(endpoint: string, body?: any) =>
      apiCall<T>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    delete: <T>(endpoint: string) => apiCall<T>(endpoint, { method: 'DELETE' }),
  };
};
