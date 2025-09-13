<template>
  <DataTable
    :value="transactions"
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
        <h2 class="text-2xl font-bold">Transactions</h2>
        <div class="flex flex-wrap items-center gap-2">
          <InputText
            :model-value="search"
            @update:model-value="$emit('update:search', $event)"
            placeholder="Search transactions"
          />
          <Button icon="pi pi-search" @click="$emit('search')" class="p-button-secondary" />
          <Button label="Add Transaction" icon="pi pi-plus" @click="$emit('add-transaction')" />
        </div>
      </div>
    </template>

    <Column field="hotel" header="Hotel ID" sortable></Column>
    <Column field="plan" header="Plan ID" sortable></Column>
    <Column field="amount" header="Amount" sortable>
      <template #body="{ data }">
        ${{ parseFloat(data.amount).toFixed(2) }}
      </template>
    </Column>
    <Column field="transaction_type" header="Type" sortable>
      <template #body="{ data }">
        <Tag :value="formatTransactionType(data.transaction_type)" :severity="getTransactionTypeSeverity(data.transaction_type)" />
      </template>
    </Column>
    <Column field="status" header="Status" sortable>
      <template #body="{ data }">
        <Tag :value="formatStatus(data.status)" :severity="getStatusSeverity(data.status)" />
      </template>
    </Column>
    <Column field="created_at" header="Date" sortable>
      <template #body="{ data }">
        {{ formatDate(data.created_at) }}
      </template>
    </Column>
    <Column header="Actions" style="width: 8rem">
      <template #body="{ data }">
        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text" @click="$emit('edit-transaction', data)" />
        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="$emit('delete-transaction', data)" />
      </template>
    </Column>
    <template #empty> No transactions found. </template>
  </DataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import type { Transaction } from '~/types/payments';

defineProps<{
  transactions: Transaction[] | undefined;
  loading: boolean;
  totalRecords: number | undefined;
  pageSize: number;
  search: string;
}>();

defineEmits<{
  (e: 'page-changed', event: DataTablePageEvent): void;
  (e: 'add-transaction'): void;
  (e: 'edit-transaction', transaction: Transaction): void;
  (e: 'delete-transaction', transaction: Transaction): void;
  (e: 'update:search', value: string): void;
  (e: 'search'): void;
}>();

const formatTransactionType = (type: string) => {
  switch (type) {
    case 'subscription':
      return 'Subscription';
    case 'manual':
      return 'Manual';
    default:
      return type;
  }
};

const getTransactionTypeSeverity = (type: string) => {
  switch (type) {
    case 'subscription':
      return 'info';
    case 'manual':
      return 'warning';
    default:
      return 'secondary';
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
</script>
