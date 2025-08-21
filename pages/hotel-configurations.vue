<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">

      <!-- Header -->
      <header class="animate-fade-slide-down">
        <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <i class="pi pi-building text-primary-500"></i> Hotel Flow Configurations
        </h1>
        <p class="text-gray-500">Assign and manage active flows for each hotel.</p>
      </header>

      <Card class="shadow-lg">
        <template #content>
          <!-- Hotel Selector -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-700 mb-3">Select a Hotel</h2>
            <Dropdown 
              v-model="selectedHotel"
              :options="hotels || []"
              optionLabel="name"
              placeholder="Select a Hotel"
              class="w-full md:w-1/2"
              :loading="isLoadingHotels"
              showClear
            />
          </div>

          <!-- Flow Template List -->
          <div v-if="selectedHotel">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Manage Flow Templates for {{ selectedHotel.name }}</h2>
            
            <div v-if="isLoadingTemplates || isLoadingConfigs" class="flex justify-center p-8">
              <ProgressSpinner />
            </div>
            <div v-else-if="errorTemplates || errorConfigs" class="p-4 bg-red-100 text-red-700 rounded">
              Error loading data.
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="template in combinedTemplates" 
                :key="template.id"
                class="p-4 border rounded-lg flex justify-between items-center transition-all"
                :class="{ 'bg-green-50 border-green-200': template.is_active }"
              >
                <div>
                  <h3 class="font-bold text-lg">{{ template.name }}</h3>
                  <p class="text-gray-600">{{ template.description }}</p>
                  <p class="text-sm text-gray-500 mt-1">Trigger: <span class="font-mono bg-gray-200 px-2 py-1 rounded">{{ template.trigger_keyword }}</span></p>
                </div>
                <InputSwitch 
                  :modelValue="template.is_active"
                  @update:modelValue="(isActive) => handleFlowToggle(template, isActive)"
                />
              </div>
            </div>
          </div>

          <!-- Prompt to select a hotel -->
          <div v-else class="text-center py-12">
            <i class="pi pi-building text-5xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-700">Please select a hotel</h3>
            <p class="text-gray-500">Choose a hotel to configure its available conversational flows.</p>
          </div>
        </template>
      </Card>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';
import ProgressSpinner from 'primevue/progressspinner';

import { useFetchHotels } from '~/composables/useHotel';
import { useFetchFlowTemplates } from '~/composables/useFlowTemplate';
import { useFetchHotelFlowConfigurations, useCreateHotelFlowConfiguration, useDeleteHotelFlowConfiguration } from '~/composables/useHotelFlowConfiguration';

const toast = useToast();

// --- Data Fetching ---
const { hotels, isLoading: isLoadingHotels } = useFetchHotels();
const { data: flowTemplates, isLoading: isLoadingTemplates, error: errorTemplates } = useFetchFlowTemplates();

const selectedHotel = ref<any>(null);
const selectedHotelId = computed(() => selectedHotel.value?.id);

const { data: hotelConfigs, isLoading: isLoadingConfigs, error: errorConfigs, refetch: refetchConfigs } = useFetchHotelFlowConfigurations(selectedHotelId);
const { mutateAsync: createConfig } = useCreateHotelFlowConfiguration();
const { mutateAsync: deleteConfig } = useDeleteHotelFlowConfiguration();

// Refetch configs when a new hotel is selected
watch(selectedHotel, () => {
  refetchConfigs();
});

// --- Computed Properties ---
const combinedTemplates = computed(() => {
  if (!flowTemplates.value) return [];
  
  return flowTemplates.value.map(template => {
    const config = hotelConfigs.value?.find(c => c.flow_template === template.id);
    return {
      ...template,
      is_active: !!config,
      configuration_id: config?.id
    };
  });
});

// --- Methods ---
const handleFlowToggle = async (template: any, isActive: boolean) => {
  if (!selectedHotel.value) return;

  try {
    if (isActive) {
      // Activate: Create a new configuration
      await createConfig({
        hotel: selectedHotel.value.id,
        flow_template: template.id,
        is_active: true
      });
      toast.add({ severity: 'success', summary: 'Activated', detail: `${template.name} activated for ${selectedHotel.value.name}`, life: 3000 });
    } else {
      // Deactivate: Delete the existing configuration
      if (template.configuration_id) {
        await deleteConfig(template.configuration_id);
        toast.add({ severity: 'warn', summary: 'Deactivated', detail: `${template.name} deactivated for ${selectedHotel.value.name}`, life: 3000 });
      }
    }
    // Refresh the configurations for the current hotel
    refetchConfigs();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update flow configuration', life: 5000 });
    // Re-fetch to revert optimistic UI changes if needed, though modelValue should handle it
    refetchConfigs(); 
  }
};

</script>

<style scoped>
.animate-fade-slide-down {
  animation: fade-slide-down 0.6s ease forwards;
}
@keyframes fade-slide-down {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
