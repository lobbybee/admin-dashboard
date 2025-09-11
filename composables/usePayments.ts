import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';
import { useRoute } from 'vue-router';
import type {
  PaginatedSubscriptionPlans,
  ListSubscriptionPlansParams,
  SubscriptionPlan,
  SubscriptionPlanCreateRequest,
  SubscriptionPlanUpdateRequest,
  PaginatedTransactions,
  ListTransactionsParams,
  Transaction,
  TransactionCreateRequest,
  TransactionUpdateRequest,
  PaginatedHotelSubscriptions,
  ListHotelSubscriptionsParams,
  HotelSubscription,
  HotelSubscriptionCreateRequest,
  HotelSubscriptionExtendRequest,
  HotelSubscriptionUpdateRequest
} from '~/types/payments';

// --------------------------------------------------------------------------------
// Composables - Subscription Plans
// --------------------------------------------------------------------------------

/**
 * Retrieves a paginated and filterable list of all subscription plans
 * based on the current route query parameters.
 */
export const useFetchSubscriptionPlans = () => {
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

  return useQuery<PaginatedSubscriptionPlans>({
    key: () => ['subscription-plans', queryParams.value], // Use a function to make the key reactive
    query: async () => {
      const query = route.query;

      const params: ListSubscriptionPlansParams = {
        page: Number(query.page) || undefined,
        page_size: Number(query.page_size) || undefined,
        search: (query.search as string) || undefined,
      };

      // Clean up undefined values
      Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);

      return API('/plans/', {
        params,
      });
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Retrieves the full details for a single subscription plan by its ID.
 */
export const useFetchSubscriptionPlanById = (id: Ref<string | undefined>) => {
  const { API } = useAPI();

  return useQuery<SubscriptionPlan>({
    key: ['subscription-plans', id],
    query: async () => {
      if (!id.value) return null;
      return API('/plans/${id.value}/');
    },
    enabled: computed(() => !!id.value)
  });
};

/**
 * Creates a new subscription plan.
 */
export const useCreateSubscriptionPlan = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async (data: SubscriptionPlanCreateRequest) => {
      return API('/plans/', {
        method: 'POST',
        body: data
      });
    }
  });

  return {
    createSubscriptionPlan: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Updates an existing subscription plan.
 */
export const useUpdateSubscriptionPlan = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async ({ id, data }: { id: string; data: SubscriptionPlanUpdateRequest }) => {
      return API('/plans/${id}/', {
        method: 'PATCH',
        body: data
      });
    }
  });

  return {
    updateSubscriptionPlan: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Deletes a subscription plan.
 */
export const useDeleteSubscriptionPlan = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async (id: string) => {
      return API('/plans/${id}/', {
        method: 'DELETE'
      });
    }
  });

  return {
    deleteSubscriptionPlan: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

// --------------------------------------------------------------------------------
// Composables - Transactions
// --------------------------------------------------------------------------------

/**
 * Retrieves a paginated and filterable list of all transactions
 * based on the current route query parameters.
 */
export const useFetchTransactions = () => {
  const route = useRoute();
  const { API } = useAPI();

  // Create a computed that will react to route changes
  const queryParams = computed(() => {
    // Create a stable query key by filtering out undefined/null values
    const queryKeyParams: Record<string, any> = {};
    if (route.query.page) queryKeyParams.page = route.query.page;
    if (route.query.page_size) queryKeyParams.page_size = route.query.page_size;
    if (route.query.search) queryKeyParams.search = route.query.search;
    if (route.query.hotel) queryKeyParams.hotel = route.query.hotel;
    if (route.query.plan) queryKeyParams.plan = route.query.plan;
    if (route.query.transaction_type) queryKeyParams.transaction_type = route.query.transaction_type;
    if (route.query.status) queryKeyParams.status = route.query.status;

    return queryKeyParams;
  });

  return useQuery<PaginatedTransactions>({
    key: () => ['transactions', queryParams.value], // Use a function to make the key reactive
    query: async () => {
      const query = route.query;

      const params: ListTransactionsParams = {
        page: Number(query.page) || undefined,
        page_size: Number(query.page_size) || undefined,
        search: (query.search as string) || undefined,
        hotel: (query.hotel as string) || undefined,
        plan: (query.plan as string) || undefined,
        transaction_type: (query.transaction_type as string) || undefined,
        status: (query.status as string) || undefined,
      };

      // Clean up undefined values
      Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);

      return API('/transactions/', {
        params,
      });
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Retrieves the full details for a single transaction by its ID.
 */
export const useFetchTransactionById = (id: Ref<string | undefined>) => {
  const { API } = useAPI();

  return useQuery<Transaction>({
    key: ['transactions', id],
    query: async () => {
      if (!id.value) return null;
      return API('/transactions/${id.value}/');
    },
    enabled: computed(() => !!id.value)
  });
};

/**
 * Creates a new transaction.
 */
export const useCreateTransaction = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async (data: TransactionCreateRequest) => {
      return API('/transactions/', {
        method: 'POST',
        body: data
      });
    }
  });

  return {
    createTransaction: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Updates an existing transaction.
 */
export const useUpdateTransaction = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async ({ id, data }: { id: string; data: TransactionUpdateRequest }) => {
      return API('/transactions/${id}/', {
        method: 'PATCH',
        body: data
      });
    }
  });

  return {
    updateTransaction: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Deletes a transaction.
 */
export const useDeleteTransaction = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async (id: string) => {
      return API('/transactions/${id}/', {
        method: 'DELETE'
      });
    }
  });

  return {
    deleteTransaction: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

// --------------------------------------------------------------------------------
// Composables - Hotel Subscriptions
// --------------------------------------------------------------------------------

/**
 * Retrieves a paginated and filterable list of all hotel subscriptions
 * based on the current route query parameters.
 */
export const useFetchHotelSubscriptions = () => {
  const route = useRoute();
  const { API } = useAPI();

  // Create a computed that will react to route changes
  const queryParams = computed(() => {
    // Create a stable query key by filtering out undefined/null values
    const queryKeyParams: Record<string, any> = {};
    if (route.query.page) queryKeyParams.page = route.query.page;
    if (route.query.page_size) queryKeyParams.page_size = route.query.page_size;
    if (route.query.search) queryKeyParams.search = route.query.search;
    if (route.query.hotel) queryKeyParams.hotel = route.query.hotel;
    if (route.query.plan) queryKeyParams.plan = route.query.plan;

    return queryKeyParams;
  });

  return useQuery<PaginatedHotelSubscriptions>({
    key: () => ['hotel-subscriptions', queryParams.value], // Use a function to make the key reactive
    query: async () => {
      const query = route.query;

      const params: ListHotelSubscriptionsParams = {
        page: Number(query.page) || undefined,
        page_size: Number(query.page_size) || undefined,
        search: (query.search as string) || undefined,
        hotel: (query.hotel as string) || undefined,
        plan: (query.plan as string) || undefined,
      };

      // Clean up undefined values
      Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);

      return API('/subscriptions/', {
        params,
      });
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Retrieves the full details for a single hotel subscription by its ID.
 */
export const useFetchHotelSubscriptionById = (id: Ref<string | undefined>) => {
  const { API } = useAPI();

  return useQuery<HotelSubscription>({
    key: ['hotel-subscriptions', id],
    query: async () => {
      if (!id.value) return null;
      return API('/subscriptions/${id.value}/');
    },
    enabled: computed(() => !!id.value)
  });
};

/**
 * Creates a new hotel subscription.
 */
export const useCreateHotelSubscription = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async (data: HotelSubscriptionCreateRequest) => {
      return API('/subscriptions/create_subscription/', {
        method: 'POST',
        body: data
      });
    }
  });

  return {
    createHotelSubscription: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Extends an existing hotel subscription.
 */
export const useExtendHotelSubscription = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async (data: HotelSubscriptionExtendRequest) => {
      return API('/subscriptions/extend_subscription/', {
        method: 'POST',
        body: data
      });
    }
  });

  return {
    extendHotelSubscription: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Updates an existing hotel subscription.
 */
export const useUpdateHotelSubscription = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async ({ id, data }: { id: string; data: HotelSubscriptionUpdateRequest }) => {
      return API('/subscriptions/${id}/', {
        method: 'PATCH',
        body: data
      });
    }
  });

  return {
    updateHotelSubscription: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Deletes a hotel subscription.
 */
export const useDeleteHotelSubscription = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async (id: string) => {
      return API('/subscriptions/${id}/', {
        method: 'DELETE'
      });
    }
  });

  return {
    deleteHotelSubscription: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};
