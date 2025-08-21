import { useAPI } from './useAPI';

// Fetch all hotels
export const useFetchHotels = () => {
  const { API } = useAPI();
  const { data, isLoading, error, refetch } = useQuery({
    key: ['hotels'],
    // NOTE: Assuming an endpoint to fetch all hotels exists at '/hotels/'
    query: async () => {
      const response = await API('/hotels/');
      return response.results || response; 
    }
  });

  return {
    hotels: data,
    isLoading,
    error,
    refetch
  };
};