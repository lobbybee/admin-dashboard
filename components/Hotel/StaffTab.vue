<template>
    <div class="px-4 py-3 md:p-6">
        <div class="flex items-center gap-3 md:gap-4 mb-4">
            <div
                class="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-lg flex items-center justify-center"
            >
                <i class="pi pi-users text-purple-600 text-lg md:text-xl"></i>
            </div>
            <div class="flex-1">
                <h3 class="text-base md:text-lg font-semibold text-gray-900">
                    Hotel Staff
                </h3>
                <p class="text-sm text-gray-600">
                    All accounts belonging to this hotel
                </p>
            </div>
        </div>

        <div v-if="isLoading" class="text-center py-12">
            <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
            ></div>
            <p class="text-gray-600">Loading staff...</p>
        </div>

        <div v-else-if="!staff?.length" class="text-center py-12">
            <div
                class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
                <i class="pi pi-users text-gray-400 text-2xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
                No staff accounts
            </h3>
            <p class="text-gray-500">This hotel has no user accounts yet.</p>
        </div>

        <DataTable v-else :value="staff" data-key="id" class="text-sm">
            <Column field="username" header="Username">
                <template #body="{ data }">
                    <div>
                        <p class="font-medium text-gray-900">
                            {{ data.username }}
                        </p>
                        <p class="text-xs text-gray-500">{{ data.email }}</p>
                    </div>
                </template>
            </Column>
            <Column field="user_type" header="Role">
                <template #body="{ data }">
                    <Tag
                        :value="roleLabel(data.user_type)"
                        severity="secondary"
                    />
                </template>
            </Column>
            <Column field="is_active_hotel_user" header="Status">
                <template #body="{ data }">
                    <Tag
                        :value="data.is_active_hotel_user ? 'Active' : 'Inactive'"
                        :severity="data.is_active_hotel_user ? 'success' : 'danger'"
                    />
                </template>
            </Column>
            <Column header="Actions" class="w-1">
                <template #body="{ data }">
                    <Button
                        label="Reset Password"
                        icon="pi pi-key"
                        size="small"
                        severity="secondary"
                        variant="outlined"
                        @click="openReset(data)"
                    />
                </template>
            </Column>
        </DataTable>

        <Dialog
            v-model:visible="resetDialogVisible"
            modal
            :header="`Reset password: ${selectedUser?.username ?? ''}`"
            class="w-full max-w-md"
        >
            <div class="space-y-4">
                <Message severity="warn" :closable="false">
                    This immediately replaces the account's password. Share the
                    new one with the staff member directly.
                </Message>

                <div class="space-y-2">
                    <label
                        for="new_password"
                        class="block text-sm font-medium text-gray-700"
                    >
                        New Password <span class="text-red-500">*</span>
                    </label>
                    <Password
                        id="new_password"
                        v-model="newPassword"
                        :feedback="false"
                        toggle-mask
                        placeholder="Enter new password"
                        fluid
                    />
                    <small v-if="error" class="text-red-500 text-sm block">
                        {{ error }}
                    </small>
                    <small v-else class="text-gray-500 text-sm block">
                        Minimum 8 characters
                    </small>
                </div>

                <div class="space-y-2">
                    <label
                        for="confirm_password"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Confirm Password <span class="text-red-500">*</span>
                    </label>
                    <Password
                        id="confirm_password"
                        v-model="confirmPassword"
                        :feedback="false"
                        toggle-mask
                        placeholder="Re-enter new password"
                        fluid
                    />
                </div>
            </div>

            <template #footer>
                <Button
                    label="Cancel"
                    icon="pi pi-times"
                    severity="secondary"
                    variant="outlined"
                    :disabled="isResetting"
                    @click="resetDialogVisible = false"
                />
                <Button
                    label="Reset Password"
                    icon="pi pi-check"
                    severity="danger"
                    :loading="isResetting"
                    @click="submitReset"
                />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Password from "primevue/password";
import Message from "primevue/message";
import Tag from "primevue/tag";
import { useToast } from "primevue/usetoast";
import {
    useFetchHotelStaff,
    useResetHotelStaffPassword,
} from "~/composables/useHotel";
import type { HotelStaffUser } from "~/types/hotel";

const props = defineProps<{ hotelId: string }>();

const toast = useToast();
const { getErrorMessage } = useAPIHelper();
const { data: staff, isLoading } = useFetchHotelStaff(toRef(props, "hotelId"));
const { resetStaffPassword, isLoading: isResetting } =
    useResetHotelStaffPassword();

const ROLE_LABELS: Record<string, string> = {
    hotel_admin: "Hotel Admin",
    manager: "Manager",
    receptionist: "Receptionist",
    department_staff: "Department Staff",
    other_staff: "Other Staff",
};

const roleLabel = (type: string) => ROLE_LABELS[type] || type;

const resetDialogVisible = ref(false);
const selectedUser = ref<HotelStaffUser | null>(null);
const newPassword = ref("");
const confirmPassword = ref("");
const error = ref("");

const openReset = (user: HotelStaffUser) => {
    selectedUser.value = user;
    resetDialogVisible.value = true;
};

// Clear the fields whenever the dialog closes so a password never lingers in memory
watch(resetDialogVisible, (visible) => {
    if (!visible) {
        newPassword.value = "";
        confirmPassword.value = "";
        error.value = "";
    }
});

const submitReset = async () => {
    if (!selectedUser.value) return;

    if (newPassword.value.length < 8) {
        error.value = "Password must be at least 8 characters";
        return;
    }
    if (newPassword.value !== confirmPassword.value) {
        error.value = "Passwords do not match";
        return;
    }
    error.value = "";

    try {
        await resetStaffPassword({
            hotelId: props.hotelId,
            data: {
                user_id: selectedUser.value.id,
                new_password: newPassword.value,
            },
        });
        toast.add({
            severity: "success",
            summary: "Password reset",
            detail: `Password updated for ${selectedUser.value.username}.`,
            life: 3000,
        });
        resetDialogVisible.value = false;
    } catch (e: any) {
        // Django's password validators come back as the response message
        error.value = getErrorMessage(e);
    }
};
</script>
