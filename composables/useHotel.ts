import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';
import { useRoute } from 'vue-router';
import type { PaginatedHotels, ListHotelsParams, Hotel, VerifyHotelData, RejectHotelData, CreateHotelData } from '~/types/hotel';

// --------------------------------------------------------------------------------
// Composables
// --------------------------------------------------------------------------------

/**
 * Retrieves a paginated and filterable list of all hotels in the system
 * based on the current route query parameters.
 */
export const useFetchHotels = () => {
  const route = useRoute();
  const { API } = useAPI();

  // Create a computed that will react to route changes
  const queryParams = computed(() => {
    // Create a stable query key by filtering out undefined/null values
    const queryKeyParams: Record<string, any> = {};
    if (route.query.page) queryKeyParams.page = route.query.page;
    if (route.query.page_size) queryKeyParams.page_size = route.query.page_size;
    if (route.query.status) queryKeyParams.status = route.query.status;
    if (route.query.search) queryKeyParams.search = route.query.search;

    return queryKeyParams;
  });

  return useQuery<PaginatedHotels>({
    key: () => ['hotels', queryParams.value], // Use a function to make the key reactive
    query: async () => {
      const query = route.query;

      const params: ListHotelsParams = {
        page: Number(query.page) || undefined,
        page_size: Number(query.page_size) || undefined,
        status: (query.status as string) || undefined,
        city: (query.city as string) || undefined,
        country: (query.country as string) || undefined,
        is_verified: query.is_verified ? query.is_verified === 'true' : undefined,
        is_active: query.is_active ? query.is_active === 'true' : undefined,
        search: (query.search as string) || undefined,
      };

      // Clean up undefined values
      Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);

      return API('/admin/hotels/', {
        params,
      });
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Retrieves the full details for a single hotel by its ID.
 */
export const useFetchHotelById = (id: Ref<string | undefined>) => {
  const { API } = useAPI();

  return useQuery<Hotel>({
    key: ['hotels', id],
    query: async () => {
      if (!id.value) return null;
      return API(`/admin/hotels/${id.value}/`);
    },
    enabled: computed(() => !!id.value)
  });
};

/**
 * Marks a hotel as verified and allows for adding verification notes.
 */
export const useVerifyHotel = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async ({ id, data }: { id: string; data: VerifyHotelData }) => {
      return API(`/admin/hotels/${id}/verify/`, {
        method: 'POST',
        body: data
      });
    }
  });

  return {
    verifyHotel: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Rejects a hotel with a mandatory reason.
 */
export const useRejectHotel = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async ({ id, data }: { id: string; data: RejectHotelData }) => {
      return API(`/admin/hotels/${id}/reject/`, {
        method: 'POST',
        body: data
      });
    }
  });

  return {
    rejectHotel: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};


/**
 * Toggles the is_active status of a hotel.
 */
export const useToggleHotelActive = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async (id: string) => {
      return API(`/admin/hotels/${id}/toggle-active/`, {
        method: 'POST'
      });
    }
  });

  return {
    toggleHotelActive: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Creates a new hotel and a corresponding hotel_admin user.
 */
export const useCreateHotel = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async (data: CreateHotelData) => {
      return API(`/admin/create-hotel/`, {
        method: 'POST',
        body: data
      });
    }
  });

  return {
    createHotel: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};
