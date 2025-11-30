<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :header="`Hotel Details: ${hotel?.name}`"
    modal
    class="w-full max-w-4xl"
    :content-style="{ padding: 0 }"
  >
    <div v-if="hotel">
      <TabView class="pt-0">
        <TabPanel header="General Information">
          <div class="space-y-6 p-6">
            <!-- Hotel Details Card -->
            <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <i class="pi pi-building text-blue-600 text-xl"></i>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">Hotel Details</h3>
                  <p class="text-sm text-gray-600">Basic information and status</p>
                </div>
                <StatusBadge :status="hotel.status" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-700">Hotel Name</p>
                  <p class="text-gray-900 font-medium">{{ hotel.name }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-700">Status</p>
                  <StatusBadge :status="hotel.status" />
                </div>
                <div class="md:col-span-2 space-y-1">
                  <p class="text-sm font-medium text-gray-700">Description</p>
                  <p class="text-gray-700">{{ hotel.description || 'No description available' }}</p>
                </div>
              </div>
            </div>

            <!-- Location & Contact Card -->
            <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                  <i class="pi pi-map-marker text-amber-600 text-xl"></i>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">Location & Contact</h3>
                  <p class="text-sm text-gray-600">Address and contact information</p>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-700">Full Address</p>
                  <p class="text-gray-900">
                    {{ hotel.address }}, {{ hotel.city }}, {{ hotel.state }} {{ hotel.pincode }}
                  </p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-700">Country</p>
                  <p class="text-gray-900 font-medium">{{ hotel.country }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-700">Phone</p>
                  <p class="text-gray-900">{{ hotel.phone || 'Not provided' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-700">Email</p>
                  <p class="text-gray-900">{{ hotel.email || 'Not provided' }}</p>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Documents">
          <div class="p-6">
            <div v-if="hotel.documents && hotel.documents.length > 0">
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <DataTable
                  :value="hotel.documents"
                  :paginator="hotel.documents.length > 5"
                  :rows="5"
                  class="border-0"
                >
                  <template #header>
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <i class="pi pi-file text-indigo-600"></i>
                      </div>
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
                        <p class="text-sm text-gray-600">Hotel verification documents</p>
                      </div>
                    </div>
                  </template>
                  <Column field="document_type" header="Document Type" sortable>
                    <template #body="{ data }">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-gray-50 rounded flex items-center justify-center">
                          <i class="pi pi-file-pdf text-red-500 text-sm"></i>
                        </div>
                        <span class="font-medium text-gray-900">{{ data.document_type }}</span>
                      </div>
                    </template>
                  </Column>
                  <Column field="uploaded_at" header="Upload Date" sortable>
                    <template #body="{data}">
                      <div class="text-gray-700">
                        {{ new Date(data.uploaded_at).toLocaleDateString() }}
                      </div>
                    </template>
                  </Column>
                  <Column header="Actions">
                    <template #body="{data}">
                      <a
                        :href="data.document_file_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <i class="pi pi-eye"></i>
                        View Document
                      </a>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </div>
            <div v-else class="text-center py-12">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-file text-gray-400 text-2xl"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p class="text-gray-500">No documents have been uploaded for this hotel</p>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Admin">
          <div class="p-6">
            <div v-if="hotel && hotel.admin">
              <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center">
                    <i class="pi pi-user text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">{{ hotel.admin.username }}</h3>
                    <p class="text-sm text-gray-600">{{ hotel.admin.user_type }}</p>
                  </div>
                  <div class="ml-auto">
                    <StatusBadge :status="hotel.admin.status || 'active'" />
                  </div>
                </div>

                <div class="border-t border-gray-200 pt-4">
                  <h4 class="text-sm font-semibold text-gray-900 mb-3">Admin Contact Information</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <i class="pi pi-envelope text-blue-600 text-sm"></i>
                      </div>
                      <div>
                        <p class="text-xs font-medium text-gray-700">Email</p>
                        <p class="text-sm text-gray-900">{{ hotel.admin.email }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <i class="pi pi-phone text-green-600 text-sm"></i>
                      </div>
                      <div>
                        <p class="text-xs font-medium text-gray-700">Phone</p>
                        <p class="text-sm text-gray-900">{{ hotel.admin.phone_number || 'Not provided' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-user text-gray-400 text-2xl"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No admin information</h3>
              <p class="text-gray-500">Admin information is not available for this hotel</p>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Actions">
          <div class="p-6">
            <div v-if="hotel.status === 'pending'" class="space-y-6">
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <i class="pi pi-exclamation-triangle text-amber-400 text-xl"></i>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-amber-800">Review Application</h3>
                    <p class="mt-1 text-sm text-amber-700">
                      This hotel application is pending review. Please verify the documents and information before approval.
                    </p>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Verification Actions</h3>

                <div class="space-y-2">
                  <label for="verificationNotes" class="block text-sm font-medium text-gray-700">
                    Notes <span class="text-red-500">*</span> <span class="text-gray-500">(Required for rejection)</span>
                  </label>
                  <Textarea
                    v-model="verificationNotes"
                    id="verificationNotes"
                    placeholder="Add verification notes or rejection reasons..."
                    rows="4"
                    class="w-full"
                  />
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    label="Reject Application"
                    icon="pi pi-times"
                    @click="onRejectHotel"
                    :loading="rejectLoading"
                    severity="danger"
                    size="large"
                  />
                  <Button
                    label="Verify & Approve"
                    icon="pi pi-check"
                    @click="onVerifyHotel"
                    :loading="verifyLoading"
                    severity="success"
                    size="large"
                  />
                </div>
              </div>
            </div>

            <div v-else-if="hotel.status === 'verified'" class="space-y-6">
              <h3 class="text-lg font-semibold text-gray-900">Hotel Management</h3>

              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-base font-medium text-gray-900 mb-2">Hotel Active Status</h4>
                    <p class="text-sm text-gray-600 mb-3">
                      The hotel is currently
                      <StatusBadge
                        :status="hotel.is_active ? 'active' : 'inactive'"
                        class="inline-flex ml-1"
                      />
                    </p>
                  </div>
                  <Button
                    :label="hotel.is_active ? 'Deactivate Hotel' : 'Activate Hotel'"
                    :icon="hotel.is_active ? 'pi pi-times-circle' : 'pi pi-check-circle'"
                    @click="onToggleActive"
                    :loading="toggleActiveLoading"
                    :severity="hotel.is_active ? 'danger' : 'success'"
                    size="large"
                  />
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-info-circle text-gray-400 text-2xl"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No actions available</h3>
              <p class="text-gray-500">No actions are available for a hotel with status: <span class="font-medium">{{ hotel.status }}</span></p>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
    <div v-else class="flex items-center justify-center p-8">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading hotel details...</p>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast';
import StatusBadge from './StatusBadge.vue';
import { useVerifyHotel, useToggleHotelActive, useRejectHotel, type Hotel } from '~/composables/useHotel';

const props = defineProps<{
  hotel: Hotel | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'hotel-updated'): void;
}>();

const toast = useToast();
const verificationNotes = ref('');

const { verifyHotel, isLoading: verifyLoading } = useVerifyHotel();
const { toggleHotelActive, isLoading: toggleActiveLoading } = useToggleHotelActive();
const { rejectHotel, isLoading: rejectLoading } = useRejectHotel();

watch(() => props.hotel, (newHotel) => {
    if (newHotel) {
        verificationNotes.value = newHotel.verification_notes || '';
    }
});

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'verified': return 'success';
    case 'pending': return 'warning';
    case 'suspended': return 'danger';
    case 'rejected': return 'danger';
    default: return 'info';
  }
};

const onVerifyHotel = async () => {
  if (!props.hotel) return;
  try {
    await verifyHotel({
      id: props.hotel.id,
      data: { notes: verificationNotes.value },
    });
    toast.add({ severity: 'success', summary: 'Success', detail: 'Hotel verified successfully!', life: 3000 });
    emit('update:visible', false);
    emit('hotel-updated');
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to verify hotel.', life: 3000 });
  }
};

const onRejectHotel = async () => {
  if (!props.hotel) return;
  if (!verificationNotes.value) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Rejection notes are required.', life: 3000 });
    return;
  }
  try {
    await rejectHotel({
      id: props.hotel.id,
      data: { notes: verificationNotes.value },
    });
    toast.add({ severity: 'success', summary: 'Success', detail: 'Hotel rejected successfully!', life: 3000 });
    emit('update:visible', false);
    emit('hotel-updated');
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to reject hotel.', life: 3000 });
  }
};

const onToggleActive = async () => {
  if (!props.hotel) return;
  try {
    const response = await toggleHotelActive(props.hotel.id);
    toast.add({ severity: 'success', summary: 'Success', detail: response.status, life: 3000 });
    emit('update:visible', false);
    emit('hotel-updated');
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to update hotel status.', life: 3000 });
  }
};
</script>
