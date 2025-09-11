<template>
  <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :header="`${isEdit ? 'Edit' : 'Add'} Hotel Subscription`" modal style="width: 50vw; max-width: 600px;">
    <div class="p-4">
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="hotel" class="block mb-2">Hotel *</label>
            <AutoComplete
              id="hotel"
              v-model="formData.hotel"
              :suggestions="filteredHotels"
              :loading="hotelsLoading"
              option-label="name"
              option-value="id"
              @complete="event => searchHotels(event.query)"
              @item-select="onHotelSelect"
              :disabled="isEdit"
              class="w-full"
              :class="{ 'p-invalid': errors.hotel }"
              forceSelection
            >
              <template #item="slotProps">
                <div>
                  <div class="font-bold">{{ slotProps.item.name }}</div>
                  <div class="text-sm text-gray-500">{{ slotProps.item.city }}, {{ slotProps.item.country }}</div>
                </div>
              </template>
            </AutoComplete>
            <div v-if="selectedHotelName" class="mt-1 text-sm text-gray-600">
              Selected: {{ selectedHotelName }}
            </div>
            <small v-if="errors.hotel" class="p-error">{{ errors.hotel }}</small>
          </div>
          
          <div>
            <label for="plan" class="block mb-2">Plan *</label>
            <Select
              id="plan"
              v-model="formData.plan"
              :options="filteredPlans"
              option-label="name"
              option-value="id"
              :disabled="isEdit"
              class="w-full"
              :class="{ 'p-invalid': errors.plan }"
            >
              <template #option="slotProps">
                <div>
                  <div class="font-bold">{{ slotProps.option.name }}</div>
                  <div class="text-sm text-gray-500">${{ parseFloat(slotProps.option.price).toFixed(2) }} - {{ slotProps.option.duration_days }} days</div>
                </div>
              </template>
            </Select>
            <div v-if="selectedPlanName" class="mt-1 text-sm text-gray-600">
              Selected: {{ selectedPlanName }}
            </div>
            <small v-if="errors.plan" class="p-error">{{ errors.plan }}</small>
          </div>
        </div>
        
        <div v-if="!isEdit" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="startDate" class="block mb-2">Start Date *</label>
            <Calendar
              id="startDate"
              v-model="formData.start_date"
              class="w-full"
              :class="{ 'p-invalid': errors.start_date }"
              date-format="yy-mm-dd"
              :show-icon="true"
            />
            <small v-if="errors.start_date" class="p-error">{{ errors.start_date }}</small>
          </div>
          
          <div>
            <label for="endDate" class="block mb-2">End Date *</label>
            <Calendar
              id="endDate"
              v-model="formData.end_date"
              class="w-full"
              :class="{ 'p-invalid': errors.end_date }"
              date-format="yy-mm-dd"
              :show-icon="true"
            />
            <small v-if="errors.end_date" class="p-error">{{ errors.end_date }}</small>
          </div>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="startDate" class="block mb-2">Start Date</label>
            <span>{{ formatDate(formData.start_date) }}</span>
          </div>
          
          <div>
            <label for="endDate" class="block mb-2">End Date</label>
            <span>{{ formatDate(formData.end_date) }}</span>
          </div>
        </div>
        
        <div>
          <div class="flex items-center">
            <Checkbox
              id="isActive"
              v-model="formData.is_active"
              :binary="true"
              class="mr-2"
            />
            <label for="isActive">Active Subscription</label>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="$emit('update:visible', false)" class="p-button-text" />
      <Button :label="isEdit ? 'Update' : 'Create'" icon="pi pi-check" @click="handleSubmit" :loading="loading" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import AutoComplete from 'primevue/autocomplete';
import Select from 'primevue/select';
import { useRoute } from 'vue-router';
import { useHotelSearch } from '~/composables/useHotelSearch';
import { useFetchSubscriptionPlans } from '~/composables/usePayments';
import type { HotelSubscription, HotelSubscriptionCreateRequest, HotelSubscriptionUpdateRequest, SubscriptionPlan } from '~/types/payments';
import type { Hotel } from '~/types/hotel';

const props = defineProps<{
  visible: boolean;
  subscription?: HotelSubscription | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: HotelSubscriptionCreateRequest | HotelSubscriptionUpdateRequest, isEdit: boolean, id?: string): void;
}>();

const isEdit = computed(() => !!props.subscription);

const formData = ref({
  hotel: '',
  plan: '',
  start_date: new Date(),
  end_date: new Date(new Date().setDate(new Date().getDate() + 30)),
  is_active: true
});

const errors = ref<Record<string, string>>({});

// Hotel search using the new composable
const { filteredHotels, isLoading: hotelsLoading, searchHotels, clearResults } = useHotelSearch();
const selectedHotelName = ref('');

const onHotelSelect = (event: { value: Hotel }) => {
  formData.value.hotel = event.value.id;
  selectedHotelName.value = event.value.name;
};

// Plan selection
const selectedPlanName = ref('');

const { data: plansData, isLoading: plansLoading } = useFetchSubscriptionPlans();

const filteredPlans = computed(() => {
  return plansData.value?.results || [];
});

// Watch for plan selection changes to update the selected plan name
watch(() => formData.value.plan, (newPlanId) => {
  if (plansData.value && newPlanId) {
    const plan = plansData.value.results.find(p => p.id === newPlanId);
    if (plan) {
      selectedPlanName.value = plan.name;
    } else {
      selectedPlanName.value = '';
    }
  } else {
    selectedPlanName.value = '';
  }
});

// Reset form when subscription changes
watch(() => props.subscription, (newSubscription) => {
  if (newSubscription) {
    formData.value = {
      hotel: newSubscription.hotel,
      plan: newSubscription.plan,
      start_date: new Date(newSubscription.start_date),
      end_date: new Date(newSubscription.end_date),
      is_active: newSubscription.is_active
    };
    
    // Set selected names for display
    if (filteredHotels.value) {
      const hotel = filteredHotels.value.find(h => h.id === newSubscription.hotel);
      if (hotel) selectedHotelName.value = hotel.name;
    }
    
    if (plansData.value) {
      const plan = plansData.value.results.find(p => p.id === newSubscription.plan);
      if (plan) selectedPlanName.value = plan.name;
    }
  } else {
    formData.value = {
      hotel: '',
      plan: '',
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 30)),
      is_active: true
    };
    selectedHotelName.value = '';
    selectedPlanName.value = '';
  }
  errors.value = {};
}, { immediate: true });

const validateForm = () => {
  errors.value = {};
  
  if (!formData.value.hotel) {
    errors.value.hotel = 'Hotel is required';
  }
  
  if (!formData.value.plan) {
    errors.value.plan = 'Plan is required';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validateForm()) return;
  
  if (isEdit.value && props.subscription) {
    const updateData: HotelSubscriptionUpdateRequest = {
      hotel: formData.value.hotel,
      plan: formData.value.plan,
      is_active: formData.value.is_active
    };
    
    emit('save', updateData, true, props.subscription.id);
  } else {
    const createData: HotelSubscriptionCreateRequest = {
      hotel: formData.value.hotel,
      plan: formData.value.plan
    };
    
    emit('save', createData, false);
  }
};

const formatDate = (date: Date | string) => {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }
  return date.toLocaleDateString();
};

// Cleanup the debounce timer when component is unmounted
onUnmounted(() => {
  clearResults();
});
</script>