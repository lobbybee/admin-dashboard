import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';
import { useAPIHelper } from './useAPIHelper';
import { useRoute } from 'vue-router';
import type { PaginatedFlags, ListFlagsParams, Flag, FlagCreateRequest, FlagResetRequest, GuestFlagCheck, GuestSearchResponse, SearchGuestsParams } from '~/types/flags';

// --------------------------------------------------------------------------------
// Composables
// --------------------------------------------------------------------------------

/**
 * Retrieves a paginated and filterable list of all guest flags
 * based on the current route query parameters.
 */
export const useFetchFlags = () => {
  const route = useRoute();
  const { API } = useAPI();
  const { getPaginatedResponse } = useAPIHelper();

  // Create a computed that will react to route changes
  const queryParams = computed(() => {
    // Create a stable query key by filtering out undefined/null values
    const queryKeyParams: Record<string, any> = {};
    if (route.query.page) queryKeyParams.page = route.query.page;
    if (route.query.page_size) queryKeyParams.page_size = route.query.page_size;
    if (route.query.guest_id) queryKeyParams.guest_id = route.query.guest_id;
    if (route.query.hotel_id) queryKeyParams.hotel_id = route.query.hotel_id;
    if (route.query.active_only !== undefined) queryKeyParams.active_only = route.query.active_only;

    return queryKeyParams;
  });

  return useQuery<PaginatedFlags>({
    key: () => ['flags', queryParams.value], // Use a function to make the key reactive
    query: async () => {
      const query = route.query;

      const params: ListFlagsParams = {
        page: Number(query.page) || undefined,
        page_size: Number(query.page_size) || undefined,
        guest_id: Number(query.guest_id) || undefined,
        hotel_id: Number(query.hotel_id) || undefined,
        active_only: query.active_only === 'true' ? true : query.active_only === 'false' ? false : undefined,
      };

      // Clean up undefined values
      Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);

      const response = await API('/flags/', {
        params,
      });
      return getPaginatedResponse<PaginatedFlags['results'][0]>(response);
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Retrieves the full details for a single flag by its ID.
 */
export const useFetchFlagById = (id: Ref<string | undefined>) => {
  const { API } = useAPI();
  const { getData } = useAPIHelper();

  return useQuery<Flag>({
    key: ['flags', id],
    query: async () => {
      if (!id.value) return null;
      const response = await API(`/flags/${id.value}/`);
      return getData<Flag>(response);
    },
    enabled: computed(() => !!id.value)
  });
};

/**
 * Checks if a guest has any active flags.
 */
export const useCheckGuestFlags = (guestId: Ref<number | undefined>) => {
  const { API } = useAPI();
  const { getData } = useAPIHelper();

  return useQuery<GuestFlagCheck>({
    key: ['guest-flags-check', guestId],
    query: async () => {
      if (!guestId.value) return null;
      const response = await API(`/admin/flags/check/${guestId.value}/`);
      return getData<GuestFlagCheck>(response);
    },
    enabled: computed(() => !!guestId.value)
  });
};

/**
 * Creates a new guest flag.
 */
export const useCreateFlag = () => {
  const { API } = useAPI();
  const { getData } = useAPIHelper();

  const mutationResult = useMutation({
    mutation: async (data: FlagCreateRequest) => {
      const response = await API('/flags/', {
        method: 'POST',
        body: data
      });
      return getData<any>(response);
    }
  });

  return {
    createFlag: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Resets (deactivates) an active flag.
 */
export const useResetFlag = () => {
  const { API } = useAPI();
  const { getData } = useAPIHelper();

  const mutationResult = useMutation({
    mutation: async ({ id, data }: { id: string; data: FlagResetRequest }) => {
      const response = await API(`/flags/${id}/reset/`, {
        method: 'POST',
        body: data
      });
      return getData<any>(response);
    }
  });

  return {
    resetFlag: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Searches guests globally by name, phone number, email, or registration number.
 */
export const useSearchGuests = (query: Ref<string | undefined>, limit: Ref<number | undefined> = undefined) => {
  const { API } = useAPI();
  const { getData } = useAPIHelper();

  return useQuery<GuestSearchResponse>({
    key: ['guest-search', query, limit],
    query: async () => {
      if (!query.value || query.value.trim() === '') return null;

      const params: SearchGuestsParams = {
        q: query.value.trim(),
        limit: limit?.value || undefined
      };

      // Clean up undefined values
      Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);

      const response = await API('/search-guests/', {
        params,
      });
      return getData<GuestSearchResponse>(response);
    },
    enabled: computed(() => !!query.value && query.value.trim() !== '')
  });
};
