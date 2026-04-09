<template>
  <div ref="rootElement" class="relative">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      @input="handleInput"
      @focus="handleFocus"
      @keydown.esc="closeDropdown"
    />

    <div
      v-if="loading"
      class="absolute right-3 top-1/2 -translate-y-1/2"
    >
      <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
    </div>

    <div
      v-if="shouldShowDropdown"
      class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
    >
      <div
        v-for="guest in results"
        :key="guest.id"
        class="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between gap-3"
        @click="selectGuest(guest)"
      >
        <div class="min-w-0">
          <p class="font-medium text-gray-900 truncate">{{ guest.full_name }}</p>
          <p class="text-sm text-gray-600 truncate">{{ guest.email }} • {{ guest.whatsapp_number }}</p>
          <p class="text-xs text-gray-500 truncate">ID: {{ guest.id }} • Reg: {{ guest.register_number }}</p>
        </div>
        <span
          v-if="guest.active_flags_count > 0"
          class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full whitespace-nowrap"
        >
          {{ guest.active_flags_count }} flags
        </span>
      </div>

      <div
        v-if="!loading && results.length === 0"
        class="p-4 text-center text-gray-500"
      >
        {{ emptyMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import type { GuestSearchResult } from '~/types/flags';

const props = withDefaults(defineProps<{
  modelValue: string;
  results?: GuestSearchResult[];
  loading?: boolean;
  placeholder?: string;
  emptyMessage?: string;
}>(), {
  results: () => [],
  loading: false,
  placeholder: 'Search guests...',
  emptyMessage: 'No guests found',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', guest: GuestSearchResult): void;
}>();

const rootElement = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const hasQuery = computed(() => props.modelValue.trim().length > 0);
const shouldShowDropdown = computed(() => isOpen.value && hasQuery.value);

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', value);
  isOpen.value = value.trim().length > 0;
};

const handleFocus = () => {
  if (hasQuery.value) {
    isOpen.value = true;
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};

const selectGuest = (guest: GuestSearchResult) => {
  emit('select', guest);
  closeDropdown();
};

onClickOutside(rootElement, closeDropdown);
</script>
