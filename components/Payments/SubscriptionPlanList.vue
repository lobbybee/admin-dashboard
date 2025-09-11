<template>
  <DataTable
    :value="subscriptionPlans"
    :loading="loading"
    paginator
    lazy
    :rows="pageSize"
    :totalRecords="totalRecords"
    @page="$emit('page-changed', $event)"
    tableStyle="min-width: 50rem"
  >
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-2xl font-bold">Subscription Plans</h2>
        <div class="flex items-center gap-2">
          <InputText
            :model-value="search"
            @update:model-value="$emit('update:search', $event)"
            placeholder="Search plans"
          />
          <Button icon="pi pi-search" @click="$emit('search')" class="p-button-secondary" />
          <Button label="Add Plan" icon="pi pi-plus" @click="$emit('add-plan')" />
        </div>
      </div>
    </template>

    <Column field="name" header="Name" sortable></Column>
    <Column field="plan_type" header="Type" sortable>
      <template #body="{ data }">
        <Tag :value="formatPlanType(data.plan_type)" :severity="getPlanTypeSeverity(data.plan_type)" />
      </template>
    </Column>
    <Column field="price" header="Price" sortable>
      <template #body="{ data }">
        ${{ parseFloat(data.price).toFixed(2) }}
      </template>
    </Column>
    <Column field="duration_days" header="Duration (Days)" sortable></Column>
    <Column field="is_active" header="Status" sortable>
      <template #body="{ data }">
        <Tag :value="data.is_active ? 'Active' : 'Inactive'" :severity="data.is_active ? 'success' : 'danger'" />
      </template>
    </Column>
    <Column header="Actions" style="width: 8rem">
      <template #body="{ data }">
        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text" @click="$emit('edit-plan', data)" />
        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="$emit('delete-plan', data)" />
      </template>
    </Column>
    <template #empty> No subscription plans found. </template>
  </DataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import type { SubscriptionPlan } from '~/types/payments';

defineProps<{
  subscriptionPlans: SubscriptionPlan[] | undefined;
  loading: boolean;
  totalRecords: number | undefined;
  pageSize: number;
  search: string;
}>();

defineEmits<{
  (e: 'page-changed', event: DataTablePageEvent): void;
  (e: 'add-plan'): void;
  (e: 'edit-plan', plan: SubscriptionPlan): void;
  (e: 'delete-plan', plan: SubscriptionPlan): void;
  (e: 'update:search', value: string): void;
  (e: 'search'): void;
}>();

const formatPlanType = (planType: string) => {
  switch (planType) {
    case 'trial':
      return 'Trial';
    case 'standard':
      return 'Standard';
    default:
      return planType;
  }
};

const getPlanTypeSeverity = (planType: string) => {
  switch (planType) {
    case 'trial':
      return 'warning';
    case 'standard':
      return 'info';
    default:
      return 'secondary';
  }
};
</script>