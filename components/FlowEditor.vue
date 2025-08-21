<template>
  <Card
  class="shadow-lg border-t-4 border-primary-500 h-full flex flex-col"
  :pt="{
    body: { class: 'flex flex-col h-full' },
    content: { class: 'flex-grow p-0 sm:p-0' }
  }"
>
    <template #title>
      <div class="flex justify-between items-start">
        <div v-if="template">
          <h2 class="text-2xl font-bold text-gray-800">{{ template.name }}</h2>
          <p class="text-gray-500">Trigger: <span class="font-mono bg-gray-200 px-2 py-1 rounded">{{ template.trigger_keyword }}</span></p>
        </div>
        <div class="flex gap-2">
          <Button label="Add Step" icon="pi pi-plus" :disabled="!template" @click="openAddStepDialog" />
          <Button icon="pi pi-pencil" class="p-button-outlined" :disabled="!template" @click="emit('edit-template', template)" />
          <Button icon="pi pi-trash" class="p-button-danger p-button-outlined" :disabled="!template" @click="emit('delete-template', template)" />
        </div>
      </div>
    </template>
    <template #content>
        <div v-if="!template" class="flex flex-col items-center justify-center h-full bg-white rounded-lg p-12">
            <i class="pi pi-sitemap text-6xl text-gray-300"></i>
            <h2 class="mt-4 text-2xl font-semibold text-gray-700">Select a Flow Template</h2>
            <p class="text-gray-500">Choose a template from the list to view and edit its steps.</p>
        </div>
        <div v-else-if="isLoading" class="flex justify-center items-center h-full">
            <ProgressSpinner />
        </div>
        <div v-else class="h-full w-full relative">
            <VueFlow
                v-model:nodes="nodes"
                v-model:edges="edges"
                fit-view-on-init
                class="bg-gray-100 rounded-md"
            >
                <template #node-flowStep="props">
                    <FlowStepNode :data="props.data" @delete-step="handleDeleteStep(props.id)" />
                </template>
                <template #edge-custom="props">
                    <path :id="props.id" :style="props.style" class="vue-flow__edge-path" :d="getBezierPath(props)[0]" :marker-end="props.markerEnd" />
                    <EdgeText :x="getBezierPath(props)[1]" :y="getBezierPath(props)[2]" :label="props.label" class="bg-white bg-opacity-70 p-1 rounded" />
                    <foreignObject width="20" height="20" :x="getBezierPath(props)[1] - 10" :y="getBezierPath(props)[2] + 5">
                        <button class="edge-button" @click="handleDeleteEdge(props.id)">&times;</button>
                    </foreignObject>
                </template>
                <Background />
                <Controls />
            </VueFlow>
            <div class="absolute bottom-4 right-4 bg-white p-2 rounded shadow-lg text-xs text-gray-500">
                Note: Guests can type 'back' to go to the previous step or 'main menu' to restart.
            </div>
        </div>
    </template>
  </Card>
  <ConfirmDialog></ConfirmDialog>
  <FlowStepDialog v-model:visible="isDialogVisible" :step="editingStep" @save="handleSaveStep" />

  <!-- Edge Condition Dialog -->
  <Dialog header="Set Branch Condition" v-model:visible="isEdgeDialogVisible" :modal="true" :style="{width: '350px'}" :draggable="false" @hide="closeEdgeDialog">
    <div class="flex flex-col gap-2">
        <label for="condition">User input condition (e.g., 'yes', 'no', '*')</label>
        <InputText id="condition" v-model="newEdgeCondition" @keyup.enter="saveNewEdge" />
    </div>
    <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="closeEdgeDialog" class="p-button-text" />
        <Button label="Save" icon="pi pi-check" @click="saveNewEdge" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';


import { VueFlow, useVueFlow, EdgeText, getBezierPath } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import FlowStepNode from './FlowStepNode.vue';
import FlowStepDialog from './FlowStepDialog.vue';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

const props = defineProps<{ template: any | null }>();
const emit = defineEmits(['edit-template', 'delete-template']);

const templateId = computed(() => props.template?.id);
const { flowStepTemplates: flowSteps, isLoading, refetch } = useFetchFlowStepTemplates(templateId);
const { mutateAsync: createStep } = useCreateFlowStepTemplate();
const { mutateAsync: updateStep } = useUpdateFlowStepTemplate();
const { mutateAsync: deleteStepApi } = useDeleteFlowStepTemplate();

const confirm = useConfirm();
const toast = useToast();

const { onNodeDoubleClick, onConnect } = useVueFlow();

const nodes = ref([]);
const edges = ref([]);

// --- Watch for template changes and refetch steps ---
watch(
  () => props.template?.id,
  (newTemplateId, oldTemplateId) => {
    // Only refetch if the template ID actually changes and is valid
    if (newTemplateId !== oldTemplateId && newTemplateId != null) {
      console.log(`Template changed from ${oldTemplateId} to ${newTemplateId}. Refetching steps...`);
      refetch();
    }
    // If the new template ID is null (e.g., deselected), the watch on `flowSteps`
    // should handle clearing nodes/edges due to the `if (!steps)` check.
  },
  { immediate: true } // Run the callback immediately on component mount/setup
);

