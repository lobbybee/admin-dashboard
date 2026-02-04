<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :header="`${isEdit ? 'Edit' : 'Add'} Staff Member`"
    modal
    class="w-full max-w-2xl"
    :content-style="{ padding: '0' }"
    :header-style="{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }"
    :footer-style="{ padding: '1.5rem', borderTop: '1px solid #e5e7eb' }"
  >
    <div class="p-6">
      <!-- Form Header Description -->
      <div v-if="!isEdit" class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Create New Staff Account</h3>
        <p class="text-sm text-gray-600">Add a new staff member to your hotel management system. They will receive login credentials via email.</p>
      </div>
      <div v-else class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Edit Staff Member</h3>
        <p class="text-sm text-gray-600">Update the information for this staff member. Leave password fields empty to keep the current password.</p>
      </div>

      <!-- Form Content -->
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Account Information Section -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-900 flex items-center gap-2">
            <div class="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-xs font-medium text-blue-600">1</span>
            </div>
            Account Information
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Username Field -->
            <div class="space-y-1">
              <label for="username" class="block text-sm font-medium text-gray-700">
                Username <span class="text-red-500">*</span>
              </label>
              <InputText
                id="username"
                v-model="formData.username"
                type="text"
                :disabled="isEdit"
                :class="{ 'p-invalid': errors?.username || serverErrors.username }"
                :aria-invalid="errors?.username || serverErrors.username ? 'true' : 'false'"
                :aria-describedby="errors?.username || serverErrors.username ? 'username-error' : 'username-help'"
                placeholder="Enter username"
                class="w-full"
              />
              <small v-if="!errors?.username && !serverErrors.username" id="username-help" class="text-gray-500 text-xs block">
                Unique identifier for the staff member
              </small>
              <small v-if="errors?.username" id="username-error" class="p-error text-sm mt-1 block" role="alert">
                {{ errors.username._errors[0] }}
              </small>
              <small v-else-if="serverErrors.username" id="username-error" class="p-error text-sm mt-1 block" role="alert">
                {{ serverErrors.username }}
              </small>
            </div>

            <!-- Email Field -->
            <div class="space-y-1">
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email Address <span class="text-red-500">*</span>
              </label>
              <InputText
                id="email"
                v-model="formData.email"
                type="email"
                :class="{ 'p-invalid': errors?.email || serverErrors.email }"
                :aria-invalid="errors?.email || serverErrors.email ? 'true' : 'false'"
                :aria-describedby="errors?.email || serverErrors.email ? 'email-error' : 'email-help'"
                placeholder="staff@example.com"
                class="w-full"
              />
              <small v-if="!errors?.email && !serverErrors.email" id="email-help" class="text-gray-500 text-xs block">
                Staff member's professional email address
              </small>
              <small v-if="errors?.email" id="email-error" class="p-error text-sm mt-1 block" role="alert">
                {{ errors.email._errors[0] }}
              </small>
              <small v-else-if="serverErrors.email" id="email-error" class="p-error text-sm mt-1 block" role="alert">
                {{ serverErrors.email }}
              </small>
            </div>
          </div>
        </div>

        <!-- Password Section (only for new users) -->
        <div v-if="!isEdit" class="space-y-4">
          <h4 class="text-sm font-medium text-gray-900 flex items-center gap-2">
            <div class="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-xs font-medium text-blue-600">2</span>
            </div>
            Security Information
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Password Field -->
            <div class="space-y-1">
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password <span class="text-red-500">*</span>
              </label>
              <Password
                id="password"
                v-model="formData.password"
                :class="{ 'p-invalid': errors?.password }"
                :aria-invalid="errors?.password ? 'true' : 'false'"
                :aria-describedby="errors?.password ? 'password-error' : 'password-help'"
                placeholder="Enter secure password"
                toggle-mask
                :feedback="false"
                class="w-full"
              />
              <small v-if="!errors?.password" id="password-help" class="text-gray-500 text-xs block">
                Minimum 8 characters with a mix of letters and numbers
              </small>
              <small v-if="errors?.password" id="password-error" class="p-error text-sm mt-1 block" role="alert">
                {{ errors.password._errors[0] }}
              </small>
            </div>

            <!-- Confirm Password Field -->
            <div class="space-y-1">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirm Password <span class="text-red-500">*</span>
              </label>
              <Password
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :class="{ 'p-invalid': errors?.confirmPassword }"
                :aria-invalid="errors?.confirmPassword ? 'true' : 'false'"
                :aria-describedby="errors?.confirmPassword ? 'confirm-password-error' : 'confirm-password-help'"
                placeholder="Re-enter password"
                toggle-mask
                :feedback="false"
                class="w-full"
              />
              <small v-if="!errors?.confirmPassword" id="confirm-password-help" class="text-gray-500 text-xs block">
                Re-enter the password to confirm
              </small>
              <small v-if="errors?.confirmPassword" id="confirm-password-error" class="p-error text-sm mt-1 block" role="alert">
                {{ errors.confirmPassword._errors[0] }}
              </small>
            </div>
          </div>
        </div>

        <!-- Role and Contact Section -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-900 flex items-center gap-2">
            <div class="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-xs font-medium text-blue-600">3</span>
            </div>
            Role & Contact Information
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- User Type Field -->
            <div class="space-y-1">
              <label for="userType" class="block text-sm font-medium text-gray-700">
                User Role <span class="text-red-500">*</span>
              </label>
              <Dropdown
                id="userType"
                v-model="formData.user_type"
                :options="userTypeOptions || []"
                option-label="label"
                option-value="value"
                placeholder="Select a role"
                :class="{ 'p-invalid': errors?.user_type }"
                :aria-invalid="errors?.user_type ? 'true' : 'false'"
                :aria-describedby="errors?.user_type ? 'user-type-error' : 'user-type-help'"
                class="w-full"
              />
              <small v-if="!errors?.user_type" id="user-type-help" class="text-gray-500 text-xs block">
                Determines system permissions and access level
              </small>
              <small v-if="errors?.user_type" id="user-type-error" class="p-error text-sm mt-1 block" role="alert">
                {{ errors.user_type._errors[0] }}
              </small>
            </div>

            <!-- Phone Number Field -->
            <div class="space-y-1">
              <label for="phone" class="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <InputText
                id="phone"
                v-model="formData.phone_number"
                type="tel"
                :class="{ 'p-invalid': errors?.phone_number }"
                :aria-invalid="errors?.phone_number ? 'true' : 'false'"
                :aria-describedby="errors?.phone_number ? 'phone-error' : 'phone-help'"
                placeholder="+1 (555) 123-4567"
                class="w-full"
              />
              <small v-if="!errors?.phone_number" id="phone-help" class="text-gray-500 text-xs block">
                Optional contact number for the staff member
              </small>
              <small v-if="errors?.phone_number" id="phone-error" class="p-error text-sm mt-1 block" role="alert">
                {{ errors.phone_number._errors[0] }}
              </small>
            </div>
          </div>
        </div>
      </form>
    </div>

    <template #footer>
      <div class="flex flex-col sm:flex-row sm:justify-end gap-3">
        <button
          @click="$emit('update:visible', false)"
          class="w-full sm:w-auto px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="loading"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="loading" class="pi pi-spin pi-spinner"></i>
          <i v-else class="pi pi-check"></i>
          {{ isEdit ? 'Update Staff Member' : 'Create Staff Member' }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { z } from 'zod';
import { useDebounceFn } from '@vueuse/core';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Dropdown from 'primevue/dropdown';
import type { StaffUser, StaffUserCreateRequest, StaffUserUpdateRequest } from '~/types/staff';
import { useCheckUserExists } from '~/composables/useStaff';

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

const { checkUserExists } = useCheckUserExists();

// Initialize form data with default values
const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  user_type: 'platform_staff' as 'platform_admin' | 'platform_staff',
  phone_number: ''
});

