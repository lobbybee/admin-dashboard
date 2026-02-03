export interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'manager' | 'receptionist' | 'department_staff' | 'platform_admin' | 'platform_staff';
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_active_hotel_user?: boolean;
  is_verified: boolean;
  hotel_id?: string | null; // Mapped from 'hotel' in backend
  hotel?: string;
  created_by?: string;
  department?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  user_type: 'manager' | 'receptionist' | 'department_staff' | 'platform_admin' | 'platform_staff';
  phone_number?: string;
  department?: Record<string, any>;
  hotel?: string;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  user_type?: 'manager' | 'receptionist' | 'department_staff' | 'platform_admin' | 'platform_staff';
  phone_number?: string;
  is_active?: boolean;
}