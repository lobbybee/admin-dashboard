import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';

// --------------------------------------------------------------------------------
// Type Definitions
// --------------------------------------------------------------------------------

export interface StatPeriod {
  start_date: string;
  end_date: string;
}

export interface HotelStats {
  total: number;
  registered: number;
  verified: number;
  unverified: number;
  inactive: number;
  suspended: number;
  rejected: number;
}

export interface ConversationStats {
  total: number;
  active: number;
  closed: number;
  archived: number;
  fulfilled: number;
}

export interface RevenueStats {
  total_revenue: string;
  completed_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  active_subscriptions: number;
}

export interface OverviewResponse {
  period: StatPeriod;
  hotels: HotelStats;
  conversations: ConversationStats;
  revenue: RevenueStats;
}

export interface HotelSummary {
  total: number;
  verified: number;
  unverified: number;
  inactive: number;
  suspended: number;
  rejected: number;
}

export interface HotelData {
  id: string;
  name: string;
  email: string;
  status: string;
  is_verified: boolean;
  is_active: boolean;
  registration_date: string;
  city: string;
  country: string;
}

export interface HotelStatsResponse {
  period: StatPeriod;
  summary: HotelSummary;
  data: HotelData[];
}

export interface ConversationSummary {
  total: number;
  active: number;
  closed: number;
  archived: number;
  fulfilled: number;
}

export interface ConversationData {
  id: string;
  hotel_name: string;
  guest_name: string;
  status: string;
  conversation_type: string;
  created_at: string;
  last_message_at: string;
  message_count: number;
  is_fulfilled: boolean;
}

export interface ConversationStatsResponse {
  period: StatPeriod;
  summary: ConversationSummary;
  data: ConversationData[];
}

export interface PaymentSummary {
  total_revenue: string;
  completed_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  active_subscriptions: number;
}

export interface PaymentData {
  id: string;
  hotel_name: string;
  plan_name: string;
  amount: string;
  status: string;
  transaction_type: string;
  created_at: string;
}

export interface PaymentStatsResponse {
  period: StatPeriod;
  summary: PaymentSummary;
  data: PaymentData[];
}

export interface StatParams {
  start_date?: string;
  end_date?: string;
}

// --------------------------------------------------------------------------------
// Composables
// --------------------------------------------------------------------------------

/**
 * Retrieves overview statistics across all major categories.
 */
export const useFetchOverviewStats = (params?: Ref<StatParams>) => {
  const { API } = useAPI();

  return useQuery<OverviewResponse>({
    key: () => ['stats', 'overview', params?.value],
    query: async () => {
      const queryParams = params?.value || {};
      
      // Clean up undefined values
      Object.keys(queryParams).forEach(key => 
        (queryParams[key] === undefined || queryParams[key] === null) && delete queryParams[key]
      );

      return API('/admin_stat/overview/', {
        params: queryParams,
      });
    },
  });
};

/**
 * Retrieves detailed hotel statistics with individual hotel data.
 */
export const useFetchHotelStats = (params?: Ref<StatParams>) => {
  const { API } = useAPI();

  return useQuery<HotelStatsResponse>({
    key: () => ['stats', 'hotels', params?.value],
    query: async () => {
      const queryParams = params?.value || {};
      
      // Clean up undefined values
      Object.keys(queryParams).forEach(key => 
        (queryParams[key] === undefined || queryParams[key] === null) && delete queryParams[key]
      );

      return API('/admin_stat/hotels/', {
        params: queryParams,
      });
    },
  });
};

/**
 * Retrieves detailed conversation statistics with individual conversation data.
 */
export const useFetchConversationStats = (params?: Ref<StatParams>) => {
  const { API } = useAPI();

  return useQuery<ConversationStatsResponse>({
    key: () => ['stats', 'conversations', params?.value],
    query: async () => {
      const queryParams = params?.value || {};
      
      // Clean up undefined values
      Object.keys(queryParams).forEach(key => 
        (queryParams[key] === undefined || queryParams[key] === null) && delete queryParams[key]
      );

      return API('/admin_stat/conversations/', {
        params: queryParams,
      });
    },
  });
};

/**
 * Retrieves detailed payment and revenue statistics with individual transaction data.
 */
export const useFetchPaymentStats = (params?: Ref<StatParams>) => {
  const { API } = useAPI();

  return useQuery<PaymentStatsResponse>({
    key: () => ['stats', 'payments', params?.value],
    query: async () => {
      const queryParams = params?.value || {};
      
      // Clean up undefined values
      Object.keys(queryParams).forEach(key => 
        (queryParams[key] === undefined || queryParams[key] === null) && delete queryParams[key]
      );

      return API('/admin_stat/payments/', {
        params: queryParams,
      });
    },
  });
};