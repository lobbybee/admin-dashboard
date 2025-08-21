<template>
  <div class="p-4 bg-white rounded-lg shadow-md border-2 border-gray-200 w-64 hover:border-primary-500 transition-colors duration-200 nodrag nopan">
    <Handle type="target" :position="Position.Top" class="!bg-primary-500 w-3 h-3" />

    <div class="font-bold text-base mb-2 text-gray-800">{{ data.label }}</div>

    <p class="text-sm text-gray-600 whitespace-pre-wrap">{{ data.message_template }}</p>

    <div class="mt-4 flex justify-end gap-2">
        <button title="Manage Actions" class="text-gray-500 hover:text-gray-800"><i class="pi pi-bolt"></i></button>
        <button title="Delete Step" class="text-red-500 hover:text-red-700" @click="emit('delete-step')"><i class="pi pi-trash"></i></button>
    </div>

    <Handle type="source" :position="Position.Bottom" class="!bg-green-500 w-3 h-3" />
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['delete-step']);
</script>

<style>
.vue-flow__handle {
    border: none;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
}
</style>
