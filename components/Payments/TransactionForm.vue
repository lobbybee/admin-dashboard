<template>
  <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :header="`${isEdit ? 'Edit' : 'Add'} Transaction`" modal style="width: 50vw; max-width: 600px;">
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
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="amount" class="block mb-2">Amount *</label>
            <InputNumber
              id="amount"
              v-model="formData.amount"
              mode="currency"
              currency="USD"
              locale="en-US"
              class="w-full"
              :class="{ 'p-invalid': errors.amount }"
            />
            <small v-if="errors.amount" class="p-error">{{ errors.amount }}</small>
          </div>
          
          <div>
            <label for="transactionType" class="block mb-2">Transaction Type *</label>
            <Select
              id="transactionType"
              v-model="formData.transaction_type"
              :options="transactionTypeOptions"
              option-label="label"
              option-value="value"
              class="w-full"
              :class="{ 'p-invalid': errors.transaction_type }"
            />
            <small v-if="errors.transaction_type" class="p-error">{{ errors.transaction_type }}</small>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="status" class="block mb-2">Status *</label>
            <Select
              id="status"
              v-model="formData.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              class="w-full"
              :class="{ 'p-invalid': errors.status }"
            />
            <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
          </div>
          
          <div>
            <label for="transactionId" class="block mb-2">Transaction ID</label>
            <InputText
              id="transactionId"
              v-model="formData.transaction_id"
              class="w-full"
            />
          </div>
        </div>
        
        <div>
          <label for="notes" class="block mb-2">Notes</label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            rows="3"
            class="w-full"
          />
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
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import AutoComplete from 'primevue/autocomplete';
import Select from 'primevue/select';
import { useRoute } from 'vue-router';
import { useHotelSearch } from '~/composables/useHotelSearch';
import { useFetchSubscriptionPlans } from '~/composables/usePayments';
import type { Transaction, TransactionCreateRequest, TransactionUpdateRequest, SubscriptionPlan } from '~/types/payments';
import type { Hotel } from '~/types/hotel';

const props = defineProps<{
  visible: boolean;
  transaction?: Transaction | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: TransactionCreateRequest | TransactionUpdateRequest, isEdit: boolean, id?: string): void;
}>();

const isEdit = computed(() => !!props.transaction);

const formData = ref({
  hotel: '',
  plan: '',
  amount: 0,
  transaction_type: 'manual',
  status: 'pending',
  transaction_id: '',
  notes: ''
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

const transactionTypeOptions = [
  { label: 'Subscription', value: 'subscription' },
  { label: 'Manual', value: 'manual' }
];

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' }
];

// Reset form when transaction changes
watch(() => props.transaction, (newTransaction) => {
  if (newTransaction) {
    formData.value = {
      hotel: newTransaction.hotel,
      plan: newTransaction.plan,
      amount: parseFloat(newTransaction.amount.toString()),
      transaction_type: newTransaction.transaction_type,
      status: newTransaction.status,
      transaction_id: newTransaction.transaction_id,
      notes: newTransaction.notes
    };
    
    // Set selected names for display
    if (filteredHotels.value) {
      const hotel = filteredHotels.value.find(h => h.id === newTransaction.hotel);
      if (hotel) selectedHotelName.value = hotel.name;
    }
    
    if (plansData.value) {
      const plan = plansData.value.results.find(p => p.id === newTransaction.plan);
      if (plan) selectedPlanName.value = plan.name;
    }
  } else {
    formData.value = {
      hotel: '',
      plan: '',
      amount: 0,
      transaction_type: 'manual',
      status: 'pending',
      transaction_id: '',
      notes: ''
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
  
  if (formData.value.amount <= 0) {
    errors.value.amount = 'Amount must be greater than 0';
  }
  
  if (!formData.value.transaction_type) {
    errors.value.transaction_type = 'Transaction type is required';
  }
  
  if (!formData.value.status) {
    errors.value.status = 'Status is required';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validateForm()) return;
  
  if (isEdit.value && props.transaction) {
    const updateData: TransactionUpdateRequest = {
      hotel: formData.value.hotel,
      plan: formData.value.plan,
      amount: formData.value.amount,
      transaction_type: formData.value.transaction_type,
      status: formData.value.status,
      transaction_id: formData.value.transaction_id,
      notes: formData.value.notes
    };
    
    emit('save', updateData, true, props.transaction.id);
  } else {
    const createData: TransactionCreateRequest = {
      hotel: formData.value.hotel,
      plan: formData.value.plan,
      amount: formData.value.amount,
      transaction_type: formData.value.transaction_type as 'manual',
      status: formData.value.status as 'pending' | 'completed' | 'failed' | 'cancelled',
      transaction_id: formData.value.transaction_id,
      notes: formData.value.notes
    };
    
    emit('save', createData, false);
  }
};

// Cleanup the debounce timer when component is unmounted
onUnmounted(() => {
  clearResults();
});
</script>