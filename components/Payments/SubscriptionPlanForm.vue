<template>
  <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :header="`${isEdit ? 'Edit' : 'Add'} Subscription Plan`" modal >
    <div class="p-4">
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block mb-2">Plan Name *</label>
            <InputText
              id="name"
              v-model="formData.name"
              class="w-full"
              :class="{ 'p-invalid': errors.name }"
            />
            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
          </div>

          <div>
            <label for="planType" class="block mb-2">Plan Type *</label>
            <Select
              id="planType"
              v-model="formData.plan_type"
              :options="planTypeOptions"
              option-label="label"
              option-value="value"
              class="w-full"
              :class="{ 'p-invalid': errors.plan_type }"
            />
            <small v-if="errors.plan_type" class="p-error">{{ errors.plan_type }}</small>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="price" class="block mb-2">Price *</label>
            <InputNumber
              id="price"
              v-model="formData.price"
              mode="currency"
              currency="USD"
              locale="en-US"
              class="w-full"
              :class="{ 'p-invalid': errors.price }"
            />
            <small v-if="errors.price" class="p-error">{{ errors.price }}</small>
          </div>

          <div>
            <label for="duration" class="block mb-2">Duration (Days) *</label>
            <InputNumber
              id="duration"
              v-model="formData.duration_days"
              class="w-full"
              :class="{ 'p-invalid': errors.duration_days }"
            />
            <small v-if="errors.duration_days" class="p-error">{{ errors.duration_days }}</small>
          </div>
        </div>

        <div>
          <label for="description" class="block mb-2">Description</label>
          <Textarea
            id="description"
            v-model="formData.description"
            rows="3"
            class="w-full"
          />
        </div>

        <div>
          <div class="flex items-center">
            <Checkbox
              id="isActive"
              v-model="formData.is_active"
              :binary="true"
              class="mr-2"
            />
            <label for="isActive">Active Plan</label>
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
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import type { SubscriptionPlan, SubscriptionPlanCreateRequest, SubscriptionPlanUpdateRequest } from '~/types/payments';

const props = defineProps<{
  visible: boolean;
  plan?: SubscriptionPlan | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: SubscriptionPlanCreateRequest | SubscriptionPlanUpdateRequest, isEdit: boolean, id?: string): void;
}>();

const isEdit = computed(() => !!props.plan);

const formData = ref({
  name: '',
  plan_type: 'standard',
  price: 0,
  duration_days: 30,
  description: '',
  is_active: true
});

const errors = ref<Record<string, string>>({});

const planTypeOptions = [
  { label: 'Trial', value: 'trial' },
  { label: 'Standard', value: 'standard' }
];

// Reset form when plan changes
watch(() => props.plan, (newPlan) => {
  if (newPlan) {
    formData.value = {
      name: newPlan.name,
      plan_type: newPlan.plan_type,
      price: parseFloat(newPlan.price.toString()),
      duration_days: newPlan.duration_days,
      description: newPlan.description,
      is_active: newPlan.is_active
    };
  } else {
    formData.value = {
      name: '',
      plan_type: 'standard',
      price: 0,
      duration_days: 30,
      description: '',
      is_active: true
    };
  }
  errors.value = {};
}, { immediate: true });

const validateForm = () => {
  errors.value = {};

  if (!formData.value.name.trim()) {
    errors.value.name = 'Plan name is required';
  }

  if (formData.value.price < 0) {
    errors.value.price = 'Price must be greater than or equal to 0';
  }

  if (formData.value.duration_days <= 0) {
    errors.value.duration_days = 'Duration must be greater than 0';
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validateForm()) return;

  if (isEdit.value && props.plan) {
    const updateData: SubscriptionPlanUpdateRequest = {
      name: formData.value.name,
      plan_type: formData.value.plan_type,
      price: formData.value.price,
      duration_days: formData.value.duration_days,
      description: formData.value.description,
      is_active: formData.value.is_active
    };

    emit('save', updateData, true, props.plan.id);
  } else {
    const createData: SubscriptionPlanCreateRequest = {
      name: formData.value.name,
      plan_type: formData.value.plan_type,
      price: formData.value.price,
      duration_days: formData.value.duration_days,
      description: formData.value.description,
      is_active: formData.value.is_active
    };

    emit('save', createData, false);
  }
};
</script>
