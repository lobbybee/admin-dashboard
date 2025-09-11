<template>
  <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :header="`${isEdit ? 'Edit' : 'Add'} Staff User`" modal style="width: 50vw; max-width: 600px;">
    <div class="p-4">
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="username" class="block mb-2">Username *</label>
            <InputText
              id="username"
              v-model="formData.username"
              :disabled="isEdit"
              class="w-full"
              :class="{ 'p-invalid': errors.username }"
            />
            <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
          </div>
          
          <div>
            <label for="email" class="block mb-2">Email *</label>
            <InputText
              id="email"
              v-model="formData.email"
              type="email"
              class="w-full"
              :class="{ 'p-invalid': errors.email }"
            />
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
          </div>
        </div>
        
        <div v-if="!isEdit" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="password" class="block mb-2">Password *</label>
            <Password
              id="password"
              v-model="formData.password"
              class="w-full"
              :class="{ 'p-invalid': errors.password }"
              toggle-mask
              :feedback="false"
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>
          
          <div>
            <label for="confirmPassword" class="block mb-2">Confirm Password *</label>
            <Password
              id="confirmPassword"
              v-model="formData.confirmPassword"
              class="w-full"
              :class="{ 'p-invalid': errors.confirmPassword }"
              toggle-mask
              :feedback="false"
            />
            <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="userType" class="block mb-2">User Type *</label>
            <Select
              id="userType"
              v-model="formData.user_type"
              :options="userTypeOptions"
              option-label="label"
              option-value="value"
              class="w-full"
              :class="{ 'p-invalid': errors.user_type }"
            />
            <small v-if="errors.user_type" class="p-error">{{ errors.user_type }}</small>
          </div>
          
          <div>
            <label for="phone" class="block mb-2">Phone Number</label>
            <InputText
              id="phone"
              v-model="formData.phone_number"
              class="w-full"
              :class="{ 'p-invalid': errors.phone_number }"
            />
            <small v-if="errors.phone_number" class="p-error">{{ errors.phone_number }}</small>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="$emit('update:visible', false)" class="p-button-text" />
      <Button :label="isEdit ? 'Update' : 'Create'" icon="pi pi-check" @click="handleSubmit" :loading="loading" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Select from 'primevue/select';
import type { StaffUser, StaffUserCreateRequest, StaffUserUpdateRequest } from '~/types/staff';

const props = defineProps<{
  visible: boolean;
  user?: StaffUser | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: StaffUserCreateRequest | StaffUserUpdateRequest, isEdit: boolean, id?: string): void;
}>();

const isEdit = computed(() => !!props.user);

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  user_type: 'platform_staff',
  phone_number: ''
});

const errors = ref<Record<string, string>>({});

const userTypeOptions = [
  { label: 'Platform Admin', value: 'platform_admin' },
  { label: 'Platform Staff', value: 'platform_staff' }
];

// Reset form when user changes
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      username: newUser.username,
      email: newUser.email,
      password: '',
      confirmPassword: '',
      user_type: newUser.user_type,
      phone_number: newUser.phone_number || ''
    };
  } else {
    formData.value = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      user_type: 'platform_staff',
      phone_number: ''
    };
  }
  errors.value = {};
}, { immediate: true });

const validateForm = () => {
  errors.value = {};
  
  if (!formData.value.username.trim()) {
    errors.value.username = 'Username is required';
  }
  
  if (!formData.value.email.trim()) {
    errors.value.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
    errors.value.email = 'Invalid email format';
  }
  
  if (!isEdit.value) {
    if (!formData.value.password) {
      errors.value.password = 'Password is required';
    } else if (formData.value.password.length < 8) {
      errors.value.password = 'Password must be at least 8 characters';
    }
    
    if (formData.value.password !== formData.value.confirmPassword) {
      errors.value.confirmPassword = 'Passwords do not match';
    }
  }
  
  if (!formData.value.user_type) {
    errors.value.user_type = 'User type is required';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (!validateForm()) return;
  
  if (isEdit.value && props.user) {
    // For edit, we don't send password unless it's being changed
    const updateData: StaffUserUpdateRequest = {
      username: formData.value.username,
      email: formData.value.email,
      user_type: formData.value.user_type,
      phone_number: formData.value.phone_number || undefined
    };
    
    // Only include password if it's being changed
    if (formData.value.password) {
      updateData.password = formData.value.password;
    }
    
    emit('save', updateData, true, props.user.id.toString());
  } else {
    const createData: StaffUserCreateRequest = {
      username: formData.value.username,
      email: formData.value.email,
      password: formData.value.password,
      user_type: formData.value.user_type,
      phone_number: formData.value.phone_number || undefined
    };
    
    emit('save', createData, false);
  }
};
</script>