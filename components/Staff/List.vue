<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Loading staff members...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="!staffUsers || staffUsers.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-users text-gray-400 text-2xl"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Staff Members Found</h3>
      <p class="text-gray-500 mb-4">Get started by adding your first staff member to the system.</p>
      <button
        @click="$emit('add-staff')"
        class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <i class="pi pi-plus"></i>
        Add Staff Member
      </button>
    </div>

    <!-- Desktop Table View -->
    <div v-if="staffUsers && staffUsers.length > 0" class="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200" role="table" aria-label="Staff members table">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Staff Member
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="staff in (staffUsers || [])" :key="staff.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">
                      {{ staff.username.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ staff.username }}</div>
                  <div class="text-sm text-gray-500">{{ staff.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getUserTypeBadgeClass(staff.user_type)
                ]"
              >
                <div
                  :class="[
                    'w-2 h-2 rounded-full mr-1.5',
                    getUserTypeIndicatorClass(staff.user_type)
                  ]"
                ></div>
                {{ formatUserType(staff.user_type) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">
                <div v-if="staff.phone_number" class="flex items-center">
                  <i class="pi pi-phone text-gray-400 mr-1.5 text-xs"></i>
                  {{ staff.phone_number }}
                </div>
                <div v-else class="text-gray-400">—</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="$emit('edit-staff', staff)"
                  class="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  :aria-label="`Edit ${staff.username}`"
                >
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  @click="$emit('delete-staff', staff)"
                  class="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  :aria-label="`Delete ${staff.username}`"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div v-if="staffUsers && staffUsers.length > 0" class="lg:hidden space-y-4">
      <div
        v-for="staff in (staffUsers || [])"
        :key="staff.id"
        class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <div class="flex-shrink-0">
              <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span class="text-base font-medium text-blue-600">
                  {{ staff.username.charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-medium text-gray-900 truncate">{{ staff.username }}</h3>
              <p class="text-sm text-gray-500 truncate">{{ staff.email }}</p>
              <div class="mt-2 flex items-center space-x-2">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getUserTypeBadgeClass(staff.user_type)
                  ]"
                >
                  <div
                    :class="[
                      'w-2 h-2 rounded-full mr-1.5',
                      getUserTypeIndicatorClass(staff.user_type)
                    ]"
                  ></div>
                  {{ formatUserType(staff.user_type) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="$emit('edit-staff', staff)"
              class="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :aria-label="`Edit ${staff.username}`"
            >
              <i class="pi pi-pencil"></i>
            </button>
            <button
              @click="$emit('delete-staff', staff)"
              class="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              :aria-label="`Delete ${staff.username}`"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
        <div v-if="staff.phone_number" class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex items-center text-sm text-gray-500">
            <i class="pi pi-phone mr-2 text-gray-400"></i>
            {{ staff.phone_number }}
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalRecords && totalRecords > pageSize" class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <!-- Mobile pagination can be added here if needed -->
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ Math.min((currentPage - 1) * pageSize + 1, totalRecords) }}</span>
            to
            <span class="font-medium">{{ Math.min(currentPage * pageSize, totalRecords) }}</span>
            of
            <span class="font-medium">{{ totalRecords }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <!-- Previous button -->
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="pi pi-chevron-left"></i>
            </button>

            <!-- Page numbers would go here in a real implementation -->
            <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Page {{ currentPage }}
            </span>

            <!-- Next button -->
            <button
              @click="nextPage"
              :disabled="currentPage * pageSize >= totalRecords"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="pi pi-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { StaffUser } from '~/types/staff';

const props = defineProps<{
  staffUsers: StaffUser[] | undefined;
  loading: boolean;
  totalRecords: number | undefined;
  pageSize: number;
  search: string;
  currentPage?: number;
}>();

const emit = defineEmits<{
  (e: 'page-changed', event: { page: number; rows: number }): void;
  (e: 'add-staff'): void;
  (e: 'edit-staff', user: StaffUser): void;
  (e: 'delete-staff', user: StaffUser): void;
  (e: 'update:search', value: string): void;
  (e: 'search'): void;
}>();

// Computed current page from props
const currentPage = computed(() => props.currentPage || 1);

// Pagination handlers
const previousPage = () => {
  if (currentPage.value > 1) {
    emit('page-changed', { page: currentPage.value - 2, rows: props.pageSize });
  }
};

const nextPage = () => {
  if (props.totalRecords && currentPage.value * props.pageSize < props.totalRecords) {
    emit('page-changed', { page: currentPage.value, rows: props.pageSize });
  }
};

const formatUserType = (userType: string) => {
  switch (userType) {
    case 'platform_admin':
      return 'Admin';
    case 'platform_staff':
      return 'Staff';
    default:
      return userType;
  }
};

const getUserTypeSeverity = (userType: string) => {
  switch (userType) {
    case 'platform_admin':
      return 'success';
    case 'platform_staff':
      return 'info';
    default:
      return 'secondary';
  }
};

// Design system badge classes
const getUserTypeBadgeClass = (userType: string) => {
  switch (userType) {
    case 'platform_admin':
      return 'bg-emerald-50 text-emerald-600';
    case 'platform_staff':
      return 'bg-blue-50 text-blue-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

const getUserTypeIndicatorClass = (userType: string) => {
  switch (userType) {
    case 'platform_admin':
      return 'bg-emerald-500';
    case 'platform_staff':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};
</script>
