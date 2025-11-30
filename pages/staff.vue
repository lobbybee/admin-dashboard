<template>
  <div class="page-container">
    <div class="content-container">
      <!-- Page Header -->
      <div class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Staff Management</h1>
            <p class="text-gray-600 mt-1">Manage hotel staff accounts and permissions</p>
          </div>
          <button
            @click="showAddForm"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <i class="pi pi-plus"></i>
            Add Staff Member
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <InputText
                v-model="searchQuery"
                @input="debounceSearch"
                id="staff-search"
                placeholder="Search by name, email, or phone..."
                aria-label="Search staff members"
                class="w-full pl-10"
              />
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="pi pi-search text-gray-400"></i>
              </div>
            </div>
          </div>
          <button
            @click="fetchStaffUsers"
            class="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <i class="pi pi-filter mr-2"></i>
            Apply Filters
          </button>
        </div>
      </div>

      <!-- Staff List Component -->
      <StaffList
        :staff-users="staffUsers?.results"
        :loading="isLoading"
        :total-records="staffUsers?.count"
        :page-size="pageSize"
        :search="searchQuery"
        :current-page="currentPage"
        @page-changed="onPageChange"
        @add-staff="showAddForm"
        @edit-staff="showEditForm"
        @delete-staff="showDeleteConfirm"
        @update:search="updateSearch"
        @search="fetchStaffUsers"
      />

      <!-- Staff Form Component -->
      <StaffForm
        :visible="formVisible"
        :user="selectedUser"
        :loading="isCreating || isUpdating"
        @update:visible="formVisible = $event"
        @save="handleSave"
        class="w-full max-w-xl"
      />

      <!-- Confirmation Dialog -->
      <ConfirmDialog />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useHead } from '@unhead/vue';
import InputText from 'primevue/inputtext';
import StaffList from '~/components/Staff/List.vue';
import StaffForm from '~/components/Staff/Form.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import {
  useFetchStaffUsers,
  useCreateStaffUser,
  useUpdateStaffUser,
  useDeleteStaffUser
} from '~/composables/useStaff';
import type { StaffUser, StaffUserCreateRequest, StaffUserUpdateRequest } from '~/types/staff';

// SEO and Meta
useHead({
  title: 'Staff Management - Hotel Dashboard',
  meta: [
    { name: 'description', content: 'Manage hotel staff accounts, permissions, and user roles' }
  ]
});

const toast = useToast();
const confirm = useConfirm();

// Pagination and search
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');

// Debounce search to avoid excessive API calls
let searchTimeout: NodeJS.Timeout | null = null;
const debounceSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchStaffUsers();
  }, 300);
};

// Form state
const formVisible = ref(false);
const selectedUser = ref<StaffUser | null>(null);

// Fetch staff users
const { data: staffUsers, isLoading, refetch } = useFetchStaffUsers();

// Mutations
const { createStaffUser, isLoading: isCreating } = useCreateStaffUser();
const { updateStaffUser, isLoading: isUpdating } = useUpdateStaffUser();
const { deleteStaffUser, isLoading: isDeleting } = useDeleteStaffUser();

// Handle pagination
const onPageChange = (event: { page: number; rows: number }) => {
  currentPage.value = event.page + 1;
  pageSize.value = event.rows;
  fetchStaffUsers();
};

// Update search query
const updateSearch = (value: string) => {
  searchQuery.value = value;
};

// Fetch staff users with current filters
const fetchStaffUsers = () => {
  // We'll trigger refetch by updating query params
  // In a real implementation, you might need to use router.push with query params
  refetch();
};

// Show add form
const showAddForm = () => {
  selectedUser.value = null;
  formVisible.value = true;
};

// Show edit form
const showEditForm = (user: StaffUser) => {
  selectedUser.value = user;
  formVisible.value = true;
};

// Show delete confirmation
const showDeleteConfirm = (user: StaffUser) => {
  confirm.require({
    message: `Are you sure you want to delete ${user.username}?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => handleDelete(user.id.toString()),
    reject: () => {}
  });
};

// Handle save (create or update)
const handleSave = async (
  data: StaffUserCreateRequest | StaffUserUpdateRequest,
  isEdit: boolean,
  id?: string
) => {
  try {
    if (isEdit && id) {
      await updateStaffUser({ id, data: data as StaffUserUpdateRequest });
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Staff user updated successfully',
        life: 3000
      });
    } else {
      await createStaffUser(data as StaffUserCreateRequest);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Staff user created successfully',
        life: 3000
      });
    }

    formVisible.value = false;
    fetchStaffUsers();
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Operation failed',
      life: 5000
    });
  }
};

// Handle delete
const handleDelete = async (id: string) => {
  try {
    await deleteStaffUser(id);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Staff user deleted successfully',
      life: 3000
    });
    fetchStaffUsers();
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Delete failed',
      life: 5000
    });
  }
};

// Initial fetch
onMounted(() => {
  fetchStaffUsers();
});
</script>
