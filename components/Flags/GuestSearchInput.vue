<template>
  <div ref="rootElement" class="relative">
    <input
      :id="inputId"
      :value="modelValue"
      type="text"
      role="combobox"
      autocomplete="off"
      aria-autocomplete="list"
      :aria-expanded="shouldShowDropdown"
      :aria-controls="listId"
      :aria-activedescendant="activeOptionId"
      :placeholder="placeholder"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      @input="handleInput"
      @focus="handleFocus"
      @keydown.down.prevent="moveActive(1)"
      @keydown.up.prevent="moveActive(-1)"
      @keydown.home.prevent="activeIndex = 0"
      @keydown.end.prevent="activeIndex = results.length - 1"
      @keydown.enter.prevent="selectActive"
      @keydown.esc="closeDropdown"
      @keydown.tab="closeDropdown"
    />

    <div
      v-if="loading"
      class="absolute right-3 top-1/2 -translate-y-1/2"
    >
      <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
    </div>

    <div
      v-if="shouldShowDropdown"
      :id="listId"
      role="listbox"
      class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
    >
      <div
        v-for="(guest, index) in results"
        :id="`${listId}-option-${index}`"
        :key="guest.id"
        role="option"
        :aria-selected="index === activeIndex"
        class="p-3 cursor-pointer border-b last:border-b-0 flex items-center justify-between gap-3"
        :class="index === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'"
        @mouseenter="activeIndex = index"
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

      <!-- Mid-flight the query key changes and results empty out. Without this the
           dropdown would render as a bare box until the response lands. -->
      <div
        v-if="loading && results.length === 0"
        class="p-4 text-center text-gray-500 text-sm"
      >
        Searching...
      </div>

      <div
        v-else-if="!loading && results.length === 0"
        class="p-4 text-center text-gray-500"
      >
        {{ emptyMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
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

const uid = useId();
const inputId = `guest-search-${uid}`;
const listId = `guest-search-list-${uid}`;

const rootElement = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const activeIndex = ref(0);

const hasQuery = computed(() => props.modelValue.trim().length > 0);
const shouldShowDropdown = computed(() => isOpen.value && hasQuery.value);

const activeOptionId = computed(() =>
  shouldShowDropdown.value && props.results.length
    ? `${listId}-option-${activeIndex.value}`
    : undefined,
);

// A new result set invalidates the old highlight position.
watch(() => props.results, () => {
  activeIndex.value = 0;
});

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', value);
  isOpen.value = value.trim().length > 0;
  activeIndex.value = 0;
};

const handleFocus = () => {
  if (hasQuery.value) {
    isOpen.value = true;
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};

const moveActive = (delta: number) => {
  if (!props.results.length) return;
  if (!isOpen.value && hasQuery.value) {
    isOpen.value = true;
    return;
  }
  // Wraps, so Up from the first entry lands on the last.
  const count = props.results.length;
  activeIndex.value = (activeIndex.value + delta + count) % count;
  document
    .getElementById(`${listId}-option-${activeIndex.value}`)
    ?.scrollIntoView({ block: 'nearest' });
};

const selectGuest = (guest: GuestSearchResult) => {
  emit('select', guest);
  closeDropdown();
};

const selectActive = () => {
  if (!shouldShowDropdown.value) return;
  const guest = props.results[activeIndex.value];
  if (guest) selectGuest(guest);
};

onClickOutside(rootElement, closeDropdown);
</script>
