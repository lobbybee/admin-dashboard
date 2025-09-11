<template>
<form @submit.prevent="onSubmit">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="flex flex-col gap-2">
      <label for="hotel_name">Hotel Name</label>
      <InputText id="hotel_name" v-model="formData.hotel_name" :invalid="!!errors.hotel_name" placeholder="Enter hotel name" />
      <small class="p-error">{{ errors.hotel_name?._errors[0] }}</small>
    </div>
    <div class="flex flex-col gap-2">
      <label for="email">Admin Email</label>
      <InputText id="email" v-model="formData.email" :invalid="!!errors.email" placeholder="admin@hotel.com" />
      <small class="p-error">{{ errors.email?._errors[0] }}</small>
    </div>
    <div class="flex flex-col gap-2">
      <label for="username">Admin Username</label>
      <InputText id="username" v-model="formData.username" :invalid="!!errors.username" placeholder="Enter username" />
      <small class="p-error">{{ errors.username?._errors[0] }}</small>
    </div>
    <div class="flex flex-col gap-2">
      <label for="password">Admin Password</label>
      <Password id="password" v-model="formData.password" :invalid="!!errors.password" :feedback="false" toggleMask placeholder="Enter password" />
      <small class="p-error">{{ errors.password?._errors[0] }}</small>
    </div>
    <div class="flex flex-col gap-2">
      <label for="first_name">Admin First Name</label>
      <InputText id="first_name" v-model="formData.first_name" placeholder="Enter first name" />
    </div>
    <div class="flex flex-col gap-2">
      <label for="last_name">Admin Last Name</label>
      <InputText id="last_name" v-model="formData.last_name" placeholder="Enter last name" />
    </div>
    <div class="flex flex-col gap-2 col-span-full">
      <label for="phone_number">Phone Number</label>
      <InputText id="phone_number" v-model="formData.phone_number" placeholder="Enter phone number" />
    </div>
  </div>
  <div class="flex justify-end gap-2 mt-4">
    <Button type="button" label="Cancel" severity="secondary" @click="$emit('cancel')" />
    <Button type="submit" label="Create" :loading="isSubmitting" />
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
