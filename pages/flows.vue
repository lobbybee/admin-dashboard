<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">

      <!-- Header -->
      <header class="animate-fade-slide-down">
        <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <i class="pi pi-sitemap text-primary-500"></i> Flow Management
        </h1>
        <p class="text-gray-500">Design and manage conversational flows for your hotel.</p>
      </header>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8" style="height: calc(100vh - 150px);">
        <!-- Left Column: Flow Templates List -->
        <div class="md:col-span-4 lg:col-span-3">
          <FlowTemplateList
            ref="templateListRef"
            :selected-template-id="selectedTemplate?.id || null"
            @template-selected="onTemplateSelected"
            @template-updated="handleTemplateUpdate"
          />
        </div>

        <!-- Right Column: Flow Steps Editor -->
        <div class="md:col-span-8 lg:col-span-9">
          <FlowEditor
            :template="selectedTemplate"
            @edit-template="editTemplate"
            @delete-template="confirmDeleteTemplate"
          />
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialogVisible" header="Confirm Delete" :modal="true" :style="{ width: '450px' }" :draggable="false">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
        <span v-if="templateToDelete">
          Are you sure you want to delete <b>{{ templateToDelete.name }}</b>? This action cannot be undone.
        </span>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="deleteDialogVisible = false" />
        <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteTemplate" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import FlowTemplateList from '~/components/FlowTemplateList.vue';
import FlowEditor from '~/components/FlowEditor.vue';
import { useDeleteFlowTemplate } from '~/composables/useFlowTemplate';

const toast = useToast();
const selectedTemplate = ref<any>(null);
const templateListRef = ref<InstanceType<typeof FlowTemplateList> | null>(null);

const onTemplateSelected = (template: any) => {
  console.log('Template selected:', template);
  selectedTemplate.value = template;
};

const handleTemplateUpdate = () => {
  // When a template is created/updated, we might need to refresh the list
  // The list component handles its own refetch, but we might want to clear the selection
};

// --- Delete Logic ---
const { mutateAsync: deleteFlowTemplateApi } = useDeleteFlowTemplate();
const deleteDialogVisible = ref(false);
const templateToDelete = ref<any>(null);

const confirmDeleteTemplate = (template: any) => {
  templateToDelete.value = template;
  deleteDialogVisible.value = true;
};

const deleteTemplate = async () => {
  if (templateToDelete.value) {
    try {
      await deleteFlowTemplateApi(templateToDelete.value.id);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Flow template deleted', life: 3000 });
      selectedTemplate.value = null; // Clear selection
      templateListRef.value?.refetch(); // This assumes templateListRef has a refetch method exposed
    } catch (err) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete template', life: 5000 });
    }
  }
  deleteDialogVisible.value = false;
};

// --- Edit Logic ---
const editTemplate = (template: any) => {
  templateListRef.value?.openEditFlowTemplateForm(template);
};

</script>
