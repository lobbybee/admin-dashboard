<template>
  <DataTable
    :value="subscriptions"
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
        <h2 class="text-2xl font-bold">Hotel Subscriptions</h2>
        <div class="flex items-center gap-2">
          <InputText
            :model-value="search"
            @update:model-value="$emit('update:search', $event)"
            placeholder="Search subscriptions"
          />
          <Button icon="pi pi-search" @click="$emit('search')" class="p-button-secondary" />
          <Button label="Add Subscription" icon="pi pi-plus" @click="$emit('add-subscription')" />
          <Button label="Extend Subscription" icon="pi pi-plus" @click="$emit('extend-subscription')" />
        </div>
      </div>
    </template>

    <Column field="hotel" header="Hotel ID" sortable></Column>
    <Column field="plan" header="Plan ID" sortable></Column>
    <Column field="start_date" header="Start Date" sortable>
      <template #body="{ data }">
        {{ formatDate(data.start_date) }}
      </template>
    </Column>
    <Column field="end_date" header="End Date" sortable>
      <template #body="{ data }">
        {{ formatDate(data.end_date) }}
      </template>
    </Column>
    <Column field="is_active" header="Status" sortable>
      <template #body="{ data }">
        <Tag :value="data.is_active ? 'Active' : 'Inactive'" :severity="data.is_active ? 'success' : 'danger'" />
      </template>
    </Column>
    <Column header="Actions" style="width: 8rem">
      <template #body="{ data }">
        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text" @click="$emit('edit-subscription', data)" />
        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="$emit('delete-subscription', data)" />
      </template>
    </Column>
    <template #empty> No hotel subscriptions found. </template>
  </DataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import type { HotelSubscription } from '~/types/payments';

defineProps<{
  subscriptions: HotelSubscription[] | undefined;
  loading: boolean;
  totalRecords: number | undefined;
  pageSize: number;
  search: string;
}>();

defineEmits<{
  (e: 'page-changed', event: DataTablePageEvent): void;
  (e: 'add-subscription'): void;
  (e: 'extend-subscription'): void;
  (e: 'edit-subscription', subscription: HotelSubscription): void;
  (e: 'delete-subscription', subscription: HotelSubscription): void;
  (e: 'update:search', value: string): void;
  (e: 'search'): void;
}>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
</script>