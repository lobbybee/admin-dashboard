<template>
  <div class="page-container">
    <header class="mb-8">
      <div class="header-content flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="header-section">
          <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900">
            Guest Flags
          </h1>
          <p class="mt-2 text-gray-600">
            Manage and monitor guest flags across all hotels
          </p>
        </div>

        <button
          class="button-primary"
          @click="showCreateFlagModal = true"
        >
          Create New Flag
        </button>
      </div>
    </header>

    <section class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <FlagsGuestSearchInput
          v-model="guestSearchQuery"
          class="flex-1"
          :results="guestSearchResults?.results ?? []"
          :loading="isSearchingGuests"
          placeholder="Search guests by name, email, phone, or registration..."
          @select="selectGuestToFilter"
        />

        <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2">
          <div
            v-if="selectedGuestFilter"
            class="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-2"
          >
            <span class="text-sm">Guest: {{ selectedGuestFilter.name }}</span>
            <button
              class="text-blue-500 hover:text-blue-700"
              @click="clearGuestFilter"
            >
              <Icon name="prime:times" class="w-3 h-3" />
            </button>
          </div>

          <select
            v-model="activeOnlyFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="handleFilterChange"
          >
            <option :value="undefined">All Flags</option>
            <option :value="true">Active Only</option>
            <option :value="false">Inactive</option>
          </select>

          <select
            v-model="pageSize"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="handlePageSizeChange"
          >
            <option :value="20">20 per page</option>
            <option :value="50">50 per page</option>
            <option :value="100">100 per page</option>
          </select>
        </div>
      </div>
    </section>

    <div
      v-if="isLoading"
      class="space-y-4"
      role="status"
      aria-label="Loading flags"
    >
      <div
        v-for="i in 5"
        :key="i"
        class="skeleton-card animate-pulse"
      >
        <div class="p-6 bg-white rounded-lg border border-gray-200">
          <div class="flex items-start justify-between mb-4">
            <div class="space-y-2 flex-1">
              <div class="w-3/4 h-6 skeleton"></div>
              <div class="w-1/2 h-4 skeleton"></div>
            </div>
            <div class="w-20 h-8 skeleton"></div>
          </div>
          <div class="w-full h-4 skeleton"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="error-state"
      role="alert"
    >
      <div class="text-center py-12">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Icon name="prime:exclamation-triangle" class="text-xl text-red-600" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Unable to load flags
        </h3>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          {{ error?.message || 'There was an error loading the flags. Please try again.' }}
        </p>
        <button
          class="button-primary"
          @click="refetch"
        >
          Try Again
        </button>
      </div>
    </div>

    <div
      v-else-if="data?.results"
      class="space-y-4"
    >
      <div
        v-for="flag in data.results"
        :key="flag.id"
        class="flag-card"
        :class="{ 'flag-police': flag.flagged_by_police }"
      >
        <div class="p-6">
          <div class="flex items-start justify-between mb-4 gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">
                  Flag #{{ flag.id }}
                </h3>
                <span
                  v-if="flag.flagged_by_police"
                  class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                >
                  Police Flag
                </span>
              </div>
              <p class="text-sm text-gray-600">
                From: {{ flag.source || 'Platform' }} • By: {{ flag.flagged_by }}
              </p>
              <p class="text-sm text-gray-500">
                {{ formatDate(flag.flagged_date) }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <span
                v-if="flag.internal_rating"
                class="px-3 py-1 text-sm font-medium rounded-full"
                :class="getRatingClass(flag.internal_rating)"
              >
                Rating: {{ flag.internal_rating }}/5
              </span>
              <button
                v-if="!flag.reset_date"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                @click="openResetModal(flag)"
              >
                Reset Flag
              </button>
              <span
                v-else
                class="text-sm text-gray-500"
              >
                Inactive
              </span>
            </div>
          </div>

          <div class="border-t pt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Global Note:</h4>
            <p class="text-gray-700">{{ flag.global_note }}</p>
          </div>

          <div
            v-if="flag.hotel_name"
            class="mt-4 flex items-center gap-2 text-sm text-gray-600"
          >
            <Icon name="prime:building" class="w-4 h-4" />
            <span>{{ flag.hotel_name }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="data.count > pageSize"
        class="flex items-center justify-between mt-8 gap-4"
      >
        <div class="text-sm text-gray-700">
          Showing {{ firstVisibleItem }} to {{ lastVisibleItem }} of {{ data.count }} results
        </div>
        <div class="flex gap-2">
          <button
            class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!data.previous"
            @click="goToPage(currentPage - 1)"
          >
            Previous
          </button>
          <span class="px-3 py-2 text-sm text-gray-700">
            Page {{ currentPage }}
          </span>
          <button
            class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!data.next"
            @click="goToPage(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>

      <div
        v-if="data.results.length === 0"
        class="text-center py-12"
      >
        <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon name="prime:flag" class="text-xl text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          No flags found
        </h3>
        <p class="text-gray-600">
          {{ emptyStateMessage }}
        </p>
      </div>
    </div>

    <div
      v-if="showCreateFlagModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeCreateModal"
    >
      <div
        class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Create New Flag</h2>
            <button
              class="text-gray-400 hover:text-gray-600"
              @click="closeCreateModal"
            >
              <Icon name="prime:times" class="w-5 h-5" />
            </button>
          </div>

          <form class="space-y-4" @submit.prevent="handleCreateFlag">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Search Guest
              </label>
              <FlagsGuestSearchInput
                v-model="createFlagGuestSearchQuery"
                :results="createFlagGuestSearchResults?.results ?? []"
                :loading="isCreatingFlagSearchingGuests"
                placeholder="Search by name, email, phone, or registration number..."
                @select="selectGuest"
              />
            </div>

            <div v-if="selectedGuest" class="p-3 bg-blue-50 rounded-lg">
              <p class="text-sm font-medium text-blue-900">Selected Guest:</p>
              <p class="text-sm text-blue-700">{{ selectedGuest.full_name }} (ID: {{ selectedGuest.id }})</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Global Note <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="newFlag.global_note"
                required
                rows="3"
                placeholder="Note visible to all hotel staff during check-in..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Internal Reason (Platform Admin Only)
              </label>
              <textarea
                v-model="newFlag.internal_reason"
                rows="3"
                placeholder="Internal details not visible to hotel staff..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div class="flex items-center">
              <input
                id="police-flag"
                v-model="newFlag.flagged_by_police"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="police-flag" class="ml-2 block text-sm text-gray-900">
                Flagged by police
              </label>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                @click="closeCreateModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 button-primary"
                :disabled="!selectedGuest || !newFlag.global_note.trim() || isCreating"
              >
                {{ isCreating ? 'Creating...' : 'Create Flag' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div
      v-if="showResetModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeResetModal"
    >
      <div
        class="bg-white rounded-lg max-w-md w-full"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Reset Flag</h2>
            <button
              class="text-gray-400 hover:text-gray-600"
              @click="closeResetModal"
            >
              <Icon name="prime:times" class="w-5 h-5" />
            </button>
          </div>

          <p class="text-gray-600 mb-4">
            Are you sure you want to reset this flag? Please provide a reason.
          </p>

          <form class="space-y-4" @submit.prevent="handleResetFlag">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Reset Reason <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="resetReason"
                required
                rows="3"
                placeholder="Enter reason for resetting this flag..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                @click="closeResetModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                :disabled="!resetReason.trim() || isResetting"
              >
                {{ isResetting ? 'Resetting...' : 'Reset Flag' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import { useToast } from 'primevue/usetoast';
import { useCreateFlag, useFetchFlags, useResetFlag, useSearchGuests } from '~/composables/useFlags';
import type { Flag, GuestSearchResult } from '~/types/flags';

definePageMeta({
  title: 'Guest Flags',
  description: 'Manage guest flags across all hotels',
});

const DEFAULT_PAGE_SIZE = 20;
const VALID_PAGE_SIZES = new Set([20, 50, 100]);

const route = useRoute();
const router = useRouter();
const toast = useToast();

const pageSize = ref(DEFAULT_PAGE_SIZE);
const activeOnlyFilter = ref<boolean | undefined>(undefined);
const selectedGuestFilter = ref<{ id: number; name: string } | null>(null);

const guestSearchQuery = ref('');
const debouncedGuestSearchQuery = ref('');

const showCreateFlagModal = ref(false);
const showResetModal = ref(false);
const selectedFlag = ref<Flag | null>(null);

const createFlagGuestSearchQuery = ref('');
const debouncedCreateFlagGuestSearchQuery = ref('');
const selectedGuest = ref<GuestSearchResult | null>(null);
const newFlag = ref({
  global_note: '',
  internal_reason: '',
  flagged_by_police: false,
});

const resetReason = ref('');

const currentPage = computed(() => {
  const page = Number(route.query.page);
  return Number.isFinite(page) && page > 0 ? page : 1;
});

const firstVisibleItem = computed(() => {
  if (!data.value?.count) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const lastVisibleItem = computed(() => {
  if (!data.value?.count) return 0;
  return Math.min(currentPage.value * pageSize.value, data.value.count);
});

const emptyStateMessage = computed(() => {
  if (selectedGuestFilter.value || activeOnlyFilter.value !== undefined) {
    return 'Try adjusting your filters';
  }

  return 'No flags have been created yet';
});

const syncGuestSearch = useDebounceFn((value: string) => {
  debouncedGuestSearchQuery.value = value.trim();
}, 300);

const syncCreateGuestSearch = useDebounceFn((value: string) => {
  debouncedCreateFlagGuestSearchQuery.value = value.trim();
}, 300);

watch(guestSearchQuery, (value) => {
  syncGuestSearch(value);
});

watch(createFlagGuestSearchQuery, (value) => {
  syncCreateGuestSearch(value);
});

watch(showCreateFlagModal, (isOpen) => {
  if (!isOpen) {
    debouncedCreateFlagGuestSearchQuery.value = '';
  }
});

watch(
  () => route.query,
  (query) => {
    const parsedPageSize = Number(query.page_size);
    pageSize.value = VALID_PAGE_SIZES.has(parsedPageSize) ? parsedPageSize : DEFAULT_PAGE_SIZE;

    if (query.active_only === 'true') {
      activeOnlyFilter.value = true;
    } else if (query.active_only === 'false') {
      activeOnlyFilter.value = false;
    } else {
      activeOnlyFilter.value = undefined;
    }

    const guestId = Number(query.guest_id);
    if (Number.isFinite(guestId) && guestId > 0) {
      const guestName = typeof query.guest_name === 'string' && query.guest_name.trim()
        ? query.guest_name
        : `Guest #${guestId}`;
      selectedGuestFilter.value = {
        id: guestId,
        name: guestName,
      };
    } else {
      selectedGuestFilter.value = null;
    }
  },
  { immediate: true },
);

const { data, isLoading, error, refetch } = useFetchFlags();

const { data: guestSearchResults, isLoading: isSearchingGuests } = useSearchGuests(
  computed(() => debouncedGuestSearchQuery.value || undefined),
);

const { data: createFlagGuestSearchResults, isLoading: isCreatingFlagSearchingGuests } = useSearchGuests(
  computed(() => debouncedCreateFlagGuestSearchQuery.value || undefined),
);

const { createFlag, isLoading: isCreating } = useCreateFlag();
const { resetFlag, isLoading: isResetting } = useResetFlag();

const updateRouteQuery = async (updates: Record<string, string | undefined>) => {
  const nextQuery: Record<string, string> = {};

  Object.entries(route.query).forEach(([key, value]) => {
    if (typeof value === 'string') {
      nextQuery[key] = value;
    }
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      delete nextQuery[key];
      return;
    }

    nextQuery[key] = value;
  });

  await router.replace({ query: nextQuery });
};

const handleFilterChange = async () => {
  await updateRouteQuery({
    active_only: activeOnlyFilter.value === undefined ? undefined : String(activeOnlyFilter.value),
    page: '1',
  });
};

const handlePageSizeChange = async () => {
  await updateRouteQuery({
    page_size: pageSize.value === DEFAULT_PAGE_SIZE ? undefined : String(pageSize.value),
    page: '1',
  });
};

const selectGuestToFilter = async (guest: GuestSearchResult) => {
  guestSearchQuery.value = '';
  debouncedGuestSearchQuery.value = '';

  await updateRouteQuery({
    guest_id: String(guest.id),
    guest_name: guest.full_name,
    page: '1',
  });
};

const clearGuestFilter = async () => {
  guestSearchQuery.value = '';
  debouncedGuestSearchQuery.value = '';

  await updateRouteQuery({
    guest_id: undefined,
    guest_name: undefined,
    page: '1',
  });
};

const goToPage = async (page: number) => {
  if (page < 1 || page === currentPage.value) {
    return;
  }

  await updateRouteQuery({ page: String(page) });
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const getRatingClass = (rating: number) => {
  if (rating <= 2) return 'bg-red-100 text-red-800';
  if (rating <= 3) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

const selectGuest = (guest: GuestSearchResult) => {
  selectedGuest.value = guest;
  createFlagGuestSearchQuery.value = '';
  debouncedCreateFlagGuestSearchQuery.value = '';
};

const resetCreateState = () => {
  selectedGuest.value = null;
  createFlagGuestSearchQuery.value = '';
  debouncedCreateFlagGuestSearchQuery.value = '';
  newFlag.value = {
    global_note: '',
    internal_reason: '',
    flagged_by_police: false,
  };
};

const closeCreateModal = () => {
  showCreateFlagModal.value = false;
  resetCreateState();
};

const handleCreateFlag = async () => {
  if (!selectedGuest.value || !newFlag.value.global_note.trim()) {
    return;
  }

  try {
    await createFlag({
      guest_id: selectedGuest.value.id,
      global_note: newFlag.value.global_note.trim(),
      internal_reason: newFlag.value.internal_reason.trim() || undefined,
      flagged_by_police: newFlag.value.flagged_by_police,
    });

    closeCreateModal();
    await refetch();
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Guest flag created successfully',
      life: 3000,
    });
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err?.message || 'Failed to create guest flag',
      life: 4000,
    });
  }
};

const openResetModal = (flag: Flag) => {
  selectedFlag.value = flag;
  showResetModal.value = true;
};

const closeResetModal = () => {
  showResetModal.value = false;
  selectedFlag.value = null;
  resetReason.value = '';
};

const handleResetFlag = async () => {
  if (!selectedFlag.value || !resetReason.value.trim()) {
    return;
  }

  try {
    await resetFlag({
      id: String(selectedFlag.value.id),
      data: {
        reset_reason: resetReason.value.trim(),
      },
    });

    closeResetModal();
    await refetch();
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Guest flag reset successfully',
      life: 3000,
    });
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err?.message || 'Failed to reset guest flag',
      life: 4000,
    });
  }
};

useHead({
  title: 'Guest Flags - Hotel Admin',
  meta: [
    {
      name: 'description',
      content: 'Manage guest flags across all hotels',
    },
  ],
});
</script>

<style scoped>
.button-primary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.flag-card {
  @apply bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md;
}

.flag-police {
  @apply border-l-4 border-l-red-500;
}

.error-state {
  @apply bg-red-50 border border-red-200 rounded-lg p-6;
}

.skeleton {
  @apply bg-gray-200 rounded;
}

.skeleton-card {
  @apply bg-white border border-gray-200 rounded-lg overflow-hidden;
}

@media (max-width: 640px) {
  .page-container {
    @apply px-3;
  }

  .header-content {
    @apply flex-col items-center text-center space-y-4;
  }

  .flag-card {
    @apply mx-0;
  }
}
</style>
