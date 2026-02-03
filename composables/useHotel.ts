import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';
import { useAPIHelper } from './useAPIHelper';
import { useRoute } from 'vue-router';
import type { PaginatedHotels, ListHotelsParams, Hotel, VerifyHotelData, RejectHotelData, CreateHotelData, UpdateHotelData, UpdateHotelDocumentData } from '~/types/hotel';

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
  const { getPaginatedResponse } = useAPIHelper();

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

      const response = await API('/admin/hotels/', {
        params,
      });
      return getPaginatedResponse<PaginatedHotels['results'][0]>(response);
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Retrieves the full details for a single hotel by its ID.
 */
export const useFetchHotelById = (id: Ref<string | undefined>) => {
  const { API } = useAPI();
  const { getData } = useAPIHelper();

  return useQuery<Hotel>({
    key: ['hotel', id],
    query: async () => {
      if (!id.value) return null;
      const response = await API(`/admin/hotels/${id.value}/`);
      return getData<Hotel>(response);
    },
    enabled: computed(() => !!id.value)
  });
};

/**
 * Marks a hotel as verified and allows for adding verification notes.
 */
export const useVerifyHotel = () => {
  const { API } = useAPI();
  const { getData } = useAPIHelper();

  const mutationResult = useMutation({
    mutation: async ({ id, data }: { id: string; data: VerifyHotelData }) => {
      const response = await API(`/admin/hotels/${id}/verify/`, {
        method: 'POST',
        body: data
      });
      return getData<any>(response);
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
  const { getData } = useAPIHelper();

  const mutationResult = useMutation({
    mutation: async ({ id, data }: { id: string; data: RejectHotelData }) => {
      const response = await API(`/admin/hotels/${id}/reject/`, {
        method: 'POST',
        body: data
      });
      return getData<any>(response);
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
  const { getData } = useAPIHelper();

  const mutationResult = useMutation({
    mutation: async (id: string) => {
      const response = await API(`/admin/hotels/${id}/toggle-active/`, {
        method: 'POST'
      });
      return getData<any>(response);
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
  const { getData } = useAPIHelper();

  const mutationResult = useMutation({
    mutation: async (data: CreateHotelData) => {
      const response = await API('/admin/create-hotel/', {
        method: 'POST',
        body: data
      });
      return getData<any>(response);
    }
  });

  return {
    createHotel: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Updates hotel basic information and settings.
 */
export const useUpdateHotel = () => {
  const { API } = useAPI();
  const { getData } = useAPIHelper();

  const mutationResult = useMutation({
    mutation: async ({ id, data }: { id: string; data: UpdateHotelData }) => {
      const response = await API(`/admin/hotels/${id}/`, {
        method: 'PATCH',
        body: data
      });
      return getData<any>(response);
    }
  });

  return {
    updateHotel: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Updates hotel verification documents.
 * If documentId is provided, updates that specific document.
 * If documentId is not provided, uses update-by-type endpoint (creates new or updates existing by type).
 */
export const useUpdateHotelDocument = () => {
  const { API } = useAPI();
  const { getData } = useAPIHelper();

  const mutationResult = useMutation({
    mutation: async ({ hotelId, documentId, data }: { hotelId: string; documentId?: string; data: UpdateHotelDocumentData }) => {
      // If documentId is provided, update specific document
      if (documentId) {
        if (data.document_file) {
          const formData = new FormData();
          formData.append('document_type', data.document_type);
          formData.append('document_file', data.document_file);

          const response = await API(`/admin/hotels/${hotelId}/documents/${documentId}/`, {
            method: 'PATCH',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          return getData<any>(response);
        } else {
          const response = await API(`/admin/hotels/${hotelId}/documents/${documentId}/`, {
            method: 'PATCH',
            body: {
              document_type: data.document_type
            }
          });
          return getData<any>(response);
        }
      }
      // If no documentId, use update-by-type endpoint (creates new or updates existing)
      else {
        if (data.document_file) {
          const formData = new FormData();
          formData.append('document_type', data.document_type);
          formData.append('document_file', data.document_file);

          const response = await API(`/admin/hotels/${hotelId}/documents/update-by-type/`, {
            method: 'PATCH',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          return getData<any>(response);
        } else {
          const response = await API(`/admin/hotels/${hotelId}/documents/update-by-type/`, {
            method: 'PATCH',
            body: {
              document_type: data.document_type
            }
          });
          return getData<any>(response);
        }
      }
    }
  });

  return {
    updateHotelDocument: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};
