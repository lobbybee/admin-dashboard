import { computed } from 'vue';
import { useAPI } from './useAPI';

export interface FlowTemplate {
  id: number;
  name: string;
  description: string;
  trigger_keyword: string;
}

export interface FlowTemplateCreateData {
  name: string;
  description: string;
  trigger_keyword: string;
}

export interface FlowTemplateUpdateData {
  name?: string;
  description?: string;
  trigger_keyword?: string;
}

// Fetch all flow templates
export const useFetchFlowTemplates = () => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['flow-templates'],
    query: async () => {
      const response = await API('/context/admin/flow-templates/');
      return response.results;
    }
  });

  return {
    flowTemplates: data,
    isLoading,
    error,
    refetch
  };
};

// Fetch a single flow template by ID
export const useFetchFlowTemplateById = (id: number) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['flow-templates', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/context/admin/flow-templates/${id}/`);
      return response;
    },
    enabled: computed(() => !!id)
  });

  return {
    flowTemplate: data,
    isLoading,
    error,
    refetch
  };
};

// Create flow template
export const useCreateFlowTemplate = () => {
  const { API } = useAPI();

  const {
    mutateAsync: createFlowTemplate,
    status,
    error,
     isLoading,
  } = useMutation({
    mutation: async (data: FlowTemplateCreateData) => {
      const response = await API('/context/admin/flow-templates/', {
        method: 'POST',
        body: data
      });
      return response;
    }
  });

  return {
    createFlowTemplate,
    status,
    error,
    isLoading,
  };
};

// Update flow template
export const useUpdateFlowTemplate = () => {
  const { API } = useAPI();

  const {
    mutateAsync: updateFlowTemplate,
    status,
    error,
     isLoading,
  } = useMutation({
    mutation: async ({ id, data }: { id: number; data: FlowTemplateUpdateData }) => {
      const response = await API(`/context/admin/flow-templates/${id}/`, {
        method: 'PATCH',
        body: data
      });
      return response;
    }
  });

  return {
    updateFlowTemplate,
    status,
    error,
    isLoading,
  };
};

// Delete flow template
export const useDeleteFlowTemplate = () => {
  const { API } = useAPI();

  const {
    mutateAsync: deleteFlowTemplate,
    status,
    error,
     isLoading,
  } = useMutation({
    mutation: async (id: number) => {
      const response = await API(`/context/admin/flow-templates/${id}/`, {
        method: 'DELETE'
      });
      return response;
    }
  });

  return {
    deleteFlowTemplate,
    status,
    error,
    isLoading,
  };
};
