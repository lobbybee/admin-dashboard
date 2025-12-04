<template>
<div class="page-container">
  <!-- Header Section -->
  <header class="mb-8">
    <div class="header-content flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div class="header-section">
        <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p class="mt-2 text-gray-600">
          Overview of your hotel management system
        </p>
      </div>

      <!-- Date Range Filter -->
      <div class="date-filter-container relative">
        <div class="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200/60 shadow-sm">
          <Icon name="prime:calendar" class="w-4 h-4 text-gray-500 flex-shrink-0" />
          <label
            for="date-range"
            class="text-xs sm:text-sm font-medium text-gray-600 hidden sm:block"
          >
            Period
          </label>
          <select
            id="date-range"
            v-model="selectedDateRange"
            @change="handleDateRangeChange"
            class="flex-1 min-w-0 bg-transparent border-0 text-sm text-gray-900 focus:outline-none focus:ring-0 cursor-pointer"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom Range</option>
          </select>
          <div class="w-4 h-4 flex items-center justify-center pointer-events-none">
            <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400"></div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Loading State -->
  <div
    v-if="isLoading"
    class="space-y-6"
    role="status"
    aria-label="Loading dashboard statistics"
  >
    <div class="overview-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="i in 8"
        :key="i"
        class="skeleton-card animate-pulse"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 skeleton"></div>
            <div class="w-16 h-6 skeleton"></div>
          </div>
          <div class="w-24 h-8 skeleton mb-2"></div>
          <div class="w-32 h-4 skeleton"></div>
        </div>
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
        Unable to load dashboard
      </h3>
      <p class="text-gray-600 mb-6 max-w-md mx-auto">
        {{ error?.message || 'There was an error loading the dashboard statistics. Please try again.' }}
      </p>
      <button
        @click="refetch"
        class="button-primary"
      >
        Try Again
      </button>
    </div>
  </div>

  <!-- Dashboard Content -->
  <div
    v-else-if="data"
    class="space-y-8"
  >
    <!-- Overview Cards -->
    <section aria-labelledby="overview-heading">
      <h2 id="overview-heading" class="sr-only">Overview Statistics</h2>

      <div class="overview-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Hotels Overview Card -->
        <div class="card">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="prime:building" class="text-xl text-blue-600" />
              </div>
              <span class="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Total {{ data.hotels.total }}
              </span>
            </div>

            <h3 class="text-2xl font-bold text-gray-900 mb-1">
              {{ data.hotels.total.toLocaleString() }}
            </h3>
            <p class="text-sm text-gray-600">
              Hotels
            </p>

            <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div class="flex items-center gap-1">
                <div class="status-indicator bg-green-500"></div>
                <span class="text-gray-600">
                  {{ data.hotels.verified }} verified
                </span>
              </div>
              <div class="flex items-center gap-1">
                <div class="status-indicator bg-yellow-500"></div>
                <span class="text-gray-600">
                  {{ data.hotels.unverified }} pending
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Conversations Overview Card -->
        <div class="card">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="prime:comments" class="text-xl text-green-600" />
              </div>
              <span class="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {{ data.conversations.active }} active
              </span>
            </div>

            <h3 class="text-2xl font-bold text-gray-900 mb-1">
              {{ data.conversations.total.toLocaleString() }}
            </h3>
            <p class="text-sm text-gray-600">
              Conversations
            </p>

            <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div class="flex items-center gap-1">
                <div class="status-indicator bg-green-500"></div>
                <span class="text-gray-600">
                  {{ data.conversations.closed }} closed
                </span>
              </div>
              <div class="flex items-center gap-1">
                <div class="status-indicator bg-blue-500"></div>
                <span class="text-gray-600">
                  {{ data.conversations.fulfilled }} fulfilled
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue Overview Card -->
        <div class="card">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="prime:dollar" class="text-xl text-purple-600" />
              </div>
              <span class="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                {{ data.revenue.completed_transactions }} completed
              </span>
            </div>

            <h3 class="text-2xl font-bold text-gray-900 mb-1">
              ${{ Number(data.revenue.total_revenue).toLocaleString() }}
            </h3>
            <p class="text-sm text-gray-600">
              Total Revenue
            </p>

            <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div class="flex items-center gap-1">
                <div class="status-indicator bg-yellow-500"></div>
                <span class="text-gray-600">
                  {{ data.revenue.pending_transactions }} pending
                </span>
              </div>
              <div class="flex items-center gap-1">
                <div class="status-indicator bg-green-500"></div>
                <span class="text-gray-600">
                  {{ data.revenue.active_subscriptions }} active
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Card -->
        <div class="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Icon name="prime:bolt" class="text-xl text-white" />
              </div>
            </div>

            <h3 class="text-lg font-semibold mb-3">
              Quick Actions
            </h3>
            <p class="text-sm opacity-90 mb-4">
              Manage your system efficiently
            </p>

            <div class="space-y-2">
              <a
                href="/hotel-onboarding"
                class="quick-action-btn"
              >
                Manage Hotels
              </a>
              <a
                href="/reports"
                class="quick-action-btn"
              >
                View Analytics
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Detailed Statistics -->
    <section aria-labelledby="details-heading">
      <h2 id="details-heading" class="text-lg font-semibold text-gray-900 mb-4">
        Detailed Statistics
      </h2>

      <div class="details-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Hotels Status Breakdown -->
        <div class="card lg:col-span-1">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Hotels Status
            </h3>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-green-500"></div>
                  <span class="text-sm text-gray-700">Verified</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.hotels.verified }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-yellow-500"></div>
                  <span class="text-sm text-gray-700">Unverified</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.hotels.unverified }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-gray-500"></div>
                  <span class="text-sm text-gray-700">Inactive</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.hotels.inactive }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-red-500"></div>
                  <span class="text-sm text-gray-700">Suspended</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.hotels.suspended }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-red-600"></div>
                  <span class="text-sm text-gray-700">Rejected</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.hotels.rejected }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Conversations Status Breakdown -->
        <div class="card lg:col-span-1">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Conversations Status
            </h3>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-green-500"></div>
                  <span class="text-sm text-gray-700">Active</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.conversations.active }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-blue-500"></div>
                  <span class="text-sm text-gray-700">Closed</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.conversations.closed }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-purple-500"></div>
                  <span class="text-sm text-gray-700">Archived</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.conversations.archived }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-green-600"></div>
                  <span class="text-sm text-gray-700">Fulfilled</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.conversations.fulfilled }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue Statistics -->
        <div class="card lg:col-span-1">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Revenue Overview
            </h3>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-green-500"></div>
                  <span class="text-sm text-gray-700">Completed</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.revenue.completed_transactions }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-yellow-500"></div>
                  <span class="text-sm text-gray-700">Pending</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.revenue.pending_transactions }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-red-500"></div>
                  <span class="text-sm text-gray-700">Failed</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.revenue.failed_transactions }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="status-indicator bg-purple-500"></div>
                  <span class="text-sm text-gray-700">Active Subscriptions</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ data.revenue.active_subscriptions }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Period Information -->
    <footer class="text-center text-sm text-gray-500">
      <p>
        Statistics from {{ formatDate(data.period.start_date) }} to {{ formatDate(data.period.end_date) }}
      </p>
    </footer>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useFetchOverviewStats, type StatParams } from '~/composables/useStat';

