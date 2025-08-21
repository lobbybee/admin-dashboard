// Delete hotel flow configuration
export const useDeleteHotelFlowConfiguration = () => {
  const { API } = useAPI();

  const {
    mutateAsync: deleteHotelFlowConfiguration,
    status,
    error,
     isLoading,
  } = useMutation({
    mutation: async (id: number) => {
      const response = await API(`/context/admin/hotel-configurations/${id}/`, {
        method: 'DELETE'
      });
      return response;
    }
  });

  return {
    deleteHotelFlowConfiguration,
    status,
    error,
    isLoading,
  };
};
