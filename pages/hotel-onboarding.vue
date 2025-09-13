<template>
  <div class="p-4">
    <Toast />
    <div class="card">
      <HotelList
        :hotels="data?.results"
        :loading="isPending"
        :total-records="data?.count"
        :page-size="Number(route.query.page_size) || 10"
        v-model:search="searchFilter"
        v-model:status="statusFilter"
        @page-changed="onPage"
        @view-details="onViewDetails"
        @search="onSearch"
        @create-hotel="onCreateHotel"
      />
    </div>

    <HotelDetailsDialog
      v-model:visible="isDetailsDialogVisible"
      :hotel="selectedHotel"
      @hotel-updated="refetch"
      class="w-full min-w-[350px] max-w-xl"
    />

    <CreateDialog
      v-model:visible="isCreateDialogVisible"
      @hotel-created="onHotelCreated"
      class="w-full min-w-[350px] max-w-xl"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { DataTablePageEvent } from 'primevue/datatable';
import Toast from 'primevue/toast';

import { useFetchHotels, type Hotel } from '~/composables/useHotel';
import HotelList from '~/components/Hotel/List.vue';
import HotelDetailsDialog from '~/components/Hotel/DetailsDialog.vue';
import CreateDialog from '~/components/Hotel/CreateDialog.vue';

const route = useRoute();
const router = useRouter();

// Data fetching is reactive to route.query
const { data, isPending, refetch } = useFetchHotels();

// Local state for filters, initialized from route query
const searchFilter = ref(route.query.search as string || '');
const statusFilter = ref(route.query.status as string | null);

// State for dialogs
const isDetailsDialogVisible = ref(false);
const isCreateDialogVisible = ref(false);
const selectedHotel = ref<Hotel | null>(null);

const updateRoute = (query: Record<string, any>) => {
    const newQuery = { ...route.query, ...query };
    for (const key in newQuery) {
        if (newQuery[key] === undefined || newQuery[key] === null || newQuery[key] === '') {
            delete newQuery[key];
        }
    }
    router.push({ query: newQuery });
};

const onPage = (event: DataTablePageEvent) => {
  updateRoute({ page: event.page + 1, page_size: event.rows });
};

const onViewDetails = (hotel: Hotel) => {
  selectedHotel.value = hotel;
  isDetailsDialogVisible.value = true;
};

const onSearch = () => {
  updateRoute({
    search: searchFilter.value || undefined,
    status: statusFilter.value || undefined,
    page: undefined // Reset to first page
  });
};

const onCreateHotel = () => {
  isCreateDialogVisible.value = true;
};

const onHotelCreated = () => {
  isCreateDialogVisible.value = false;
  refetch();
};

// Watch local filters and update route (which will trigger refetch automatically)
watch([searchFilter, statusFilter], ([newSearch, newStatus]) => {
  updateRoute({
    search: newSearch || undefined,
    status: newStatus || undefined,
    page: undefined // Reset to first page
  });
});

// When route changes (e.g. browser back/forward), update local filters
watch(() => route.query,
  (newQuery) => {
    searchFilter.value = (newQuery.search as string) || '';
    statusFilter.value = (newQuery.status as string) || null;
  },
  { deep: true }
);
</script>
