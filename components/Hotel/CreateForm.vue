<template>
  <form @submit.prevent="onSubmit" class="space-y-8">
    <!-- Hotel Information Section -->
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <i class="pi pi-building text-blue-600 text-sm"></i>
        </div>
        <div>
          <h3 class="text-base font-semibold text-gray-900">Hotel Information</h3>
          <p class="text-sm text-gray-600">Basic details about the hotel</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label for="hotel_name" class="block text-sm font-medium text-gray-700">
            Hotel Name <span class="text-red-500">*</span>
          </label>
          <InputText
            id="hotel_name"
            v-model="formData.hotel_name"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-100': errors.hotel_name }"
            placeholder="Enter hotel name"
            class="w-full"
          />
          <small v-if="errors.hotel_name" class="text-red-500 text-sm">
            {{ errors.hotel_name?._errors[0] }}
          </small>
          <small v-else class="text-gray-500 text-sm">The official name of the hotel</small>
        </div>

        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-700">
            Admin Email <span class="text-red-500">*</span>
          </label>
          <InputText
            id="email"
            v-model="formData.email"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-100': errors.email }"
            placeholder="admin@hotel.com"
            class="w-full"
          />
          <small v-if="errors.email" class="text-red-500 text-sm">
            {{ errors.email?._errors[0] }}
          </small>
          <small v-else class="text-gray-500 text-sm">Email address for hotel administrator</small>
        </div>
      </div>
    </div>

    <!-- Admin Account Section -->
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
          <i class="pi pi-user text-purple-600 text-sm"></i>
        </div>
        <div>
          <h3 class="text-base font-semibold text-gray-900">Admin Account</h3>
          <p class="text-sm text-gray-600">Create administrator credentials</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label for="username" class="block text-sm font-medium text-gray-700">
            Username <span class="text-red-500">*</span>
          </label>
          <InputText
            id="username"
            v-model="formData.username"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-100': errors.username }"
            placeholder="Enter username"
            class="w-full"
          />
          <small v-if="errors.username" class="text-red-500 text-sm">
            {{ errors.username?._errors[0] }}
          </small>
          <small v-else class="text-gray-500 text-sm">Unique username for admin login</small>
        </div>

        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password <span class="text-red-500">*</span>
          </label>
          <Password
            id="password"
            v-model="formData.password"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-100': errors.password }"
            :feedback="false"
            toggleMask
            placeholder="Enter password"
            class="w-full"
          />
          <small v-if="errors.password" class="text-red-500 text-sm">
            {{ errors.password?._errors[0] }}
          </small>
          <small v-else class="text-gray-500 text-sm">Minimum 8 characters</small>
        </div>

        <div class="space-y-2">
          <label for="first_name" class="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <InputText
            id="first_name"
            v-model="formData.first_name"
            placeholder="Enter first name"
            class="w-full"
          />
          <small class="text-gray-500 text-sm">Administrator's first name</small>
        </div>

        <div class="space-y-2">
          <label for="last_name" class="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <InputText
            id="last_name"
            v-model="formData.last_name"
            placeholder="Enter last name"
            class="w-full"
          />
          <small class="text-gray-500 text-sm">Administrator's last name</small>
        </div>
      </div>
    </div>

    <!-- Contact Information Section -->
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
          <i class="pi pi-phone text-green-600 text-sm"></i>
        </div>
        <div>
          <h3 class="text-base font-semibold text-gray-900">Contact Information</h3>
          <p class="text-sm text-gray-600">Additional contact details</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2 md:col-span-2">
          <label for="phone_number" class="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <InputText
            id="phone_number"
            v-model="formData.phone_number"
            placeholder="Enter phone number"
            class="w-full"
          />
          <small class="text-gray-500 text-sm">Contact phone number for the hotel</small>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
      <Button
        type="button"
        label="Cancel"
        icon="pi pi-times"
        severity="secondary"
        variant="outlined"
        @click="$emit('cancel')"
        class="w-full sm:w-auto"
      />
      <Button
        type="submit"
        label="Create Hotel"
        icon="pi pi-check"
        :loading="isSubmitting"
        class="w-full sm:w-auto"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { z } from 'zod';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import type { CreateHotelData } from '~/types/hotel';

const emit = defineEmits<{
  (e: 'submit', data: CreateHotelData): void;
  (e: 'cancel'): void;
}>();

const validationSchema = z.object({
  hotel_name: z.string().min(1, 'Hotel name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().optional(),
});

const formData = reactive<CreateHotelData>({
  hotel_name: '',
  email: '',
  username: '',
  password: '',
  first_name: '',
  last_name: '',
  phone_number: '',
});

const errors = ref<z.ZodFormattedError<CreateHotelData> | {}>({});
const isSubmitting = ref(false);

const onSubmit = async () => {
  const result = validationSchema.safeParse(formData);
  if (!result.success) {
    errors.value = result.error.format();
    return;
  }

  errors.value = {};
  isSubmitting.value = true;
  try {
    emit('submit', result.data);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