const errors = ref<z.ZodFormattedError<any> | null>(null);
const serverErrors = ref<{ username?: string; email?: string }>({});

// Debounced validation for username/email existence check
const validateField = useDebounceFn(async (field: 'username' | 'email', value: string) => {
  if (value.length < 3) {
    serverErrors.value[field] = undefined;
    return;
  }

  // Skip username validation when editing (username is disabled)
  if (field === 'username' && isEdit.value) {
    return;
  }

  // Skip email validation if it's the same as the original
  if (field === 'email' && isEdit.value && props.user?.email === value) {
    serverErrors.value.email = undefined;
    return;
  }

  try {
    const params = field === 'username' ? { username: value } : { email: value };
    const data = await checkUserExists(params);

    if (field === 'username' && data.username_exists) {
      serverErrors.value.username = 'Username already taken';
    } else if (field === 'username') {
      serverErrors.value.username = undefined;
    }

    if (field === 'email' && data.email_exists) {
      serverErrors.value.email = 'Email already taken';
    } else if (field === 'email') {
      serverErrors.value.email = undefined;
    }
  } catch {
    // Silently fail on network errors during validation
  }
}, 500);

// Watch for username changes (only for create mode)
watch(() => formData.value.username, (newVal) => {
  if (!isEdit.value && newVal) validateField('username', newVal);
  else serverErrors.value.username = undefined;
});

