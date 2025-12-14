import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';
import { useRoute } from 'vue-router';
import type { 
  PaginatedTemplates, 
  ListTemplatesParams, 
  Template, 
  TemplateUpdateRequest, 
  TemplateVariablesResponse, 
  TemplatePreviewResponse 
} from '~/types/templates';

// --------------------------------------------------------------------------------
// Composables
// --------------------------------------------------------------------------------

/**
 * Retrieves a paginated and filterable list of all global templates
 * based on the current route query parameters.
 */
export const useFetchTemplates = () => {
  const route = useRoute();
  const { API } = useAPI();

  // Create a computed that will react to route changes
  const queryParams = computed(() => {
    // Create a stable query key by filtering out undefined/null values
    const queryKeyParams: Record<string, any> = {};
    if (route.query.page) queryKeyParams.page = route.query.page;
    if (route.query.page_size) queryKeyParams.page_size = route.query.page_size;
    if (route.query.search) queryKeyParams.search = route.query.search;
    if (route.query.template_type) queryKeyParams.template_type = route.query.template_type;
    if (route.query.is_active !== undefined) queryKeyParams.is_active = route.query.is_active;
    
    return queryKeyParams;
  });

  return useQuery<PaginatedTemplates>({
    key: () => ['templates', queryParams.value], // Use a function to make the key reactive
    query: async () => {
      const query = route.query;
      
      const params: ListTemplatesParams = {
        page: Number(query.page) || undefined,
        page_size: Number(query.page_size) || undefined,
        search: (query.search as string) || undefined,
        template_type: (query.template_type as string) || undefined,
        is_active: query.is_active !== undefined ? query.is_active === 'true' : undefined,
      };

      // Clean up undefined values
      Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null) && delete params[key]);

      return API('/chat/templates/', {
        params,
      });
    },
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Retrieves the full details for a single template by its ID.
 */
export const useFetchTemplateById = (id: Ref<string | undefined>) => {
  const { API } = useAPI();

  return useQuery<Template>({
    key: ['templates', id],
    query: async () => {
      if (!id.value) return null;
      return API(`/chat/templates/${id.value}/`);
    },
    enabled: computed(() => !!id.value)
  });
};

/**
 * Updates an existing global template.
 * Supports both JSON (text-only) and multipart/form-data (with media file) requests.
 */
export const useUpdateTemplate = () => {
  const { API } = useAPI();

  const mutationResult = useMutation({
    mutation: async ({ id, data, hasMedia }: { id: string; data: TemplateUpdateRequest; hasMedia?: boolean }) => {
      const config: any = {
        method: 'PATCH',
      };

      if (hasMedia && data.media_file) {
        // Use multipart/form-data for media upload
        const formData = new FormData();
        
        // Add all data fields to formData
        if (data.name !== undefined) formData.append('name', data.name);
        if (data.text_content !== undefined) formData.append('text_content', data.text_content);
        if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.variables !== undefined) formData.append('variables', JSON.stringify(data.variables));
        if (data.media_file !== undefined) formData.append('media_file', data.media_file);

        config.body = formData;
        // Don't set Content-Type header, let browser set it with boundary
      } else {
        // Use JSON for text-only updates
        config.body = data;
      }

      return API(`/chat/templates/${id}/`, config);
    }
  });

  return {
    updateTemplate: mutationResult.mutateAsync,
    status: mutationResult.status,
    error: mutationResult.error,
    isLoading: mutationResult.isLoading,
  };
};

/**
 * Retrieves all available template variables that can be used in templates.
 */
export const useFetchTemplateVariables = () => {
  const { API } = useAPI();

  return useQuery<TemplateVariablesResponse>({
    key: ['template-variables'],
    query: async () => {
      return API('/chat/templates/variables/');
    },
  });
};

/**
 * Previews a template with sample data to see how it will be rendered.
 */
export const useFetchTemplatePreview = (id: Ref<string | undefined>) => {
  const { API } = useAPI();

  return useQuery<TemplatePreviewResponse>({
    key: ['template-preview', id],
    query: async () => {
      if (!id.value) return null;
      return API(`/chat/templates/${id.value}/preview/`);
    },
    enabled: computed(() => !!id.value)
  });
};

/**
 * Manually fetch template preview (useful for refetching after updates)
 */
export const useManualTemplatePreview = () => {
  const { API } = useAPI();

  return {
    fetchPreview: async (id: string): Promise<TemplatePreviewResponse> => {
      return API(`/chat/templates/${id}/preview/`);
    }
  };
};