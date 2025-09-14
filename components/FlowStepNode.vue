<template>
  <div :id="`flow-step-node-${step.id}`" class="p-4 bg-white rounded-lg shadow-md relative group">
    <p class="font-semibold">{{ step.step_name }}</p>
    <div class="mt-2 p-3 rounded-lg"
         :class="isUserResponse ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'">
      <p class="text-sm">{{ step.message_template }}</p>
      <div v-if="step.message_type === 'quick_reply' || step.message_type === 'list_message'" class="mt-2">
        <span v-for="(option, key) in step.options" :key="key"
              class="inline-block bg-blue-500 text-white text-xs font-bold mr-2 px-2.5 py-1 rounded-full">
          {{ option }}
        </span>
      </div>
    </div>
    <button @click.stop="$emit('delete')" class="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { FlowStepTemplate } from '~/composables/useFlowStepTemplate';

defineProps<{
  step: FlowStepTemplate;
  isUserResponse?: boolean;
}>();

defineEmits(['delete']);
</script>
