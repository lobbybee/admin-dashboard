<template>
  <div class="flex flex-col gap-6">
    <StaffList
      :staff-users="staffUsers?.results"
      :loading="isLoading"
      :total-records="staffUsers?.count"
      :page-size="pageSize"
      :search="searchQuery"
      @page-changed="onPageChange"
      @add-staff="showAddForm"
      @edit-staff="showEditForm"
      @delete-staff="showDeleteConfirm"
      @update:search="updateSearch"
      @search="fetchStaffUsers"
    />

    <StaffForm
      :visible="formVisible"
      :user="selectedUser"
      :loading="isCreating || isUpdating"
      @update:visible="formVisible = $event"
      @save="handleSave"
      class="w-full max-w-xl"
    />

    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
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

const toast = useToast();
const confirm = useConfirm();

// Pagination and search
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');

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
const onPageChange = (event: any) => {
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
