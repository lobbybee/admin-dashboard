import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';


export interface FlowStepTemplate {
  id: number;
  flow_template: number;
  step_name: string;
  message_type: string;
  message_template: string;
  order: number;
  options: Record<string, string> | null;
  conditional_next_steps: Record<string, number> | null;
  next_step_template: number | null;
  allowed_flow_categories: string[] | null;
}

export interface FlowStepTemplateCreateData {
  flow_template: number;
  step_name: string;
  message_type: string;
  message_template: string;
  order: number;
  options?: Record<string, string> | null;
  conditional_next_steps?: Record<string, number> | null;
  next_step_template?: number | null;
  allowed_flow_categories?: string[] | null;
}

export interface FlowStepTemplateUpdateData {
    flow_template?: number;
    step_name?: string;
    message_type?: string;
    message_template?: string;
    order?: number;
    options?: Record<string, string> | null;
    conditional_next_steps?: Record<string, number> | null;
    next_step_template?: number | null;
    allowed_flow_categories?: string[] | null;
}

// Fetch all flow step templates
export const useFetchFlowStepTemplates = (flowTemplateId: Ref<number | undefined>) => {
  const { API } = useAPI();
  const {
    data: flowStepTemplates,
    isLoading,
    error,
    refetch
  } = useQuery({
    key:  ['flow-step-templates', flowTemplateId.value],
    query: async () => {
      console.log('Fetching flow step templates...', flowTemplateId.value);
      if (!flowTemplateId.value) return [];
      const response = await API('/context/admin/flow-step-templates/', {
        params: { flow_template: flowTemplateId.value }
      });
      return response.results;
    },
    enabled: computed(() => !!flowTemplateId.value)
  });

  return {
    flowStepTemplates,
    isLoading,
    error,
    refetch
  };
};

// Fetch a single flow step template by ID
export const useFetchFlowStepTemplateById = (id: Ref<number | undefined>) => {
  const { API } = useAPI();
  const {
    data: flowStepTemplate,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['flow-step-templates', id.value],
    query: async () => {
      if (!id.value) return null;
      const response = await API(`/context/admin/flow-step-templates/${id.value}/`);
      return response;
    },
    enabled: computed(() => !!id.value)
  });

  return {
    flowStepTemplate,
    isLoading,
    error,
    refetch
  };
};

// Create flow step template
export const useCreateFlowStepTemplate = () => {
  const { API } = useAPI();

  const {
    mutateAsync,
    status,
    error,
    isLoading,
  } = useMutation({
    mutation: async (data: FlowStepTemplateCreateData) => {
      const response = await API('/context/admin/flow-step-templates/', {
        method: 'POST',
        body: data
      });
      return response;
    }
  });

  return {
    mutateAsync,
    status,
    error,
    isLoading,
  };
};

// Update flow step template
export const useUpdateFlowStepTemplate = () => {
  const { API } = useAPI();

  const {
    mutateAsync,
    status,
    error,
    isLoading,
  } = useMutation({
    mutation: async ({ id, data }: { id: number | string; data: FlowStepTemplateUpdateData }) => {
      const response = await API(`/context/admin/flow-step-templates/${id}/`, {
        method: 'PATCH',
        body: data
      });
      return response;
    }
  });

  return {
    mutateAsync,
    status,
    error,
    isLoading,
  };
};

// Delete flow step template
export const useDeleteFlowStepTemplate = () => {
  const { API } = useAPI();

  const {
    mutateAsync,
    status,
    error,
    isLoading,
  } = useMutation({
    mutation: async (id: number | string) => {
      const response = await API(`/context/admin/flow-step-templates/${id}/`, {
        method: 'DELETE'
      });
      return response;
    }
  });

  return {
    mutateAsync,
    status,
    error,
    isLoading,
  };
};
