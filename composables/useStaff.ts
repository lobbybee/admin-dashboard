import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';
import { useRoute } from 'vue-router';
import type { PaginatedStaffUsers, ListStaffUsersParams, StaffUser, StaffUserCreateRequest, StaffUserUpdateRequest } from '~/types/staff';

// --------------------------------------------------------------------------------
// Composables
// --------------------------------------------------------------------------------

/**
 * Retrieves a paginated and filterable list of all platform users
 * based on the current route query parameters.
 */
export const useFetchStaffUsers = () => {
  const route = useRoute();
  const { API } = useAPI();

  // Create a computed that will react to route changes
  const queryParams = computed(() => {
    // Create a stable query key by filtering out undefined/null values
    const queryKeyParams: Record<string, any> = {};
    if (route.query.page) queryKeyParams.page = route.query.page;
    if (route.query.page_size) queryKeyParams.page_size = route.query.page_size;
    if (route.query.search) queryKeyParams.search = route.query.search;
    
    return queryKeyParams;
  });

  return useQuery<PaginatedStaffUsers>({
    key: () => ['staff-users', queryParams.value], // Use a function to make the key reactive
    query: async () => {
      const query = route.query;
      
      const params: ListStaffUsersParams = {
        page: Number(query.page) || undefined,
        page_size: Number(query.page_size) || undefined,
        search: (query.search as string) || undefined,
      };

      // Clean up undefined values
      Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);

      return API('/admin/users/', {
        params,
      });
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Retrieves the full details for a single staff user by its ID.
 */
export const useFetchStaffUserById = (id: Ref<string | undefined>) => {
  const { API } = useAPI();

  return useQuery<StaffUser>({
    key: ['staff-users', id],
    query: async () => {
      if (!id.value) return null;
      return API(`/admin/users/${id.value}/`);
    },
    enabled: computed(() => !!id.value)
  });
};

/**
 * Creates a new platform user (admin or staff).
 */
export const useCreateStaffUser = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async (data: StaffUserCreateRequest) => {
      return API('/admin/users/', {
        method: 'POST',
        body: data
      });
    }
  });

  return {
    createStaffUser: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Updates an existing platform user.
 */
export const useUpdateStaffUser = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async ({ id, data }: { id: string; data: StaffUserUpdateRequest }) => {
      return API(`/admin/users/${id}/`, {
        method: 'PATCH',
        body: data
      });
    }
  });

  return {
    updateStaffUser: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Deletes a platform user.
 */
export const useDeleteStaffUser = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async (id: string) => {
      return API(`/admin/users/${id}/`, {
        method: 'DELETE'
      });
    }
  });

  return {
    deleteStaffUser: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};