// Page metadata
definePageMeta({
  title: 'Dashboard',
  description: 'Hotel management system dashboard',
});

// Reactive state
const selectedDateRange = ref<string>('30');

// Calculate date range based on selection
const dateParams = computed<StatParams>(() => {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];

  let startDate: string;
  const days = parseInt(selectedDateRange.value);

  if (selectedDateRange.value === 'custom') {
    // For custom range, default to last 30 days
    startDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  } else {
    startDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  }

  return {
    start_date: startDate,
    end_date: endDate,
  };
});

// Fetch overview statistics
const {
  data,
  isLoading,
  error,
  refetch
} = useFetchOverviewStats(ref(dateParams));

// Handle date range change
const handleDateRangeChange = () => {
  // The computed dateParams will automatically update
  // and trigger a refetch due to the reactive reference
};

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// SEO and meta
useHead({
  title: 'Dashboard - Hotel Admin',
  meta: [
    {
      name: 'description',
      content: 'Hotel management system dashboard with overview statistics',
    },
  ],
});
</script>

<style scoped>
/* Button styles */
.button-primary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600;
}

.button-primary:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.button-primary:hover:not(:disabled) {
  @apply bg-blue-700;
}

.button-primary:focus {
  @apply outline-none ring-2 ring-offset-2 ring-blue-500;
}