// Watch for email changes
watch(() => formData.value.email, (newVal) => {
  if (newVal) validateField('email', newVal);
  else serverErrors.value.email = undefined;
});

// Define user type options as a constant to avoid reactivity issues
const userTypeOptions = [
  { label: 'Platform Admin', value: 'platform_admin' },
  { label: 'Platform Staff', value: 'platform_staff' }
];

// Reset form when user changes
watch(() => props.user, (newUser) => {
  if (newUser && typeof newUser === 'object') {
    formData.value = {
      username: newUser.username || '',
      email: newUser.email || '',
      password: '',
      confirmPassword: '',
      user_type: (newUser.user_type as 'platform_staff' | 'platform_admin') || 'platform_staff',
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
  errors.value = null;
  serverErrors.value = {};
}, { immediate: true });

// Zod Schemas
const baseSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  user_type: z.enum(['platform_admin', 'platform_staff']),
  phone_number: z.string().optional(),
});

const createSchema = baseSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const updateSchema = baseSchema.extend({
  password: z.string().optional(),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password.length >= 8;
  }
  return true;
}, {
  message: "Password must be at least 8 characters",
  path: ["password"]
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const handleSubmit = () => {
  // Check for server-side errors first
  if (serverErrors.value.username || serverErrors.value.email) {
    return;
  }

  const schema = isEdit.value ? updateSchema : createSchema;
  const result = schema.safeParse(formData.value);

  if (!result.success) {
    errors.value = result.error.format();
    return;
  }

  errors.value = null;

  if (isEdit.value && props.user) {
    // For edit, we don't send password unless it's being changed
    const updateData: StaffUserUpdateRequest = {
      username: result.data.username,
      email: result.data.email,
      user_type: result.data.user_type,
      phone_number: result.data.phone_number || undefined
    };

    // Only include password if it's being changed
    if (result.data.password && result.data.password.length > 0) {
      updateData.password = result.data.password;
    }

    emit('save', updateData, true, props.user.id.toString());
  } else {
    // For create, strict typing based on createSchema output
    // We strictly know password is created
    const data = result.data as z.infer<typeof createSchema>;
    const createData: StaffUserCreateRequest = {
      username: data.username,
      email: data.email,
      password: data.password,
      user_type: data.user_type,
      phone_number: data.phone_number || undefined
    };

    emit('save', createData, false);
  }
};
</script>
