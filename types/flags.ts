export interface Flag {
  id: number;
  global_note: string;
  flagged_by_police: boolean;
  source: string;
  flagged_by: string;
  flagged_date: string;
  hotel_name: string | null;
  internal_rating: number | null;
}

export interface FlagCreateRequest {
  guest_id: number;
  stay_id?: number | null;
  internal_reason?: string;
  global_note: string;
  flagged_by_police: boolean;
}

export interface FlagResetRequest {
  reset_reason: string;
}

export interface PaginatedFlags {
  count: number;
  next: string | null;
  previous: string | null;
  results: Flag[];
}

export interface ListFlagsParams {
  guest_id?: number;
  hotel_id?: number;
  active_only?: boolean;
  page?: number;
  page_size?: number;
}

export interface GuestFlagCheck {
  is_flagged: boolean;
  police_flagged: boolean;
  flags: Flag[];
}

export interface GuestStay {
  id: number;
  hotel_name: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  internal_rating: number;
}

export interface GuestSearchResult {
  id: number;
  full_name: string;
  whatsapp_number: string;
  email: string;
  register_number: string;
  date_of_birth: string;
  nationality: string;
  status: string;
  loyalty_points: number;
  first_contact_date: string;
  last_activity: string;
  recent_stays: GuestStay[];
  active_flags_count: number;
}

export interface GuestSearchResponse {
  query: string;
  count: number;
  results: GuestSearchResult[];
}

export interface SearchGuestsParams {
  q: string;
  limit?: number;
}