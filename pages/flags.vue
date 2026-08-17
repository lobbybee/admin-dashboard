<template>
  <div class="page-container">
    <header class="mb-8">
      <div class="header-content flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="header-section">
          <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900">
            Flags
          </h1>
          <p class="mt-2 text-gray-600">
            Monitor flagged guests and watchlisted ID numbers across all hotels
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
              aria-label="Clear guest filter"
              @click="clearGuestFilter"
            >
              <Icon name="prime:times" class="w-3 h-3" />
            </button>
          </div>

          <select
            v-model="activeOnlyFilter"
            aria-label="Filter by flag status"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="handleFilterChange"
          >
            <option :value="undefined">All Flags</option>
            <option :value="true">Active Only</option>
            <option :value="false">Inactive</option>
          </select>

          <select
            v-model="pageSize"
            aria-label="Results per page"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="handlePageSizeChange"
          >
            <option v-for="size in VALID_PAGE_SIZES" :key="size" :value="size">
              {{ size }} per page
            </option>
          </select>
        </div>
      </div>
    </section>

    <!-- First load only: with data already on screen we dim it instead (see below),
         because colada reports isLoading for background refetches too. -->
    <div
      v-if="isLoading && !data"
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
          {{ isPageOutOfRange ? 'That page no longer exists' : 'Unable to load flags' }}
        </h3>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          {{ isPageOutOfRange
            ? 'The flags on this page may have been reset or filtered out.'
            : errorMessage }}
        </p>
        <button
          class="button-primary"
          @click="isPageOutOfRange ? goToPage(1) : refetch()"
        >
          {{ isPageOutOfRange ? 'Back to first page' : 'Try Again' }}
        </button>
      </div>
    </div>

    <div
      v-else-if="data?.results"
      class="space-y-4 transition-opacity"
      :class="{ 'opacity-60 pointer-events-none': isLoading }"
      :aria-busy="isLoading"
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
              <div class="flex items-center flex-wrap gap-2 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ flagTargetLabel(flag) }}
                </h3>
                <span
                  v-if="flag.flagged_document"
                  class="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full"
                >
                  Watchlist ID
                </span>
                <span
                  v-if="flag.flagged_by_police"
                  class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                >
                  Police Flag
                </span>
              </div>
              <p class="text-sm text-gray-600">
                Flag #{{ flag.id }} • From: {{ flag.source || 'Platform' }} • By: {{ flag.flagged_by }}
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
                v-if="flag.is_active !== false"
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
            <p class="text-gray-700">{{ flag.global_note || 'No global note' }}</p>
          </div>

          <div v-if="flag.internal_reason" class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-1">
              Internal Reason
              <span class="font-normal text-gray-500">(platform only)</span>
            </h4>
            <p class="text-sm text-gray-700">{{ flag.internal_reason }}</p>
          </div>

          <div v-if="flag.documents?.length" class="mt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Identity Documents:</h4>
            <div class="flex flex-wrap gap-4">
              <template v-for="doc in flag.documents" :key="doc.id">
                <FilePreview
                  v-if="doc.file_url"
                  :url="doc.file_url"
                  :label="`${formatDocumentType(doc.document_type)} — ${doc.document_number}`"
                  :caption="formatDocumentType(doc.document_type)"
                />
                <FilePreview
                  v-if="doc.file_back_url"
                  :url="doc.file_back_url"
                  :label="`${formatDocumentType(doc.document_type)} (back) — ${doc.document_number}`"
                  caption="Back"
                />
              </template>
            </div>
          </div>

          <p
            v-else-if="flag.flagged_document"
            class="mt-4 text-sm text-gray-500"
          >
            No ID image on file — this number has not been collected at a hotel yet.
          </p>

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
        v-if="data.results.length === 0"
        class="text-center py-12"
      >
        <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon name="prime:flag" class="text-xl text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          No flags found
        </h3>
        <p class="text-gray-600 mb-6">
          {{ emptyStateMessage }}
        </p>
        <button
          v-if="hasActiveFilters"
          class="button-primary"
          @click="clearAllFilters"
        >
          Clear filters
        </button>
      </div>

      <div
        v-if="data.next || data.previous"
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
    </div>

    <Dialog
      v-model:visible="showCreateFlagModal"
      modal
      header="Create New Flag"
      class="w-full max-w-2xl"
      @hide="resetCreateState"
    >
      <form id="create-flag-form" class="space-y-4" @submit.prevent="handleCreateFlag">
        <fieldset>
          <legend class="block text-sm font-medium text-gray-700 mb-2">
            What are you flagging?
          </legend>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="option in FLAG_TARGET_OPTIONS"
              :key="option.value"
              type="button"
              :aria-pressed="flagTarget === option.value"
              class="px-4 py-3 text-sm font-medium rounded-lg border text-left transition-colors"
              :class="flagTarget === option.value
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
              @click="flagTarget = option.value"
            >
              <span class="block">{{ option.label }}</span>
              <span class="block text-xs font-normal text-gray-500 mt-0.5">
                {{ option.hint }}
              </span>
            </button>
          </div>
        </fieldset>

        <template v-if="flagTarget === 'guest'">
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
        </template>

        <template v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="document-type" class="block text-sm font-medium text-gray-700 mb-2">
                ID Type <span class="text-red-500">*</span>
              </label>
              <select
                id="document-type"
                v-model="newFlag.document_type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option v-for="option in DOCUMENT_TYPE_OPTIONS" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div>
              <label for="document-number" class="block text-sm font-medium text-gray-700 mb-2">
                ID Number <span class="text-red-500">*</span>
              </label>
              <input
                id="document-number"
                v-model="newFlag.document_number"
                type="text"
                placeholder="e.g. 1234 5678 9012"
                :aria-invalid="!!newFlag.document_number && !isDocumentNumberValid"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p
                v-if="newFlag.document_number && !isDocumentNumberValid"
                class="mt-1 text-sm text-red-600"
              >
                Needs at least {{ MIN_DOCUMENT_LENGTH }} characters once spaces and dashes are removed
              </p>
            </div>
          </div>

          <p class="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            This adds the ID to the platform watchlist. It will match automatically
            the first time someone checks in with this document.
          </p>
        </template>

        <div>
          <label for="global-note" class="block text-sm font-medium text-gray-700 mb-2">
            Global Note <span class="text-red-500">*</span>
          </label>
          <textarea
            id="global-note"
            v-model="newFlag.global_note"
            required
            rows="3"
            placeholder="Note visible to all hotel staff during check-in..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>

        <div>
          <label for="internal-reason" class="block text-sm font-medium text-gray-700 mb-2">
            Internal Reason (Platform Admin Only)
          </label>
          <textarea
            id="internal-reason"
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
      </form>

      <template #footer>
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          :disabled="isCreatingFlag"
          @click="showCreateFlagModal = false"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="create-flag-form"
          class="button-primary"
          :disabled="!canSubmitFlag || isCreatingFlag"
        >
          {{ isCreatingFlag ? 'Creating...' : 'Create Flag' }}
        </button>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showResetModal"
      modal
      header="Reset Flag"
      class="w-full max-w-md"
      @hide="resetResetState"
    >
      <form id="reset-flag-form" class="space-y-4" @submit.prevent="handleResetFlag">
        <p class="text-gray-600">
          Are you sure you want to reset
          <span class="font-medium text-gray-900">
            {{ selectedFlag ? flagTargetLabel(selectedFlag) : 'this flag' }}
          </span>?
          Please provide a reason.
        </p>

        <div>
          <label for="reset-reason" class="block text-sm font-medium text-gray-700 mb-2">
            Reset Reason <span class="text-red-500">*</span>
          </label>
          <textarea
            id="reset-reason"
            v-model="resetReason"
            required
            rows="3"
            placeholder="Enter reason for resetting this flag..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          :disabled="isResettingFlag"
          @click="showResetModal = false"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="reset-flag-form"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          :disabled="!resetReason.trim() || isResettingFlag"
        >
          {{ isResettingFlag ? 'Resetting...' : 'Reset Flag' }}
        </button>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { useCreateFlag, useFetchFlags, useResetFlag, useSearchGuests } from '~/composables/useFlags';
