<template>
  <div>
    <!-- Header with Search and Filters -->
    <div class="px-6 py-4 border-b border-gray-200 bg-white">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">Hotel Management</h1>
          <p class="text-sm text-gray-600 mt-1">Manage and monitor hotel properties</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <Select
            :model-value="status"
            @update:model-value="$emit('update:status', $event)"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="Filter by Status"
            :showClear="true"
            class="w-full sm:w-48"
            :autoOptionFocus="false"
          />
          <div class="flex gap-2">
            <InputText
              :model-value="search"
              @update:model-value="$emit('update:search', $event)"
              placeholder="Search by name"
              class="w-full sm:w-64"
            />
            <Button
              icon="pi pi-search"
              @click="$emit('search')"
              severity="secondary"
              variant="outlined"
              class="w-10 h-10"
            />
          </div>
          <Button
            label="Create Hotel"
            icon="pi pi-plus"
            @click="$emit('create-hotel')"
            class="w-full sm:w-auto"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading hotels...</p>
      </div>
    </div>

    <!-- Hotel Cards Grid -->
    <div v-else-if="hotels && hotels.length > 0" class="p-6 bg-gray-50">
      <div class="grid grid-cols-1  md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <HotelCard
          v-for="hotel in hotels"
          :key="hotel.id"
          :hotel="hotel"
          @view-details="$emit('view-details', hotel)"
          @view-qr="$emit('view-qr', hotel)"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex items-center justify-center py-12 bg-gray-50">
      <div class="text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-building text-gray-400 text-2xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
        <p class="text-gray-500 mb-4">Get started by creating your first hotel</p>
        <Button
          label="Create Hotel"
          icon="pi pi-plus"
          @click="$emit('create-hotel')"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && hotels && hotels.length > 0" class="px-6 py-4 bg-white border-t border-gray-200">
      <Paginator
        :rows="pageSize"
        :totalRecords="totalRecords"
        :rowsPerPageOptions="[10, 20, 50]"
        @page="onPageChange"
        class="flex justify-center"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type DataTablePageEvent } from 'primevue/datatable';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Paginator from 'primevue/paginator';
import HotelCard from './HotelCard.vue';
import type { Hotel } from '~/composables/useHotel';

defineProps<{
  hotels: Hotel[] | undefined;
  loading: boolean;
  totalRecords: number | undefined;
  pageSize: number;
  search: string;
  status: string | undefined;
}>();

const emit = defineEmits<{
  (e: 'page-changed', event: DataTablePageEvent): void;
  (e: 'view-details', hotel: Hotel): void;
  (e: 'view-qr', hotel: Hotel): void;
  (e: 'update:search', value: string): void;
  (e: 'update:status', value: string | undefined): void;
  (e: 'search'): void;
  (e: 'create-hotel'): void;
}>();

const statusOptions = ref([
  { label: 'Pending', value: 'pending' },
  { label: 'Verified', value: 'verified' }
]);

const onPageChange = (event: any) => {
  // Convert Paginator event to DataTablePageEvent format
  const tableEvent: DataTablePageEvent = {
    page: event.page,
    rows: event.rows,
    first: event.first
  };
  emit('page-changed', tableEvent);
};
</script>
