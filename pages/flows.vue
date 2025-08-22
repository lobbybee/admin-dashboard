<template>
  <div class="flex h-screen">
    <div class="w-1/4 bg-gray-100 p-4 overflow-y-auto border-r">
      <h2 class="text-lg font-semibold mb-4">Flow Templates</h2>
      <FlowTemplateList 
        @template-selected="onTemplateSelected"
        @create="openNewTemplateDialog"
        @edit="openEditTemplateDialog"
        @delete="deleteTemplate"
      />
    </div>

    <div class="w-3/4 p-4 overflow-y-auto">
      <FlowEditor :flow-template-id="selectedTemplateId" />
    </div>

    <FlowTemplateDialog
      v-if="isTemplateDialogVisible"
      :template="editingTemplate"
      @close="closeTemplateDialog"
      @save="saveTemplate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FlowTemplateList from '~/components/FlowTemplateList.vue';
import FlowEditor from '~/components/FlowEditor.vue';
import FlowTemplateDialog from '~/components/FlowTemplateDialog.vue';
import { useCreateFlowTemplate, useUpdateFlowTemplate, useDeleteFlowTemplate, useFetchFlowTemplates, type FlowTemplate } from '~/composables/useFlowTemplate';

const selectedTemplateId = ref<number | null>(null);
const isTemplateDialogVisible = ref(false);
const editingTemplate = ref<Partial<FlowTemplate> | null>(null);

const { refetch: refetchTemplates } = useFetchFlowTemplates();
const { createFlowTemplate } = useCreateFlowTemplate();
const { updateFlowTemplate } = useUpdateFlowTemplate();
const { deleteFlowTemplate } = useDeleteFlowTemplate();

const onTemplateSelected = (id: number) => {
  selectedTemplateId.value = id;
};

const openNewTemplateDialog = () => {
  editingTemplate.value = { name: '', description: '', category: '', is_active: true };
  isTemplateDialogVisible.value = true;
};

const openEditTemplateDialog = (template: FlowTemplate) => {
  editingTemplate.value = template;
  isTemplateDialogVisible.value = true;
};

const closeTemplateDialog = () => {
  isTemplateDialogVisible.value = false;
  editingTemplate.value = null;
};

const saveTemplate = async (template: Partial<FlowTemplate>) => {
  if (template.id) { // Update
    await updateFlowTemplate({ id: template.id, data: template });
  } else { // Create
    await createFlowTemplate(template as any);
  }
  refetchTemplates();
  closeTemplateDialog();
};

const deleteTemplate = async (id: number) => {
  if (confirm('Are you sure you want to delete this flow template and all its steps?')) {
    await deleteFlowTemplate(id);
    if (selectedTemplateId.value === id) {
      selectedTemplateId.value = null;
    }
    refetchTemplates();
  }
};

</script>

<style scoped>
/* Scoped styles for the flows page */
</style>
