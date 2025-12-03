export interface HotelDocument {
  id: string;
  document_type: string;
  document_file: string; // This is a URL
  uploaded_at: string;
  hotel: string;
}

export interface HotelAdmin {
  id: number;
  username: string;
  email: string;
  user_type: string;
  phone_number: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  status: 'pending' | 'verified' | 'suspended' | 'rejected';
  is_verified: boolean;
  is_active: boolean;
  is_demo: boolean;
  verification_notes: string;
  registration_date: string;
  verified_at: string | null;
  updated_at: string;
  admin: HotelAdmin;
  documents: HotelDocument[];
}

export interface PaginatedHotels {
  count: number;
  next: string | null;
  previous: string | null;
  results: Hotel[];
}

export interface ListHotelsParams {
  page?: number;
  page_size?: number;
  status?: string;
  city?: string;
  country?: string;
  is_verified?: boolean;
  is_active?: boolean;
  search?: string;
}

export interface VerifyHotelData {
  notes?: string;
}

export interface RejectHotelData {
  notes: string;
}

export interface CreateHotelData {
  hotel_name: string;
  email: string;
  username: string;
  password: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
}

export interface UpdateHotelData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  google_review_link?: string;
  latitude?: number;
  longitude?: number;
  qr_code_url?: string;
  check_in_time?: string;
  time_zone?: string;
}

export interface UpdateHotelDocumentData {
  document_type: 'license' | 'registration' | 'other';
  document_file?: File;
}
