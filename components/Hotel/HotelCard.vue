<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden min-w-[280px]">
    <!-- Hotel Header with clean background -->
    <div class="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div class="absolute top-3 right-3">
        <StatusBadge :status="hotel.status" />
      </div>
      <div class="absolute inset-0 flex items-center px-6">
        <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <i class="pi pi-building text-white text-lg"></i>
        </div>
      </div>
    </div>

    <!-- Hotel Details -->
    <div class="p-5 space-y-4">
      <!-- Hotel Name and Location -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold text-gray-900 leading-tight">{{ hotel.name }}</h3>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <i class="pi pi-map-marker text-gray-400"></i>
          <span>{{ hotel.city }}, {{ hotel.country }}</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-gray-100"></div>

      <!-- Information Grid -->
      <div class="space-y-3">
        <!-- Admin Information -->
        <div v-if="hotel.admin" class="flex items-center gap-3">
          <div class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-user text-purple-600 text-sm"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Admin</p>
            <p class="text-sm text-gray-900 font-medium truncate">{{ hotel.admin.username }}</p>
          </div>
        </div>

        <!-- Contact Information -->
        <div v-if="hotel.email" class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-envelope text-blue-600 text-sm"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
            <p class="text-sm text-gray-900 truncate">{{ hotel.email }}</p>
          </div>
        </div>

        <div v-if="hotel.phone" class="flex items-center gap-3">
          <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-phone text-green-600 text-sm"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
            <p class="text-sm text-gray-900 truncate">{{ hotel.phone }}</p>
          </div>
        </div>

        <!-- Address Information -->
        <div v-if="hotel.address" class="flex items-start gap-3">
          <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <i class="pi pi-home text-amber-600 text-sm"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
            <p class="text-sm text-gray-900 line-clamp-2">{{ hotel.address }}</p>
          </div>
        </div>

        <!-- Documents Count (if available) -->
        <div v-if="hotel.documents && hotel.documents.length > 0" class="flex items-center gap-3">
          <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-file text-indigo-600 text-sm"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Documents</p>
            <p class="text-sm text-gray-900">{{ hotel.documents.length }} file{{ hotel.documents.length !== 1 ? 's' : '' }}</p>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-4 border-t border-gray-100">
        <Button
          label="View Details"
          icon="pi pi-arrow-right"
          icon-pos="right"
          @click="$emit('view-details', hotel)"
          class="w-full"
          severity="secondary"
          variant="outlined"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import StatusBadge from './StatusBadge.vue';
import type { Hotel } from '~/composables/useHotel';

defineProps<{
  hotel: Hotel;
}>();

defineEmits<{
  (e: 'view-details', hotel: Hotel): void;
}>();
</script>