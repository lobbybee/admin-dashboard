<template>
  <div class="relative">
    <div v-if="!flowTemplateId">
      <p class="text-gray-500">Select a flow template to start editing.</p>
    </div>
    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Conversation Simulator</h3>
        <Button icon="pi pi-plus" label="New Step" @click="openNewStepDialog" />
      </div>

      <div v-if="isLoading">Loading flow steps...</div>
      <div v-if="error">Error fetching flow steps.</div>
      
      <!-- Simulator View -->
      <FlowSimulator 
        v-if="sortedFlowStepTemplates"
        :steps="sortedFlowStepTemplates" 
        @edit-step="openEditDialogById"
        @delete-step="deleteStep"
      />

    </div>
    <FlowStepDialog 
      v-if="isDialogVisible" 
      :step="selectedStep" 
      :all-steps="sortedFlowStepTemplates"
      @close="closeDialog"
      @save="saveStep"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, computed } from 'vue';
import { useFetchFlowStepTemplates, type FlowStepTemplate, useUpdateFlowStepTemplate, useCreateFlowStepTemplate, useDeleteFlowStepTemplate } from '~/composables/useFlowStepTemplate';
import FlowStepDialog from './FlowStepDialog.vue';
import FlowSimulator from './FlowSimulator.vue';
import Button from 'primevue/button';

const props = defineProps<{ flowTemplateId: number | null }>();

const { flowTemplateId } = toRefs(props);

const templateId = computed(() => flowTemplateId.value ?? undefined);

const { flowStepTemplates, isLoading, error, refetch } = useFetchFlowStepTemplates(templateId);

watch(flowTemplateId, () => {
  refetch();
});
const { mutateAsync: updateStep } = useUpdateFlowStepTemplate();
const { mutateAsync: createStep } = useCreateFlowStepTemplate();
const { mutateAsync: deleteStepMutation } = useDeleteFlowStepTemplate();

const isDialogVisible = ref(false);
const selectedStep = ref<Partial<FlowStepTemplate> | null>(null);

const sortedFlowStepTemplates = computed(() => {
  if (!flowStepTemplates.value) return [];
  return [...flowStepTemplates.value].sort((a, b) => a.order - b.order);
});

const openEditDialog = (step: FlowStepTemplate) => {
  selectedStep.value = { ...step };
  isDialogVisible.value = true;
};

const openEditDialogById = (stepId: number) => {
  const stepToEdit = flowStepTemplates.value?.find(s => s.id === stepId);
  if (stepToEdit) {
    openEditDialog(stepToEdit);
  }
};

const openNewStepDialog = () => {
  const maxOrder = sortedFlowStepTemplates.value.reduce((max, step) => Math.max(max, step.order), 0);
  selectedStep.value = {
    flow_template: flowTemplateId.value,
    step_name: 'New Step',
    message_template: '',
    message_type: 'text',
    order: maxOrder + 1,
    options: {},
    conditional_next_steps: {},
  };
  isDialogVisible.value = true;
};

const closeDialog = () => {
  isDialogVisible.value = false;
  selectedStep.value = null;
};

const saveStep = async (step: FlowStepTemplate) => {
  if (!step) return;
  if (step.id) {
    await updateStep({ id: step.id, data: step });
  } else {
    await createStep(step as any);
  }
  closeDialog();
  refetch();
};

const deleteStep = async (id: number) => {
  if (confirm('Are you sure you want to delete this step?')) {
    await deleteStepMutation(id);
    refetch();
  }
};

</script>