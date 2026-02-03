import { computed, ref, watch } from 'vue';
import { useAPI } from './useAPI';
import { useAPIHelper } from './useAPIHelper';
import type { Hotel } from '~/types/hotel';

/**
 * Provides hotel search functionality that can be reused across components
 */
export const useHotelSearch = () => {
  const { API } = useAPI();
  const { getPaginatedResults } = useAPIHelper();

  // Search state
  const searchQuery = ref('');
  const filteredHotels = ref<Hotel[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Search hotels based on query
  const searchHotels = async (query: string) => {
    if (!query) {
      filteredHotels.value = [];
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await API('/admin/hotels/', {
        params: {
          search: query,
          page: 1,
          page_size: 20
        }
      });

      filteredHotels.value = getPaginatedResults<Hotel>(response);
    } catch (err: any) {
      error.value = err.message || 'Failed to search hotels';
      filteredHotels.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  // Debounced search to prevent too many API calls
  const debounceTimer = ref<NodeJS.Timeout | null>(null);

  const debouncedSearchHotels = (query: string) => {
    searchQuery.value = query;

    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
    }

    debounceTimer.value = setTimeout(() => {
      searchHotels(query);
    }, 300);
  };

  // Cleanup timer on unmount
  const cleanup = () => {
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
    }
  };

  return {
    // State
    searchQuery,
    filteredHotels,
    isLoading,
    error,

    // Methods
    searchHotels: debouncedSearchHotels,
    clearResults: () => {
      filteredHotels.value = [];
      searchQuery.value = '';
    },
    cleanup
  };
};