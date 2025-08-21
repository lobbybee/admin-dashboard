import { computed } from 'vue';
import { useAPI } from './useAPI';

export interface HotelFlowConfiguration {
  id: number;
  hotel: string; // UUID
  flow_template: number;
  is_active: boolean;
  customization_data: Record<string, any>;
}

export interface HotelFlowConfigurationCreateData {
  hotel: string; // UUID
  flow_template: number;
  is_active: boolean;
}

// Fetch hotel flow configurations with optional hotel filter
export const useFetchHotelFlowConfigurations = (hotelId: any) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['hotel-configurations', hotelId],
    query: async () => {
      const params: Record<string, any> = {};
      if (hotelId) {
        params.hotel = hotelId;
      }
      
      const response = await API('/context/admin/hotel-configurations/', {
        params
      });
      return response.results || response;
    },
    enabled: computed(() => !!hotelId)
  });

  return {
    data,
    isLoading,
    error,
    refetch
  };
};

// Create hotel flow configuration
export const useCreateHotelFlowConfiguration = () => {
  const { API } = useAPI();

  const {
    mutateAsync: createHotelFlowConfiguration,
    status,
    error,
    isLoading,
  } = useMutation({
    mutation: async (data: HotelFlowConfigurationCreateData) => {
      const response = await API('/context/admin/hotel-configurations/', {
        method: 'POST',
        body: data
      });
      return response;
    }
  });

  return {
    createHotelFlowConfiguration,
    status,
    error,
    isLoading,
  };
};

// Delete hotel flow configuration
export const useDeleteHotelFlowConfiguration = () => {
  const { API } = useAPI();

  const {
    mutateAsync: deleteHotelFlowConfiguration,
    status,
    error,
    isLoading,
  } = useMutation({
    mutation: async (id: number) => {
      const response = await API(`/context/admin/hotel-configurations/${id}/`, {
        method: 'DELETE'
      });
      return response;
    }
  });

  return {
    deleteHotelFlowConfiguration,
    status,
    error,
    isLoading,
  };
};