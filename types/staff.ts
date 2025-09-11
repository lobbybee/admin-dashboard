export interface StaffUser {
  id: number;
  username: string;
  email: string;
  user_type: 'platform_admin' | 'platform_staff';
  phone_number?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StaffUserCreateRequest {
  username: string;
  email: string;
  password: string;
  user_type: 'platform_admin' | 'platform_staff';
  phone_number?: string;
}

export interface StaffUserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  user_type?: 'platform_admin' | 'platform_staff';
  phone_number?: string;
}

export interface PaginatedStaffUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: StaffUser[];
}

export interface ListStaffUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
}