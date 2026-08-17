export const DEFAULT_PAGE_SIZE = 20;
// Capped at 100 to match StandardizedPagination.max_page_size — anything larger
// is silently clamped server-side and desyncs the "showing x to y" label.
export const VALID_PAGE_SIZES = [20, 50, 100];

export const DOCUMENT_TYPE_OPTIONS = [
  { label: 'Aadhar ID', value: 'aadhar_id' },
  { label: 'Driving License', value: 'driving_license' },
  { label: 'National ID', value: 'national_id' },
  { label: 'Voter ID', value: 'voter_id' },
  { label: 'Other', value: 'other' },
] as const;

export type DocumentType = typeof DOCUMENT_TYPE_OPTIONS[number]['value'];

// Mirrors flag_system.services.MIN_DOCUMENT_LENGTH — shorter numbers build an
// empty document_key server-side and the flag is rejected.
export const MIN_DOCUMENT_LENGTH = 6;

/** Python twin: flag_system.services.normalize_document_number */
export const normalizeDocumentNumber = (value: string) =>
  (value || '').toUpperCase().replace(/[ \-/]/g, '');

export const formatDocumentType = (type: string) =>
  DOCUMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ||
  (type || '').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

export interface FlagIdentityDocument {
  id: number;
  document_type: string;
  document_number: string;
  file_url: string | null;
  file_back_url: string | null;
}

export interface Flag {
  id: number;
  global_note: string;
  /** Platform staff only — absent from hotel-staff responses. */
  internal_reason?: string;
  flagged_by_police: boolean;
  is_active?: boolean;
  source: string;
  flagged_by: string;
  flagged_date: string;
  hotel_name: string | null;
  internal_rating: number | null;
  guest_id: number | null;
  guest_name: string | null;
  /** Set when the flag targets a bare ID with no guest record yet. */
  flagged_document: { document_type: string; document_number: string } | null;
  /** Platform staff only — the ID images behind the flag. */
  documents?: FlagIdentityDocument[];
}

export interface FlagCreateRequest {
  guest_id?: number;
  stay_id?: number | null;
  document_type?: DocumentType;
  document_number?: string;
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
  active_only?: boolean;
  page?: number;
  page_size?: number;
}

export interface GuestFlagCheck {
  is_flagged: boolean;
  police_flagged: boolean;
  /** True when the flag came from another guest record sharing this ID document. */
  matched_by_document: boolean;
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
