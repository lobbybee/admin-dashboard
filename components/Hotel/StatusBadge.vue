<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusClasses
    ]"
  >
    <div
      :class="[
        'w-1.5 h-1.5 rounded-full mr-1.5',
        dotClasses
      ]"
    ></div>
    {{ formattedStatus }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: string;
}>();

const formattedStatus = computed(() => {
  return props.status.charAt(0).toUpperCase() + props.status.slice(1);
});

const statusClasses = computed(() => {
  switch (props.status) {
    case 'verified':
      return 'bg-green-50 text-green-800';
    case 'pending':
      return 'bg-amber-50 text-amber-800';
    case 'suspended':
      return 'bg-red-50 text-red-800';
    case 'rejected':
      return 'bg-red-50 text-red-800';
    case 'active':
      return 'bg-emerald-50 text-emerald-800';
    case 'inactive':
      return 'bg-gray-50 text-gray-800';
    default:
      return 'bg-blue-50 text-blue-800';
  }
});

const dotClasses = computed(() => {
  switch (props.status) {
    case 'verified':
    case 'active':
      return 'bg-green-600';
    case 'pending':
      return 'bg-amber-600';
    case 'suspended':
    case 'rejected':
      return 'bg-red-600';
    case 'inactive':
      return 'bg-gray-600';
    default:
      return 'bg-blue-600';
  }
});
</script>