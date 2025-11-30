<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Create New Hotel"
    modal
    class="w-full max-w-2xl"
    :content-style="{ padding: 0 }"
  >
    <div class="p-6">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <i class="pi pi-building text-blue-600 text-xl"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-semibold text-gray-900">Create New Hotel</h2>
          <p class="text-sm text-gray-600 mt-1">Add a new hotel to the system and set up an admin account</p>
        </div>
      </div>
      <CreateForm @submit="onCreateHotel" @cancel="$emit('update:visible', false)" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import CreateForm from './CreateForm.vue';
import { useCreateHotel } from '~/composables/useHotel';
import type { CreateHotelData } from '~/types/hotel';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'hotel-created'): void;
}>();

const toast = useToast();
const { createHotel, isLoading } = useCreateHotel();

const onCreateHotel = async (data: CreateHotelData) => {
  try {
    await createHotel(data);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Hotel created successfully!', life: 3000 });
    emit('update:visible', false);
    emit('hotel-created');
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.data?.message || 'Failed to create hotel.', life: 3000 });
  }
};
</script>
