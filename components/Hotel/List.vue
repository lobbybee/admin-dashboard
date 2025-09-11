<template>
  <DataTable
    :value="hotels"
    :loading="loading"
    paginator
    lazy
    :rows="pageSize"
    :total-records="totalRecords"
    @page="$emit('page-changed', $event)"
    tableStyle="min-width: 50rem"
  >
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-2xl font-bold">Hotel Management</h2>
        <div class="flex items-center flex-wrap gap-2">
          <Select
            :model-value="status"
            @update:model-value="$emit('update:status', $event)"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="Filter by Status"
            :showClear="true"
            class=""
            :autoOptionFocus="false"
          />
          <div>
              <InputText
                          :model-value="search"
                          @update:model-value="$emit('update:search', $event)"
                          placeholder="Search by name"
                        />
                        <Button icon="pi pi-search" @click="$emit('search')" class="p-button-secondary" />
          </div>
          <Button label="Create Hotel" icon="pi pi-plus" @click="$emit('create-hotel')" />
        </div>
      </div>
    </template>

    <Column field="name" header="Name" sortable></Column>
    <Column field="admin.email" header="Admin Email" sortable></Column>
    <Column field="city" header="City" sortable></Column>
    <Column field="country" header="Country" sortable></Column>
    <Column field="status" header="Status" sortable>
      <template #body="{ data }">
        <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
      </template>
    </Column>
    <Column header="Actions" style="width: 8rem">
      <template #body="{ data }">
        <Button icon="pi pi-eye" class="p-button-rounded p-button-text" @click="$emit('view-details', data)" />
      </template>
    </Column>
    <template #empty> No hotels found. </template>
  </DataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import type { Hotel } from '~/composables/useHotel';

defineProps<{
  hotels: Hotel[] | undefined;
  loading: boolean;
  totalRecords: number | undefined;
  pageSize: number;
  search: string;
  status: string | undefined;
}>();

defineEmits<{
  (e: 'page-changed', event: DataTablePageEvent): void;
  (e: 'view-details', hotel: Hotel): void;
  (e: 'update:search', value: string): void;
  (e: 'update:status', value: string | undefined): void;
  (e: 'search'): void;
  (e: 'create-hotel'): void;
}>();

const statusOptions = ref([
  { label: 'Pending', value: 'pending' },
  { label: 'Verified', value: 'verified' }
]);

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'verified': return 'success';
    case 'pending': return 'warning';
    case 'suspended': return 'danger';
    case 'rejected': return 'danger';
    default: return 'info';
  }
};
</script>