/* Form select styles */
.form-select {
  @apply block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white;
}

/* Card styles */
.card {
  @apply bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg;
}

/* Error state styles */
.error-state {
  @apply bg-red-50 border border-red-200 rounded-lg p-6;
}

/* Quick action button styles */
.quick-action-btn {
  @apply block w-full text-center bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-lg px-3 py-2 text-sm font-medium backdrop-blur-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50;
}

.quick-action-btn:hover {
  @apply transform scale-105 shadow-lg;
}

.quick-action-btn:focus {
  @apply outline-none ring-2 ring-white/50 ring-offset-2 ring-offset-transparent;
}

/* Status indicator styles */
.status-indicator {
  @apply w-3 h-3 rounded-full;
}

/* Custom animations for loading state */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Card hover effects */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Quick actions card special hover */
.card.bg-gradient-to-br:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.3), 0 8px 16px -8px rgba(139, 92, 246, 0.2);
}

/* Focus management for accessibility */
.select:focus {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2;
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

  .date-filter-container {
    @apply w-full;
  }

  .date-filter-container > div {
    @apply max-w-full;
  }

  .header-section {
    @apply text-center;
  }

  .card {
    @apply p-4;
  }

  .card .p-6 {
    @apply p-4;
  }

  .card .text-2xl {
    @apply text-xl;
  }

  .card .w-12 {
    @apply w-10 h-10;
  }

  .status-indicator {
    @apply w-2 h-2;
  }

  .quick-action-btn {
    @apply py-2.5 text-base;
  }

  .overview-grid {
    @apply grid-cols-1 gap-4;
  }

  .details-grid {
    @apply grid-cols-1 gap-4;
  }
}

@media (max-width: 768px) {
  .overview-grid {
    @apply grid-cols-1 md:grid-cols-2 gap-4;
  }

  .details-grid {
    @apply grid-cols-1 lg:grid-cols-2 gap-4;
  }

  .header-content {
    @apply flex-col items-center text-center space-y-4;
  }

  .date-filter-container {
    @apply w-full max-w-xs;
  }
}

@media (max-width: 1024px) {
  .overview-grid {
    @apply lg:grid-cols-3;
  }

  .details-grid {
    @apply lg:grid-cols-2;
  }
}

/* Improve touch targets on mobile */
@media (max-width: 640px) {
  .card {
    @apply min-h-[120px];
  }

  .quick-action-btn {
    @apply min-h-[44px];
  }

  .date-filter-container > div {
    @apply min-h-[44px];
  }

  .date-filter-container select {
    @apply text-base;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }

  .page-container {
    @apply bg-white text-black;
  }

  .card {
    @apply shadow-none border border-gray-300 break-inside-avoid;
  }

  .card.bg-gradient-to-br {
    @apply bg-gray-100 text-black border border-gray-300;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .card {
    @apply border-2 border-gray-400;
  }

  .button-primary {
    @apply border-2 border-blue-700;
  }

  .form-select {
    @apply border-2 border-gray-400;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .card:hover {
    transform: none;
  }

  .quick-action-btn {
    transition: none;
  }

  .animate-pulse {
    animation: none;
  }
}

/* Dark mode support (if needed in future) */
@media (prefers-color-scheme: dark) {
  /* This can be uncommented and adjusted when dark mode is implemented */
  /*
  .card {
    @apply bg-gray-800 border-gray-600;
  }

  .card:hover {
    @apply border-gray-500;
  }
  */
}
</style>
