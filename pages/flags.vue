<template>
  <div class="page-container">
    <!-- Header Section -->
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

        <!-- Create Flag Button -->
        <button
          @click="showCreateFlagModal = true"
          class="button-primary"
        >
          Create New Flag
        </button>
      </div>
    </header>

    <!-- Search and Filters -->
    <section class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search Input with Suggestions -->
        <div class="flex-1 relative">
          <input
            v-model="guestSearchQuery"
            type="text"
            placeholder="Search guests by name, email, phone, or registration..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @focus="showSuggestions = true"
          />

          <!-- Loading indicator -->
          <div
            v-if="isSearchingGuests"
            class="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>

          <!-- Guest Search Suggestions Dropdown -->
          <div
            v-if="showSuggestions && guestSearchResults?.results && guestSearchQuery"
            class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
          >
            <div
              v-for="guest in guestSearchResults?.results"
              :key="guest.id"
              @click="selectGuestToFilter(guest)"
              class="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between"
            >
              <div>
                <p class="font-medium text-gray-900">{{ guest.full_name }}</p>
                <p class="text-sm text-gray-600">{{ guest.email }} • {{ guest.whatsapp_number }}</p>
                <p class="text-xs text-gray-500">ID: {{ guest.id }} • Reg: {{ guest.register_number }}</p>
              </div>
              <span
                v-if="guest.active_flags_count > 0"
                class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full whitespace-nowrap"
              >
                {{ guest.active_flags_count }} flags
              </span>
            </div>

            <div
              v-if="guestSearchResults?.count === 0"
              class="p-4 text-center text-gray-500"
            >
              No guests found
            </div>
          </div>
        </div>

        <!-- Current Filter Display -->
        <div class="flex items-center gap-2">
          <div
            v-if="selectedGuestFilter"
            class="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-2"
          >
            <span class="text-sm">Guest: {{ selectedGuestFilter.name }}</span>
            <button
              @click="clearGuestFilter"
              class="text-blue-500 hover:text-blue-700"
            >
              <Icon name="prime:times" class="w-3 h-3" />
            </button>
          </div>

          <!-- Filters -->
          <select
            v-model="activeOnlyFilter"
            @change="handleFilterChange"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option :value="undefined">All Flags</option>
            <option :value="true">Active Only</option>
            <option :value="false">Inactive</option>
          </select>

          <select
            v-model="pageSize"
            @change="handlePageSizeChange"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Loading State -->
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

    <!-- Error State -->
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
          @click="refetch"
          class="button-primary"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Flags List -->
    <div
      v-else-if="data?.results"
      class="space-y-4"
    >
      <div
        v-for="flag in data?.results"
        :key="flag.id"
        class="flag-card"
        :class="{ 'flag-police': flag.flagged_by_police }"
      >
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
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
                @click="openResetModal(flag)"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
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

      <!-- Pagination -->
      <div
        v-if="data?.count > pageSize"
        class="flex items-center justify-between mt-8"
      >
        <div class="text-sm text-gray-700">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, data?.count || 0) }} of {{ data?.count || 0 }} results
        </div>
        <div class="flex gap-2">
          <button
            :disabled="!data?.previous"
            @click="goToPage(currentPage - 1)"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span class="px-3 py-2 text-sm text-gray-700">
            Page {{ currentPage }}
          </span>
          <button
            :disabled="!data?.next"
            @click="goToPage(currentPage + 1)"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="data?.results?.length === 0"
        class="text-center py-12"
      >
        <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon name="prime:flag" class="text-xl text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          No flags found
        </h3>
        <p class="text-gray-600">
          {{ searchQuery ? 'Try adjusting your search or filters' : 'No flags have been created yet' }}
        </p>
      </div>
    </div>

    <!-- Create Flag Modal -->
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
              @click="closeCreateModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <Icon name="prime:times" class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleCreateFlag" class="space-y-4">
            <!-- Guest Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Search Guest
              </label>
              <div class="relative">
                <input
                  v-model="createFlagGuestSearchQuery"
                  type="text"
                  placeholder="Search by name, email, phone, or registration number..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div
                  v-if="isCreatingFlagSearchingGuests"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              </div>

              <!-- Guest Search Results -->
              <div
                v-if="createFlagGuestSearchResults?.results && createFlagGuestSearchQuery"
                class="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto"
              >
                <div
                  v-for="guest in createFlagGuestSearchResults?.results"
                  :key="guest.id"
                  @click="selectGuest(guest)"
                  class="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-900">{{ guest.full_name }}</p>
                      <p class="text-sm text-gray-600">{{ guest.email }} • {{ guest.whatsapp_number }}</p>
                    </div>
                    <span
                      v-if="guest.active_flags_count > 0"
                      class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full"
                    >
                      {{ guest.active_flags_count }} flags
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selected Guest -->
            <div v-if="selectedGuest" class="p-3 bg-blue-50 rounded-lg">
              <p class="text-sm font-medium text-blue-900">Selected Guest:</p>
              <p class="text-sm text-blue-700">{{ selectedGuest.full_name }} (ID: {{ selectedGuest.id }})</p>
            </div>

            <!-- Global Note -->
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

            <!-- Internal Reason -->
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

            <!-- Police Flag -->
            <div class="flex items-center">
              <input
                v-model="newFlag.flagged_by_police"
                type="checkbox"
                id="police-flag"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="police-flag" class="ml-2 block text-sm text-gray-900">
                Flagged by police
              </label>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeCreateModal"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!selectedGuest || !newFlag.global_note || isCreating"
                class="flex-1 button-primary"
              >
                {{ isCreating ? 'Creating...' : 'Create Flag' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Reset Flag Modal -->
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
              @click="closeResetModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <Icon name="prime:times" class="w-5 h-5" />
            </button>
          </div>

          <p class="text-gray-600 mb-4">
            Are you sure you want to reset this flag? Please provide a reason.
          </p>

          <form @submit.prevent="handleResetFlag" class="space-y-4">
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
                @click="closeResetModal"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!resetReason || isResetting"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetchFlags, useCreateFlag, useResetFlag, useSearchGuests } from '~/composables/useFlags';
import type { Flag, GuestSearchResult } from '~/types/flags';

// Page metadata
definePageMeta({
  title: 'Guest Flags',
  description: 'Manage guest flags across all hotels',
});

// Router
const route = useRoute();
const router = useRouter();

// State
const searchQuery = ref('');
const activeOnlyFilter = ref<boolean | undefined>(undefined);
const pageSize = ref(20);
const currentPage = computed(() => Number(route.query.page) || 1);

// Guest search for filtering
const guestSearchQuery = ref('');
const showSuggestions = ref(false);
const selectedGuestFilter = ref<{ id: number; name: string } | null>(null);

// Modals
const showCreateFlagModal = ref(false);
const showResetModal = ref(false);
const selectedFlag = ref<Flag | null>(null);

// Create flag form
const createFlagGuestSearchQuery = ref('');
const selectedGuest = ref<GuestSearchResult | null>(null);
const newFlag = ref({
  global_note: '',
  internal_reason: '',
  flagged_by_police: false,
});

// Reset flag
const resetReason = ref('');

// Fetch flags
const {
  data,
  isLoading,
  error,
  refetch
} = useFetchFlags();

// Guest search for filtering
const {
  data: guestSearchResults,
  isLoading: isSearchingGuests
} = useSearchGuests(ref(guestSearchQuery));

// Guest search for create flag modal
const {
  data: createFlagGuestSearchResults,
  isLoading: isCreatingFlagSearchingGuests
} = useSearchGuests(ref(createFlagGuestSearchQuery));

// Create flag mutation
const {
  createFlag,
  isLoading: isCreating
} = useCreateFlag();

// Reset flag mutation
const {
  resetFlag,
  isLoading: isResetting
} = useResetFlag();

// Methods
const handleSearch = () => {
  const query: any = {};
  if (searchQuery.value) query.guest_id = searchQuery.value;
  if (selectedGuestFilter.value) query.guest_id = selectedGuestFilter.value.id;
  if (activeOnlyFilter.value !== undefined) query.active_only = activeOnlyFilter.value;
  if (pageSize.value !== 20) query.page_size = pageSize.value;

  router.push({ query: { ...route.query, ...query, page: 1 } });
};

const handleGuestSearch = () => {
  // Search is reactive via the composable
  showSuggestions.value = true;
};

const selectGuestToFilter = (guest: GuestSearchResult) => {
  selectedGuestFilter.value = {
    id: guest.id,
    name: guest.full_name
  };
  guestSearchQuery.value = '';
  showSuggestions.value = false;

  // Apply filter
  const query: any = { ...route.query };
  query.guest_id = guest.id;
  query.page = 1;
  router.push({ query });
};

const clearGuestFilter = () => {
  selectedGuestFilter.value = null;

  // Remove filter from URL
  const query: any = { ...route.query };
  delete query.guest_id;
  query.page = 1;
  router.push({ query });
};

const handleFilterChange = () => {
  handleSearch();
};

const handlePageSizeChange = () => {
  router.push({ query: { ...route.query, page_size: pageSize.value, page: 1 } });
};

const goToPage = (page: number) => {
  router.push({ query: { ...route.query, page } });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getRatingClass = (rating: number) => {
  if (rating <= 2) return 'bg-red-100 text-red-800';
  if (rating <= 3) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};


const selectGuest = (guest: GuestSearchResult) => {
  selectedGuest.value = guest;
  createFlagGuestSearchQuery.value = ''; // Clear search to hide results
};

const closeCreateModal = () => {
  showCreateFlagModal.value = false;
  selectedGuest.value = null;
  createFlagGuestSearchQuery.value = '';
  newFlag.value = {
    global_note: '',
    internal_reason: '',
    flagged_by_police: false,
  };
};

const handleCreateFlag = async () => {
  if (!selectedGuest.value || !newFlag.value.global_note) return;

  try {
    await createFlag({
      guest_id: selectedGuest.value.id,
      global_note: newFlag.value.global_note,
      internal_reason: newFlag.value.internal_reason,
      flagged_by_police: newFlag.value.flagged_by_police,
    });

    closeCreateModal();
    refetch();
  } catch (err) {
    console.error('Failed to create flag:', err);
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
  if (!selectedFlag.value || !resetReason.value) return;

  try {
    await resetFlag({
      id: selectedFlag.value.id.toString(),
      data: {
        reset_reason: resetReason.value
      }
    });

    closeResetModal();
    refetch();
  } catch (err) {
    console.error('Failed to reset flag:', err);
  }
};

// Handle click outside to close suggestions
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    showSuggestions.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// SEO and meta
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
/* Button styles */
.button-primary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Card styles */
.flag-card {
  @apply bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md;
}

.flag-police {
  @apply border-l-4 border-l-red-500;
}

/* Error state styles */
.error-state {
  @apply bg-red-50 border border-red-200 rounded-lg p-6;
}

/* Loading skeleton styles */
.skeleton {
  @apply bg-gray-200 rounded;
}

.skeleton-card {
  @apply bg-white border border-gray-200 rounded-lg overflow-hidden;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .page-container {
    @apply px-3;
  }

  .header-content {
    @apply flex-col items-center text-center space-y-4;
  }

  .flag-card {
    @apply p-4;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .flag-card {
    @apply border-2 border-gray-400;
  }
}
</style>