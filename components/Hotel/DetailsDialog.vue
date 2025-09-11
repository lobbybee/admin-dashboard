<template>
  <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :header="`Hotel Details: ${hotel?.name}`" modal style="width: 60vw; max-width: 900px;">
    <div v-if="hotel">
      <TabView class="pt-2">
        <TabPanel header="General Information">
          <div class="flex flex-col gap-6 p-4">
            <Panel header="Hotel Details">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Name:</strong> {{ hotel.name }}</div>
                <div><strong>Status:</strong> <Tag :value="hotel.status" :severity="getStatusSeverity(hotel.status)" /></div>
                <div class="col-span-full"><strong>Description:</strong> <p class="pl-2 border-l-2">{{ hotel.description || 'N/A' }}</p></div>
              </div>
            </Panel>
            <Panel header="Location & Contact">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Address:</strong> {{ hotel.address }}, {{ hotel.city }}, {{ hotel.state }} {{ hotel.pincode }}</div>
                <div><strong>Country:</strong> {{ hotel.country }}</div>
                <div><strong>Phone:</strong> {{ hotel.phone }}</div>
                <div><strong>Email:</strong> {{ hotel.email }}</div>
              </div>
            </Panel>
          </div>
        </TabPanel>

        <TabPanel header="Documents">
            <DataTable :value="hotel.documents" responsiveLayout="scroll" :paginator="hotel.documents.length > 5" :rows="5">
                <template #header>
                    <div class="text-xl font-bold">Uploaded Documents</div>
                </template>
                <Column field="document_type" header="Type" sortable></Column>
                <Column field="uploaded_at" header="Upload Date" sortable>
                    <template #body="{data}">{{ new Date(data.uploaded_at).toLocaleDateString() }}</template>
                </Column>
                <Column header="Link">
                    <template #body="{data}">
                        <a :href="data.document_file" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:underline">
                            View Document <i class="pi pi-external-link ml-1"></i>
                        </a>
                    </template>
                </Column>
                 <template #empty>
                    No documents found.
                </template>
            </DataTable>
        </TabPanel>

        <TabPanel header="Admin">
            <div class="p-4 flex items-center gap-4" v-if="hotel && hotel.admin">
                <Avatar icon="pi pi-user" size="xlarge" shape="circle" />
                <div>
                    <h3 class="text-xl font-bold">{{ hotel.admin.username }}</h3>
                    <p class="text-gray-500">{{ hotel.admin.user_type }}</p>
                </div>
            </div>
            <div v-else>
                <p class="p-4">No admin information available.</p>
            </div>
            <Panel header="Admin Contact" v-if="hotel && hotel.admin">
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><strong>Email:</strong> {{ hotel.admin.email }}</div>
                    <div><strong>Phone:</strong> {{ hotel.admin.phone_number }}</div>
                </div>
            </Panel>
        </TabPanel>

        <TabPanel header="Actions">
            <div class="p-4">
                <div v-if="hotel.status === 'pending'" class="flex flex-col gap-4">
                    <h3 class="text-xl font-bold">Review Application</h3>
                    <div>
                        <label for="verificationNotes" class="block mb-2">Notes (Required for Rejection)</label>
                        <Textarea v-model="verificationNotes" id="verificationNotes" placeholder="Add verification or rejection notes..." rows="4" class="w-full"/>
                    </div>
                    <div class="flex justify-end gap-2">
                        <Button label="Reject" icon="pi pi-times" @click="onRejectHotel" :loading="rejectLoading" class="p-button-danger" />
                        <Button label="Verify" icon="pi pi-check" @click="onVerifyHotel" :loading="verifyLoading" class="p-button-success" />
                    </div>
                </div>

                <div v-else-if="hotel.status === 'verified'" class="flex flex-col gap-4">
                     <h3 class="text-xl font-bold">Manage Hotel Status</h3>
                     <div class="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <p class="font-bold">Hotel Active Status</p>
                            <p>The hotel is currently <Tag :value="hotel.is_active ? 'Active' : 'Inactive'" :severity="hotel.is_active ? 'success' : 'warning'"></Tag>.</p>
                        </div>
                        <Button
                            :label="hotel.is_active ? 'Deactivate' : 'Activate'"
                            :icon="hotel.is_active ? 'pi pi-times-circle' : 'pi pi-check-circle'"
                            @click="onToggleActive"
                            :loading="toggleActiveLoading"
                            :class="{'p-button-danger': hotel.is_active}"
                        />
                     </div>
                </div>

                <div v-else>
                    <p>No actions available for a hotel with status: {{ hotel.status }}</p>
                </div>
            </div>
        </TabPanel>
      </TabView>
    </div>
    <div v-else class="text-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import Textarea from 'primevue/textarea';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Panel from 'primevue/panel';
import Avatar from 'primevue/avatar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast';
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
