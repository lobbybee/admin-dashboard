<template>
<div class="page-container">
  <!-- Header Section -->
  <header class="mb-8">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900">
          Reports
        </h1>
        <p class="mt-2 text-gray-600">
          Generate and download detailed reports for your hotel management system
        </p>
      </div>
      
      <!-- Date Range Filter -->
      <div class="date-filter-container flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
        <div class="date-inputs flex flex-wrap items-center gap-3">
          <div class="date-input-group flex flex-col sm:flex-row sm:items-center gap-2">
            <label 
              for="start-date" 
              class="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              From
            </label>
            <input 
              id="start-date"
              v-model="dateRange.start"
              type="date"
              class="form-input px-3 py-2 text-sm"
            />
          </div>
          
          <div class="date-input-group flex flex-col sm:flex-row sm:items-center gap-2">
            <label 
              for="end-date" 
              class="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              To
            </label>
            <input 
              id="end-date"
              v-model="dateRange.end"
              type="date"
              class="form-input px-3 py-2 text-sm"
            />
          </div>
        </div>
        
        <div class="action-buttons flex justify-end">
          <button 
            @click="handleDateChange"
            class="button-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Quick Date Range Buttons -->
  <div class="quick-date-range-container mb-6 flex flex-wrap gap-2">
    <button 
      v-for="range in quickRanges" 
      :key="range.value"
      @click="setQuickDateRange(range.value)"
      class="quick-date-btn"
    >
      {{ range.label }}
    </button>
  </div>

  <!-- Tabs Navigation -->
  <div class="mb-8">
    <nav class="tab-navigation border-b border-gray-200">
      <div class="flex space-x-1 sm:space-x-8 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'tab-button',
            activeTab === tab.key
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <Icon :name="tab.icon" class="text-lg" />
            <span class="hidden sm:inline">{{ tab.label }}</span>
            <span class="sm:hidden">{{ tab.label.split(' ')[0] }}</span>
          </div>
        </button>
      </div>
    </nav>
  </div>

  <!-- Error State -->
  <div 
    v-if="currentError" 
    class="error-state mb-8"
    role="alert"
  >
    <div class="text-center py-8">
      <div class="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
        <Icon name="prime:exclamation-triangle" class="text-xl text-red-600" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        Unable to load reports
      </h3>
      <p class="text-gray-600 mb-4 max-w-md mx-auto">
        {{ currentError?.message || 'There was an error loading the report data. Please try again.' }}
      </p>
      <button 
        @click="handleRetry"
        class="button-primary action-button"
      >
        Try Again
      </button>
    </div>
  </div>

  <!-- Tab Content -->
  <div class="space-y-6">
    <!-- Hotels Report -->
    <div v-show="activeTab === 'hotels'" class="tab-content">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Hotel Reports</h2>
        <button 
          @click="downloadPDF('hotels')"
          :disabled="isHotelsLoading"
          class="button-primary action-button"
        >
          <Icon name="prime:download" class="text-lg" />
          <span class="hidden sm:inline ml-2">Download PDF</span>
          <span class="sm:hidden">PDF</span>
        </button>
      </div>

      <!-- Loading State -->
      <div 
        v-if="isHotelsLoading" 
        class="space-y-4"
        role="status"
        aria-label="Loading hotel reports"
      >
        <div v-for="i in 3" :key="i" class="card animate-pulse">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div class="w-32 h-6 bg-gray-200 rounded"></div>
              <div class="w-20 h-6 bg-gray-200 rounded"></div>
            </div>
            <div class="space-y-2">
              <div class="w-full h-4 bg-gray-200 rounded"></div>
              <div class="w-3/4 h-4 bg-gray-200 rounded"></div>
              <div class="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hotels Content -->
      <div v-else-if="hotelsData" class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Total Hotels</div>
              <div class="text-2xl font-bold text-gray-900">{{ hotelsData.summary.total }}</div>
            </div>
          </div>
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Verified</div>
              <div class="text-2xl font-bold text-green-600">{{ hotelsData.summary.verified }}</div>
            </div>
          </div>
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Unverified</div>
              <div class="text-2xl font-bold text-yellow-600">{{ hotelsData.summary.unverified }}</div>
            </div>
          </div>
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Inactive</div>
              <div class="text-2xl font-bold text-gray-600">{{ hotelsData.summary.inactive }}</div>
            </div>
          </div>
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Suspended</div>
              <div class="text-2xl font-bold text-red-600">{{ hotelsData.summary.suspended }}</div>
            </div>
          </div>
        </div>

        <!-- Detailed Data Table -->
        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Hotel Details</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="hotel in hotelsData?.data" :key="hotel.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ hotel.name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ hotel.email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusBadgeClass(hotel.status)">
                        {{ hotel.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ hotel.city }}, {{ hotel.country }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ formatDate(hotel.registration_date) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conversations Report -->
    <div v-show="activeTab === 'conversations'" class="tab-content">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Conversation Reports</h2>
        <button 
          @click="downloadPDF('conversations')"
          :disabled="isConversationsLoading"
          class="button-primary action-button"
        >
          <Icon name="prime:download" class="text-lg" />
          <span class="hidden sm:inline ml-2">Download PDF</span>
          <span class="sm:hidden">PDF</span>
        </button>
      </div>

      <!-- Loading State -->
      <div 
        v-if="isConversationsLoading" 
        class="space-y-4"
        role="status"
        aria-label="Loading conversation reports"
      >
        <div v-for="i in 3" :key="i" class="card animate-pulse">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div class="w-32 h-6 bg-gray-200 rounded"></div>
              <div class="w-20 h-6 bg-gray-200 rounded"></div>
            </div>
            <div class="space-y-2">
              <div class="w-full h-4 bg-gray-200 rounded"></div>
              <div class="w-3/4 h-4 bg-gray-200 rounded"></div>
              <div class="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Conversations Content -->
      <div v-else-if="conversationsData" class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Total Conversations</div>
              <div class="text-2xl font-bold text-gray-900">{{ conversationsData.summary.total }}</div>
            </div>
          </div>
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Active</div>
              <div class="text-2xl font-bold text-green-600">{{ conversationsData.summary.active }}</div>
            </div>
          </div>
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Closed</div>
              <div class="text-2xl font-bold text-blue-600">{{ conversationsData.summary.closed }}</div>
            </div>
          </div>
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Fulfilled</div>
              <div class="text-2xl font-bold text-purple-600">{{ conversationsData.summary.fulfilled }}</div>
            </div>
          </div>
        </div>

        <!-- Detailed Data Table -->
        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Conversation Details</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="conversation in conversationsData?.data" :key="conversation.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ conversation.hotel_name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ conversation.guest_name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ conversation.conversation_type }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getConversationStatusClass(conversation.status)">
                        {{ conversation.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ conversation.message_count }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ formatDate(conversation.created_at) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payments Report -->
    <div v-show="activeTab === 'payments'" class="tab-content">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Payment Reports</h2>
        <button 
          @click="downloadPDF('payments')"
          :disabled="isPaymentsLoading"
          class="button-primary action-button"
        >
          <Icon name="prime:download" class="text-lg" />
          <span class="hidden sm:inline ml-2">Download PDF</span>
          <span class="sm:hidden">PDF</span>
        </button>
      </div>

      <!-- Loading State -->
      <div 
        v-if="isPaymentsLoading" 
        class="space-y-4"
        role="status"
        aria-label="Loading payment reports"
      >
        <div v-for="i in 3" :key="i" class="card animate-pulse">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div class="w-32 h-6 bg-gray-200 rounded"></div>
              <div class="w-20 h-6 bg-gray-200 rounded"></div>
            </div>
            <div class="space-y-2">
              <div class="w-full h-4 bg-gray-200 rounded"></div>
              <div class="w-3/4 h-4 bg-gray-200 rounded"></div>
              <div class="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments Content -->
      <div v-else-if="paymentsData" class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div class="text-2xl font-bold text-green-600">₹{{ Number(paymentsData.summary.total_revenue).toLocaleString() }}</div>
            </div>
          </div>
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Completed</div>
              <div class="text-2xl font-bold text-green-600">{{ paymentsData.summary.completed_transactions }}</div>
            </div>
          </div>
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Pending</div>
              <div class="text-2xl font-bold text-yellow-600">{{ paymentsData.summary.pending_transactions }}</div>
            </div>
          </div>
          <div class="card">
            <div class="p-4">
              <div class="text-sm text-gray-600 mb-1">Active Subscriptions</div>
              <div class="text-2xl font-bold text-purple-600">{{ paymentsData.summary.active_subscriptions }}</div>
            </div>
          </div>
        </div>

        <!-- Detailed Data Table -->
        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="payment in paymentsData?.data" :key="payment.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ payment.hotel_name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ payment.plan_name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">${{ Number(payment.amount).toLocaleString() }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ payment.transaction_type }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getPaymentStatusClass(payment.status)">
                        {{ payment.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ formatDate(payment.created_at) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Period Information -->
  <footer class="text-center text-sm text-gray-500 mt-8">
    <p>
      Reports generated from {{ formatDate(dateRange.start) }} to {{ formatDate(dateRange.end) }}
    </p>
  </footer>
</div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { useFetchHotelStats, useFetchConversationStats, useFetchPaymentStats, type StatParams } from '~/composables/useStat';
import jsPDF from 'jspdf';

// Page metadata
definePageMeta({
  title: 'Reports',
  description: 'Generate and download reports for hotel management system',
});

// Reactive state
const activeTab = ref('hotels');
const dateRange = reactive({
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
  end: new Date().toISOString().split('T')[0], // today
});

const dateParams = computed<StatParams>(() => ({
  start_date: dateRange.start,
  end_date: dateRange.end,
}));

// Tab configuration
const tabs = [
  { key: 'hotels', label: 'Hotels', icon: 'prime:building' },
  { key: 'conversations', label: 'Conversations', icon: 'prime:comments' },
  { key: 'payments', label: 'Payments', icon: 'prime:dollar' },
];

// Quick date ranges
const quickRanges = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 90 Days', value: 90 },
  { label: 'Last Year', value: 365 },
];

// Fetch data for each report type
const { 
  data: hotelsData, 
  isLoading: isHotelsLoading, 
  error: hotelsError 
} = useFetchHotelStats(ref(dateParams));

const { 
  data: conversationsData, 
  isLoading: isConversationsLoading, 
  error: conversationsError 
} = useFetchConversationStats(ref(dateParams));

const { 
  data: paymentsData, 
  isLoading: isPaymentsLoading, 
  error: paymentsError 
} = useFetchPaymentStats(ref(dateParams));

// Computed properties
const currentError = computed(() => {
  switch (activeTab.value) {
    case 'hotels': return hotelsError.value;
    case 'conversations': return conversationsError.value;
    case 'payments': return paymentsError.value;
    default: return null;
  }
});

// Methods
const setQuickDateRange = (days: number) => {
  const today = new Date();
  const startDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
  
  dateRange.start = startDate.toISOString().split('T')[0];
  dateRange.end = today.toISOString().split('T')[0];
};

const handleDateChange = () => {
  // The computed dateParams will automatically update and trigger refetch
};

const handleRetry = () => {
  // This will trigger a refetch of the current tab's data
  switch (activeTab.value) {
    case 'hotels': 
      // Refetch hotels data
      break;
    case 'conversations': 
      // Refetch conversations data
      break;
    case 'payments': 
      // Refetch payments data
      break;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusBadgeClass = (status: string) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
  switch (status.toLowerCase()) {
    case 'verified': return `${baseClasses} bg-green-100 text-green-800`;
    case 'unverified': return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'inactive': return `${baseClasses} bg-gray-100 text-gray-800`;
    case 'suspended': return `${baseClasses} bg-red-100 text-red-800`;
    case 'rejected': return `${baseClasses} bg-red-100 text-red-800`;
    default: return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const getConversationStatusClass = (status: string) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
  switch (status.toLowerCase()) {
    case 'active': return `${baseClasses} bg-green-100 text-green-800`;
    case 'closed': return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'archived': return `${baseClasses} bg-purple-100 text-purple-800`;
    default: return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const getPaymentStatusClass = (status: string) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
  switch (status.toLowerCase()) {
    case 'completed': return `${baseClasses} bg-green-100 text-green-800`;
    case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'failed': return `${baseClasses} bg-red-100 text-red-800`;
    default: return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const downloadPDF = async (type: 'hotels' | 'conversations' | 'payments') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;
  
  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 12, x: number = 20) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, pageWidth - 40);
    lines.forEach((line: string) => {
      doc.text(line, x, yPosition);
      yPosition += 8;
    });
    return yPosition;
  };

  // Header
  doc.setFontSize(20);
  doc.text('Hotel Management Report', pageWidth / 2, 15, { align: 'center' });
  
  yPosition = addText(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 16);
  yPosition = addText(`Date Range: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 12);
  
  yPosition += 10; // Add some spacing

  try {
    let data, summary;
    
    switch (type) {
      case 'hotels':
        if (!hotelsData.value) throw new Error('No hotels data available');
        data = hotelsData.value.data;
        summary = hotelsData.value.summary;
        
        // Summary section
        addText('Summary', 14);
        addText(`Total Hotels: ${summary.total}`);
        addText(`Verified: ${summary.verified}`);
        addText(`Unverified: ${summary.unverified}`);
        addText(`Inactive: ${summary.inactive}`);
        addText(`Suspended: ${summary.suspended}`);
        addText(`Rejected: ${summary.rejected}`);
        
        yPosition += 10;
        addText('Hotel Details', 14);
        
        // Adjust column widths for better fit
        const headers = ['Hotel', 'Email', 'Status', 'Location', 'Reg. Date'];
        const columnWidths = [45, 55, 25, 50, 35]; // Manual widths in mm
        let hotelX = 20;
        
        // Add headers
        doc.setFont(undefined, 'bold');
        headers.forEach((header, index) => {
          doc.text(header, hotelX, yPosition);
          hotelX += columnWidths[index];
        });
        doc.setFont(undefined, 'normal');
        yPosition += 10;
        
        // Add data
        data.forEach(hotel => {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
            // Re-add headers on new page
            hotelX = 20;
            doc.setFont(undefined, 'bold');
            headers.forEach((header, index) => {
              doc.text(header, hotelX, yPosition);
              hotelX += columnWidths[index];
            });
            doc.setFont(undefined, 'normal');
            yPosition += 10;
          }
          
          hotelX = 20;
          
          // Hotel name (truncate if too long)
          let hotelName = hotel.name || 'N/A';
          if (hotelName.length > 25) hotelName = hotelName.substring(0, 22) + '...';
          doc.text(hotelName, hotelX, yPosition);
          hotelX += columnWidths[0];
          
          // Email (truncate if too long)
          let email = hotel.email || 'N/A';
          if (email.length > 30) email = email.substring(0, 27) + '...';
          doc.text(email, hotelX, yPosition);
          hotelX += columnWidths[1];
          
          // Status
          doc.text(hotel.status || 'N/A', hotelX, yPosition);
          hotelX += columnWidths[2];
          
          // Location (truncate if too long)
          let location = `${hotel.city || 'N/A'}, ${hotel.country || 'N/A'}`;
          if (location.length > 28) location = location.substring(0, 25) + '...';
          doc.text(location, hotelX, yPosition);
          hotelX += columnWidths[3];
          
          // Date
          doc.text(formatDate(hotel.registration_date), hotelX, yPosition);
          
          yPosition += 8;
        });
        break;
        
      case 'conversations':
        if (!conversationsData.value) throw new Error('No conversations data available');
        data = conversationsData.value.data;
        summary = conversationsData.value.summary;
        
        // Summary section
        addText('Summary', 14);
        addText(`Total Conversations: ${summary.total}`);
        addText(`Active: ${summary.active}`);
        addText(`Closed: ${summary.closed}`);
        addText(`Archived: ${summary.archived}`);
        addText(`Fulfilled: ${summary.fulfilled}`);
        
        yPosition += 10;
        addText('Conversation Details', 14);
        
        // Use a two-column layout for better readability
        addText('Conversation Details', 14);
        
        // Add data with better spacing
        data.forEach((conv, index) => {
          if (yPosition > 240) { // Give more space before page break
            doc.addPage();
            yPosition = 20;
          }
          
          // Add separator line for each conversation
          if (index > 0) {
            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPosition - 5, pageWidth - 20, yPosition - 5);
            doc.setDrawColor(0, 0, 0);
          }
          
          // Hotel and Guest (full width)
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.text(`Hotel: ${conv.hotel_name || 'N/A'}`, 20, yPosition);
          yPosition += 8;
          
          doc.setFont(undefined, 'normal');
          doc.text(`Guest: ${conv.guest_name || 'N/A'}`, 20, yPosition);
          yPosition += 8;
          
          // Two-column layout for details
          const leftCol = 20;
          const rightCol = pageWidth / 2 + 10;
          
          doc.text(`Type: ${conv.conversation_type || 'N/A'}`, leftCol, yPosition);
          doc.text(`Status: ${conv.status || 'N/A'}`, rightCol, yPosition);
          yPosition += 8;
          
          doc.text(`Messages: ${conv.message_count || 0}`, leftCol, yPosition);
          doc.text(`Created: ${formatDate(conv.created_at)}`, rightCol, yPosition);
          
          // Add last message info if available
          if (conv.last_message_at) {
            yPosition += 8;
            doc.setFontSize(10);
            doc.text(`Last Message: ${formatDate(conv.last_message_at)}`, leftCol, yPosition);
            doc.setFontSize(11);
          }
          
          yPosition += 12; // Extra spacing between conversations
        });
        break;
        
      case 'payments':
        if (!paymentsData.value) throw new Error('No payments data available');
        data = paymentsData.value.data;
        summary = paymentsData.value.summary;
        
        // Summary section
        addText('Summary', 14);
        addText(`Total Revenue: $${Number(summary.total_revenue).toLocaleString()}`);
        addText(`Completed Transactions: ${summary.completed_transactions}`);
        addText(`Pending Transactions: ${summary.pending_transactions}`);
        addText(`Failed Transactions: ${summary.failed_transactions}`);
        addText(`Active Subscriptions: ${summary.active_subscriptions}`);
        
        yPosition += 10;
        addText('Payment Details', 14);
        
        // Adjust column widths for better fit
        const paymentHeaders = ['Hotel', 'Plan', 'Amount', 'Type', 'Status', 'Date'];
        const paymentColumnWidths = [50, 45, 30, 35, 35, 45]; // Manual widths in mm
        let paymentX = 20;
        
        // Add headers
        doc.setFont(undefined, 'bold');
        paymentHeaders.forEach((header, index) => {
          doc.text(header, paymentX, yPosition);
          paymentX += paymentColumnWidths[index];
        });
        doc.setFont(undefined, 'normal');
        yPosition += 10;
        
        // Add data
        data.forEach(payment => {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
            // Re-add headers on new page
            paymentX = 20;
            doc.setFont(undefined, 'bold');
            paymentHeaders.forEach((header, index) => {
              doc.text(header, paymentX, yPosition);
              paymentX += paymentColumnWidths[index];
            });
            doc.setFont(undefined, 'normal');
            yPosition += 10;
          }
          
          paymentX = 20;
          
          // Hotel name (truncate if too long)
          let hotelName = payment.hotel_name || 'N/A';
          if (hotelName.length > 20) hotelName = hotelName.substring(0, 17) + '...';
          doc.text(hotelName, paymentX, yPosition);
          paymentX += paymentColumnWidths[0];
          
          // Plan name (truncate if too long)
          let planName = payment.plan_name || 'N/A';
          if (planName.length > 18) planName = planName.substring(0, 15) + '...';
          doc.text(planName, paymentX, yPosition);
          paymentX += paymentColumnWidths[1];
          
          // Amount (right aligned)
          const amount = `$${Number(payment.amount || 0).toLocaleString()}`;
          doc.text(amount, paymentX + paymentColumnWidths[2] - 5, yPosition, { align: 'right' });
          paymentX += paymentColumnWidths[2];
          
          // Transaction type
          doc.text(payment.transaction_type || 'N/A', paymentX, yPosition);
          paymentX += paymentColumnWidths[3];
          
          // Status
          doc.text(payment.status || 'N/A', paymentX, yPosition);
          paymentX += paymentColumnWidths[4];
          
          // Date
          doc.text(formatDate(payment.created_at), paymentX, yPosition);
          
          yPosition += 8;
        });
        break;
    }
    
    // Save the PDF
    const filename = `${type}_report_${formatDate(dateRange.start)}_to_${formatDate(dateRange.end)}.pdf`;
    doc.save(filename.replace(/\s+/g, '_'));
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    // You could show a toast notification here
    alert('Failed to generate PDF. Please try again.');
  }
};

// SEO and meta
useHead({
  title: 'Reports - Hotel Admin',
  meta: [
    {
      name: 'description',
      content: 'Generate and download detailed reports for hotel management system',
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

/* Form input styles */
.form-input {
  @apply block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm;
}

/* Card styles */
.card {
  @apply bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg;
}

/* Error state styles */
.error-state {
  @apply bg-red-50 border border-red-200 rounded-lg p-6;
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

/* Tab transitions */
.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Card hover effects */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease-in-out;
}

/* Quick date range buttons */
.quick-date-btn {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200;
}

.quick-date-btn:hover {
  @apply bg-gray-50 border-gray-400;
}

.quick-date-btn:focus {
  @apply outline-none ring-2 ring-offset-2 ring-blue-500;
}

/* Tab button styles */
.tab-button {
  @apply whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none;
}

.tab-button:hover {
  @apply border-gray-300 text-gray-700;
}

.tab-button:focus {
  @apply outline-none;
}

/* Loading state skeleton */
.skeleton {
  @apply bg-gray-200 rounded;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .page-container {
    @apply px-3;
  }
  
  .date-filter-container {
    @apply flex-col items-stretch space-y-3;
  }
  
  .date-input-group {
    @apply flex flex-col space-y-2;
  }
  
  .quick-date-range-container {
    @apply flex flex-col space-y-2;
  }
  
  .quick-date-btn {
    @apply w-full justify-center;
  }
  
  .tab-navigation {
    @apply overflow-x-auto;
  }
  
  .tab-button {
    @apply px-3 py-2 text-xs;
  }
  
  .card-container {
    @apply grid-cols-1;
  }
  
  .summary-card {
    @apply p-3;
  }
  
  .summary-card .text-2xl {
    @apply text-xl;
  }
  
  .table-container {
    @apply text-xs;
  }
  
  .action-button {
    @apply px-3 py-1.5 text-xs;
  }
}

@media (max-width: 768px) {
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-5 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .summary-section {
    @apply space-y-4;
  }
  
  .filter-section {
    @apply flex-col items-start space-y-4;
  }
  
  .date-inputs {
    @apply flex-col space-y-3 w-full;
  }
  
  .date-input-group {
    @apply w-full;
  }
  
  .date-inputs input {
    @apply w-full;
  }
  
  .action-buttons {
    @apply w-full;
  }
  
  .action-buttons button {
    @apply w-full;
  }
}

@media (max-width: 1024px) {
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-5 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Table scroll on mobile */
@media (max-width: 640px) {
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }
  
  .table-container::-webkit-scrollbar {
    height: 4px;
  }
  
  .table-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .table-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  .table-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
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
    @apply shadow-none border border-gray-300;
  }
}
</style>