watch(flowSteps, (steps) => {
  if (!steps) { nodes.value = []; edges.value = []; return; }
  const newNodes = [];
  const newEdges = [];

  // Create a map for quick lookup of step objects by ID
  const stepMap = new Map(steps.map(step => [step.id, step]));

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    newNodes.push({
      id: step.id.toString(), type: 'flowStep', label: step.step_name, position: { x: 250, y: i * 200 },
      data: { label: step.step_name, message_body: step.message_template } // Map API field to internal field
    });

    // Handle default next step (linear flow)
    if (step.next_step_template) {
      // Ensure the target step exists to avoid orphaned edges
      if (stepMap.has(step.next_step_template)) {
        newEdges.push({
          id: `e-${step.id}-${step.next_step_template}`, source: step.id.toString(), target: step.next_step_template.toString(),
          label: 'default', animated: false, type: 'custom'
        });
      }
    }

    // Handle conditional next steps (branching logic)
    if (step.conditional_next_steps) {
      for (const [condition, nextStepId] of Object.entries(step.conditional_next_steps)) {
        // Ensure the target step exists to avoid orphaned edges
        if (stepMap.has(nextStepId)) {
          newEdges.push({
            id: `e-${step.id}-${nextStepId}-${condition}`, source: step.id.toString(), target: nextStepId.toString(),
            label: condition, animated: false, type: 'custom'
          });
        }
      }
    }
  }
  nodes.value = newNodes;
  edges.value = newEdges;
});

// --- Step Dialog Logic ---
const isDialogVisible = ref(false);
const editingStep = ref<any>(null);

const openAddStepDialog = () => { editingStep.value = null; isDialogVisible.value = true; };

onNodeDoubleClick(({ node }) => {
    const fullStep = flowSteps.value?.find(s => s.id === parseInt(node.id));
    editingStep.value = { ...node, message_type: fullStep?.message_type };
    isDialogVisible.value = true;
});

const handleSaveStep = async (formData: any) => {
    try {
        if (editingStep.value) {
            await updateStep({ id: editingStep.value.id, data: formData });
            toast.add({ severity: 'success', summary: 'Success', detail: 'Step updated', life: 3000 });
        } else {
            await createStep({ ...formData, flow_template: templateId.value, order: nodes.value.length + 1 });
            toast.add({ severity: 'success', summary: 'Success', detail: 'Step created', life: 3000 });
        }
        isDialogVisible.value = false;
        refetch();
    } catch (err) { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save step', life: 5000 }); }
};

const handleDeleteStep = (nodeId: string) => {
    confirm.require({
        message: 'Are you sure you want to delete this step and all its connections?', header: 'Delete Confirmation', icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                await deleteStepApi(nodeId);
                toast.add({ severity: 'success', summary: 'Deleted', detail: 'Step deleted', life: 3000 });
                refetch();
            } catch (err) { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete step', life: 5000 }); }
        }
    });
};

// --- Edge/Connection Logic ---
const isEdgeDialogVisible = ref(false);
const newEdgeCondition = ref('');
const newEdgeParams = ref(null);

onConnect((params) => { newEdgeParams.value = params; isEdgeDialogVisible.value = true; });

const saveNewEdge = async () => {
    if (!newEdgeParams.value || !newEdgeCondition.value) return;
    const { source, target } = newEdgeParams.value;
    const sourceNode = flowSteps.value?.find(s => s.id.toString() === source);
    if (!sourceNode) return;

    const updatedConditions = { ...(sourceNode.conditional_next_steps || {}), [newEdgeCondition.value]: parseInt(target) };

    try {
        await updateStep({ id: source, data: { conditional_next_steps: updatedConditions } });
        toast.add({ severity: 'success', summary: 'Success', detail: 'Branch created', life: 3000 });
        refetch();
    } catch (err) { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create branch', life: 5000 }); }
    closeEdgeDialog();
};

const closeEdgeDialog = () => { isEdgeDialogVisible.value = false; newEdgeCondition.value = ''; newEdgeParams.value = null; };

const handleDeleteEdge = (edgeId: string) => {
    const edge = edges.value.find(e => e.id === edgeId);
    if (!edge) return;
    const { source, label } = edge;
    const sourceNode = flowSteps.value?.find(s => s.id.toString() === source);
    if (!sourceNode || !sourceNode.conditional_next_steps) return;

    const updatedConditions = { ...sourceNode.conditional_next_steps };
    delete updatedConditions[label];

    confirm.require({
        message: `Are you sure you want to remove the "${label}" branch?`, header: 'Delete Connection', icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                await updateStep({ id: source, data: { conditional_next_steps: updatedConditions } });
                toast.add({ severity: 'success', summary: 'Deleted', detail: 'Branch removed', life: 3000 });
                refetch();
            } catch (err) { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove branch', life: 5000 }); }
        }
    });
};
</script>

<style>
.edge-button {
    background: #ff4d4d;
    border: none;
    color: white;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    text-align: center;
    opacity: 0.7;
    transition: opacity 0.2s;
}
.edge-button:hover {
    opacity: 1;
}
.vue-flow__node {
    font-size: 12px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background: white;
}
.vue-flow__node.selected {
    box-shadow: 0 0 0 2px var(--primary-color), 0 0 15px rgba(0,0,0,0.1);
}
</style>
