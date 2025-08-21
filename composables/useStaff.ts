import { computed, ref } from 'vue';
import { useAPI } from './useAPI';
import type { User } from '~/types';

export interface StaffCreateData {
  username: string;
  email: string;
  password: string;
  user_type: 'manager' | 'receptionist' | 'department_staff';
  phone_number?: string;
}

export interface StaffUpdateData {
  username?: string;
  email?: string;
  password?: string;
  user_type?: 'manager' | 'receptionist' | 'department_staff';
  phone_number?: string;
  is_active?: boolean;
}

// Fetch all staff members
export const useFetchStaff = () => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['staff'],
    query: async () => {
      const response = await API('/user/users/');
      return response.results || response; // Return results array if it exists, otherwise return the whole response
    }
  });

  return {
    staff: data,
    isLoading,
    error,
    refetch
  };
};

// Fetch a single staff member by ID
export const useFetchStaffById = (id: string | number) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['staff', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/user/users/${id}/`);
      return response; // Assuming ofetch returns data directly for single item
    },
    enabled: computed(() => !!id)
  });

  return {
    staff: data,
    isLoading,
    error,
    refetch
  };
};

// Create initial staff by hotel admin
export const useCreateInitialStaff = () => {
  const { API } = useAPI();

  const {
    mutateAsync: createInitialStaff,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (data: StaffCreateData) => {
      const response = await API('/user/hotel/staff/create/', {
        method: 'POST',
        body: data
      });
      return response;
    }
  });

  return {
    createInitialStaff,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Create staff member (CRUD)
export const useCreateStaff = () => {
  const { API } = useAPI();

  const {
    mutateAsync: createStaff,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (data: StaffCreateData) => {
      const response = await API('/user/hotel/staff/create/', {
        method: 'POST',
        body: data
      });
      return response;
    }
  });

  return {
    createStaff,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Update staff member
export const useUpdateStaff = () => {
  const { API } = useAPI();

  const {
    mutateAsync: updateStaff,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: StaffUpdateData }) => {
      const response = await API(`/user/users/${id}/`, {
        method: 'PATCH',
        body: data
      });
      return response;
    }
  });

  return {
    updateStaff,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Delete staff member
export const useDeleteStaff = () => {
  const { API } = useAPI();

  const {
    mutateAsync: deleteStaff,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (id: string | number) => {
      const response = await API(`/user/users/${id}/`, {
        method: 'DELETE'
      });
      return response;
    }
  });

  return {
    deleteStaff,
    status,
    error,
    isLoading,
    asyncStatus
  };
};