import { useAPIHelper } from '~/composables/useAPIHelper';
import {
  DEFAULT_PAGE_SIZE,
  DOCUMENT_TYPE_OPTIONS,
  MIN_DOCUMENT_LENGTH,
  VALID_PAGE_SIZES,
  formatDocumentType,
  normalizeDocumentNumber,
  type DocumentType,
  type Flag,
  type GuestSearchResult,
} from '~/types/flags';

definePageMeta({
  title: 'Flags',
  description: 'Monitor flagged guests and watchlisted ID numbers',
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { getErrorMessage } = useAPIHelper();

const pageSize = ref<number>(DEFAULT_PAGE_SIZE);
const activeOnlyFilter = ref<boolean | undefined>(undefined);
const filteredGuestId = ref<number | null>(null);
// Remembered from the search result so the chip can name the guest without
// putting their name in the URL, where it would land in history and shared links.
const filteredGuestName = ref<string | null>(null);

const guestSearchQuery = ref('');
const debouncedGuestSearchQuery = ref('');

const showCreateFlagModal = ref(false);
const showResetModal = ref(false);
const selectedFlag = ref<Flag | null>(null);

const createFlagGuestSearchQuery = ref('');
const debouncedCreateFlagGuestSearchQuery = ref('');
const selectedGuest = ref<GuestSearchResult | null>(null);

const FLAG_TARGET_OPTIONS = [
  { value: 'guest' as const, label: 'Existing Guest', hint: 'Someone already in the system' },
  { value: 'document' as const, label: 'ID Number', hint: 'Watchlist an ID with no guest yet' },
];

const flagTarget = ref<'guest' | 'document'>('guest');
const newFlag = ref({
  global_note: '',
  internal_reason: '',
  flagged_by_police: false,
  document_type: DOCUMENT_TYPE_OPTIONS[0].value as DocumentType,
  document_number: '',
});

const resetReason = ref('');

// Flipped synchronously on submit. The mutation's own isLoading only turns on
// after the await starts, which leaves a window for a second click.
const isCreatingFlag = ref(false);
const isResettingFlag = ref(false);

const currentPage = computed(() => {
  const page = Number(route.query.page);
  return Number.isFinite(page) && page > 0 ? page : 1;
});

const isDocumentNumberValid = computed(
  () => normalizeDocumentNumber(newFlag.value.document_number).length >= MIN_DOCUMENT_LENGTH,
);

const canSubmitFlag = computed(() => {
  if (!newFlag.value.global_note.trim()) return false;
  return flagTarget.value === 'guest' ? !!selectedGuest.value : isDocumentNumberValid.value;
});

const hasActiveFilters = computed(
  () => filteredGuestId.value !== null || activeOnlyFilter.value !== undefined,
);

const emptyStateMessage = computed(() => {
  if (filteredGuestId.value !== null) return 'This guest has no flags matching the current filters';
  if (activeOnlyFilter.value !== undefined) return 'Try adjusting your filters';
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

watch(
  () => route.query,
  (query) => {
    const parsedPageSize = Number(query.page_size);
    pageSize.value = VALID_PAGE_SIZES.includes(parsedPageSize) ? parsedPageSize : DEFAULT_PAGE_SIZE;

    if (query.active_only === 'true') {
      activeOnlyFilter.value = true;
    } else if (query.active_only === 'false') {
      activeOnlyFilter.value = false;
    } else {
      activeOnlyFilter.value = undefined;
    }

    const guestId = Number(query.guest_id);
    if (Number.isFinite(guestId) && guestId > 0) {
      filteredGuestId.value = guestId;
    } else {
      filteredGuestId.value = null;
      filteredGuestName.value = null;
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

const { createFlag } = useCreateFlag();
const { resetFlag } = useResetFlag();

const selectedGuestFilter = computed(() => {
  if (filteredGuestId.value === null) return null;
  // Prefer the name we were handed; otherwise recover it from the loaded flags
  // (a deep link has the id only), and fall back to the bare id.
  const fromResults = data.value?.results?.find(
    (flag) => flag.guest_id === filteredGuestId.value,
  )?.guest_name;
  return {
    id: filteredGuestId.value,
    name: filteredGuestName.value || fromResults || `Guest #${filteredGuestId.value}`,
  };
});

const errorMessage = computed(() =>
  error.value ? getErrorMessage(error.value) : 'There was an error loading the flags. Please try again.',
);

// DRF answers an out-of-range page with 404, which otherwise reads as a server fault.
const isPageOutOfRange = computed(
  () => (error.value as any)?.status === 404 && currentPage.value > 1,
);

const firstVisibleItem = computed(() => {
  if (!data.value?.count || !data.value.results.length) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const lastVisibleItem = computed(() => {
  if (!data.value?.count || !data.value.results.length) return 0;
  // Counted from what actually came back, so a server-side page_size cap cannot
  // desync the label from the rows on screen.
  return firstVisibleItem.value + data.value.results.length - 1;
});

const updateRouteQuery = async (
  updates: Record<string, string | undefined>,
  { push = false } = {},
) => {
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

  const navigate = push ? router.push : router.replace;
  await navigate({ query: nextQuery });
};

const handleFilterChange = async () => {
  await updateRouteQuery({
    active_only: activeOnlyFilter.value === undefined ? undefined : String(activeOnlyFilter.value),
    page: undefined,
  });
};

const handlePageSizeChange = async () => {
  await updateRouteQuery({
    page_size: pageSize.value === DEFAULT_PAGE_SIZE ? undefined : String(pageSize.value),
    page: undefined,
  });
};

const selectGuestToFilter = async (guest: GuestSearchResult) => {
  guestSearchQuery.value = '';
  debouncedGuestSearchQuery.value = '';
  filteredGuestName.value = guest.full_name;

  await updateRouteQuery({
    guest_id: String(guest.id),
    page: undefined,
  });
};

const clearGuestFilter = async () => {
  guestSearchQuery.value = '';
  debouncedGuestSearchQuery.value = '';
  filteredGuestName.value = null;

  await updateRouteQuery({ guest_id: undefined, page: undefined });
};

const clearAllFilters = async () => {
  guestSearchQuery.value = '';
  debouncedGuestSearchQuery.value = '';
  filteredGuestName.value = null;

  await updateRouteQuery({ guest_id: undefined, active_only: undefined, page: undefined });
};

// Paging is history-worthy; filters are not, so only this one pushes.
const goToPage = async (page: number) => {
  if (page < 1 || page === currentPage.value) {
    return;
  }

  await updateRouteQuery({ page: page === 1 ? undefined : String(page) }, { push: true });
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const flagTargetLabel = (flag: Flag) => {
  if (flag.guest_name) return flag.guest_name;
  if (flag.flagged_document) {
    const { document_type, document_number } = flag.flagged_document;
    return `${formatDocumentType(document_type)} · ${document_number}`;
  }
  return `Flag #${flag.id}`;
};

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
  flagTarget.value = 'guest';
  newFlag.value = {
    global_note: '',
    internal_reason: '',
    flagged_by_police: false,
    document_type: DOCUMENT_TYPE_OPTIONS[0].value as DocumentType,
    document_number: '',
  };
};

const resetResetState = () => {
  selectedFlag.value = null;
  resetReason.value = '';
};

const handleCreateFlag = async () => {
  if (!canSubmitFlag.value || isCreatingFlag.value) {
    return;
  }

  const isGuestFlag = flagTarget.value === 'guest';
  const target = isGuestFlag
    ? { guest_id: selectedGuest.value!.id }
    : {
        document_type: newFlag.value.document_type,
        document_number: newFlag.value.document_number.trim(),
      };

  isCreatingFlag.value = true;
  try {
    await createFlag({
      ...target,
      global_note: newFlag.value.global_note.trim(),
      internal_reason: newFlag.value.internal_reason.trim() || undefined,
      flagged_by_police: newFlag.value.flagged_by_police,
    });
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: getErrorMessage(err),
      life: 4000,
    });
    return;
  } finally {
    isCreatingFlag.value = false;
  }

  // Past this point the flag exists. Refreshing the list is a separate concern -
  // a failure here must not be reported as a failed create.
  showCreateFlagModal.value = false;
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: `${isGuestFlag ? 'Guest flag' : 'ID watchlist flag'} created successfully`,
    life: 3000,
  });
  await showNewestFlags();
};

const openResetModal = (flag: Flag) => {
  selectedFlag.value = flag;
  showResetModal.value = true;
};

const handleResetFlag = async () => {
  if (!selectedFlag.value || !resetReason.value.trim() || isResettingFlag.value) {
    return;
  }

  // The list drops the row only when the active-only filter is on; otherwise the
  // flag stays put with an Inactive label.
  const wasLastRowOnPage =
    activeOnlyFilter.value === true &&
    data.value?.results.length === 1 &&
    currentPage.value > 1;

  isResettingFlag.value = true;
  try {
    await resetFlag({
      id: String(selectedFlag.value.id),
      data: { reset_reason: resetReason.value.trim() },
    });
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: getErrorMessage(err),
      life: 4000,
    });
    return;
  } finally {
    isResettingFlag.value = false;
  }

  showResetModal.value = false;
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Flag reset successfully',
    life: 3000,
  });

  // Stepping back navigates, which refetches on its own.
  if (wasLastRowOnPage) {
    await goToPage(currentPage.value - 1);
  } else {
    await refetch();
  }
};

// A new flag is the newest, so it lands on page 1 - staying on page 5 would show
// a success toast over an unchanged list.
const showNewestFlags = async () => {
  if (currentPage.value > 1) {
    await goToPage(1);
  } else {
    await refetch();
  }
};

useHead({
  title: 'Flags - Hotel Admin',
  meta: [
    {
      name: 'description',
      content: 'Monitor flagged guests and watchlisted ID numbers across all hotels',
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
