import { computed } from 'vue';
import { useAPI } from './useAPI';

// Assuming FlowAction structure based on common patterns
export interface FlowAction {
  id: number;
  flow_step_template: number;
  name: string;
  action_type: string;
  config: Record<string, any>;
}

export interface FlowActionCreateData {
  flow_step_template: number;
  name: string;
  action_type: string;
  config: Record<string, any>;
}

export interface FlowActionUpdateData {
    flow_step_template?: number;
    name?: string;
    action_type?: string;
    config?: Record<string, any>;
}

// Fetch all flow actions
export const useFetchFlowActions = (flowStepTemplateId?: number) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['flow-actions', flowStepTemplateId],
    query: async () => {
      const response = await API('/context/admin/flow-actions/', {
        params: { flow_step_template: flowStepTemplateId }
      });
      return response;
    },
    enabled: computed(() => !!flowStepTemplateId.value)
  });

  return {
    flowActions: data,
    isLoading,
    error,
    refetch
  };
};

// Fetch a single flow action by ID
export const useFetchFlowActionById = (id: number) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['flow-actions', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/context/admin/flow-actions/${id}/`);
      return response;
    },
    enabled: computed(() => !!id)
  });

  return {
    flowAction: data,
    isLoading,
    error,
    refetch
  };
};

// Create flow action
export const useCreateFlowAction = () => {
  const { API } = useAPI();

  const {
    mutateAsync: createFlowAction,
    status,
    error,
     isLoading,
  } = useMutation({
    mutation: async (data: FlowActionCreateData) => {
      const response = await API('/context/admin/flow-actions/', {
        method: 'POST',
        body: data
      });
      return response;
    }
  });

  return {
    createFlowAction,
    status,
    error,
    isLoading,
  };
};

// Update flow action
export const useUpdateFlowAction = () => {
  const { API } = useAPI();

  const {
    mutateAsync: updateFlowAction,
    status,
    error,
     isLoading,
  } = useMutation({
    mutation: async ({ id, data }: { id: number; data: FlowActionUpdateData }) => {
      const response = await API(`/context/admin/flow-actions/${id}/`, {
        method: 'PATCH',
        body: data
      });
      return response;
    }
  });

  return {
    updateFlowAction,
    status,
    error,
    isLoading,
  };
};

// Delete flow action
export const useDeleteFlowAction = () => {
  const { API } = useAPI();

  const {
    mutateAsync: deleteFlowAction,
    status,
    error,
     isLoading,
  } = useMutation({
    mutation: async (id: number) => {
      const response = await API(`/context/admin/flow-actions/${id}/`, {
        method: 'DELETE'
      });
      return response;
    }
  });

  return {
    deleteFlowAction,
    status,
    error,
    isLoading,
  };
};
