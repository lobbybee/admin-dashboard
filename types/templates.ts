export interface Template {
  id: number;
  name: string;
  template_type: string;
  text_content: string;
  media_file: string | null;
  media_filename: string | null;
  media_url: string | null;
  is_customizable: boolean;
  is_active: boolean;
  variables: string[];
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateUpdateRequest {
  name?: string;
  text_content?: string;
  is_active?: boolean;
  variables?: string[];
  description?: string;
  media_file?: File;
}

export interface TemplateVariable {
  name: string;
  model: string;
  field: string;
  description: string;
}

export interface TemplateVariablesResponse {
  variables: TemplateVariable[];
  grouped_by_model: Record<string, TemplateVariable[]>;
  total_count: number;
}

export interface TemplatePreviewResponse {
  template_id: number;
  template_name: string;
  template_type: string;
  template_model: string;
  rendered_content: string;
  sample_data: Record<string, any>;
  media_url?: string;
  media_filename?: string;
}

export interface PaginatedTemplates {
  count: number;
  next: string | null;
  previous: string | null;
  results: Template[];
}

export interface ListTemplatesParams {
  page?: number;
  page_size?: number;
  search?: string;
  template_type?: string;
  is_active?: boolean;
}