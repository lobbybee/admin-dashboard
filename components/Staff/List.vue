<template>
  <DataTable
    :value="staffUsers"
    :loading="loading"
    paginator
    lazy
    :rows="pageSize"
    :totalRecords="totalRecords"
    @page="$emit('page-changed', $event)"
    tableStyle="min-width: 50rem"
  >
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-2xl font-bold">Staff Management</h2>
        <div class="flex items-center gap-2">
          <InputText
            :model-value="search"
            @update:model-value="$emit('update:search', $event)"
            placeholder="Search by name or email"
          />
          <Button icon="pi pi-search" @click="$emit('search')" class="p-button-secondary" />
          <Button label="Add Staff" icon="pi pi-plus" @click="$emit('add-staff')" />
        </div>
      </div>
    </template>

    <Column field="username" header="Username" sortable></Column>
    <Column field="email" header="Email" sortable></Column>
    <Column field="user_type" header="Role" sortable>
      <template #body="{ data }">
        <Tag :value="formatUserType(data.user_type)" :severity="getUserTypeSeverity(data.user_type)" />
      </template>
    </Column>
    <Column field="phone_number" header="Phone" sortable></Column>
    <Column header="Actions" style="width: 8rem">
      <template #body="{ data }">
        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text" @click="$emit('edit-staff', data)" />
        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="$emit('delete-staff', data)" />
      </template>
    </Column>
    <template #empty> No staff users found. </template>
  </DataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import type { StaffUser } from '~/types/staff';

defineProps<{
  staffUsers: StaffUser[] | undefined;
  loading: boolean;
  totalRecords: number | undefined;
  pageSize: number;
  search: string;
}>();

defineEmits<{
  (e: 'page-changed', event: DataTablePageEvent): void;
  (e: 'add-staff'): void;
  (e: 'edit-staff', user: StaffUser): void;
  (e: 'delete-staff', user: StaffUser): void;
  (e: 'update:search', value: string): void;
  (e: 'search'): void;
}>();

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
</script>