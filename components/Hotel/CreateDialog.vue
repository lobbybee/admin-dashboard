<template>
  <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Create New Hotel" modal style="max-width: 800px;">
    <CreateForm @submit="onCreateHotel" @cancel="$emit('update:visible', false)" />
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
