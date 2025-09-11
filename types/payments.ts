export interface SubscriptionPlan {
  id: string;
  name: string;
  plan_type: 'trial' | 'standard';
  price: number;
  duration_days: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  hotel: string;
  plan: string;
  amount: number;
  transaction_type: 'subscription' | 'manual';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface HotelSubscription {
  id: string;
  hotel: string;
  plan: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedSubscriptionPlans {
  count: number;
  next: string | null;
  previous: string | null;
  results: SubscriptionPlan[];
}

export interface PaginatedTransactions {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transaction[];
}

export interface PaginatedHotelSubscriptions {
  count: number;
  next: string | null;
  previous: string | null;
  results: HotelSubscription[];
}

export interface ListSubscriptionPlansParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface ListTransactionsParams {
  page?: number;
  page_size?: number;
  search?: string;
  hotel?: string;
  plan?: string;
  transaction_type?: string;
  status?: string;
}

export interface ListHotelSubscriptionsParams {
  page?: number;
  page_size?: number;
  search?: string;
  hotel?: string;
  plan?: string;
}

export interface SubscriptionPlanCreateRequest {
  name: string;
  plan_type: 'trial' | 'standard';
  price: number;
  duration_days: number;
  description: string;
  is_active: boolean;
}

export interface SubscriptionPlanUpdateRequest {
  name?: string;
  plan_type?: 'trial' | 'standard';
  price?: number;
  duration_days?: number;
  description?: string;
  is_active?: boolean;
}

export interface TransactionCreateRequest {
  hotel: string;
  plan: string;
  amount: number;
  transaction_type: 'manual';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_id: string;
  notes: string;
}

export interface TransactionUpdateRequest {
  hotel?: string;
  plan?: string;
  amount?: number;
  transaction_type?: 'subscription' | 'manual';
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_id?: string;
  notes?: string;
}

export interface HotelSubscriptionCreateRequest {
  hotel: string;
  plan: string;
}

export interface HotelSubscriptionExtendRequest {
  hotel: string;
  days?: number;
}

export interface HotelSubscriptionUpdateRequest {
  hotel?: string;
  plan?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}