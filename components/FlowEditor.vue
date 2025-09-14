<template>
  <div class="relative">
    <div v-if="!selectedTemplateId">
      <p class="text-gray-500">Select a flow template to start editing.</p>
    </div>
    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Conversation Simulator</h3>
        <Button icon="pi pi-plus" label="New Step" @click="openNewStepDialog" />
      </div>

      <div v-if="isLoadingSteps">Loading flow steps...</div>
      <div v-if="stepsError">Error fetching flow steps.</div>

      <!-- Simulator View -->
      <FlowSimulator
        v-if="sortedFlowStepTemplates"
      />

    </div>
    <FlowStepDialog />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFlowStore } from '~/stores/flow';
import FlowStepDialog from './FlowStepDialog.vue';
import FlowSimulator from './FlowSimulator.vue';
import Button from 'primevue/button';

const flowStore = useFlowStore();

const {
  selectedTemplateId,
  isLoadingSteps,
  stepsError,
  sortedFlowStepTemplates,
} = storeToRefs(flowStore);

const { openNewStepDialog } = flowStore;

</script>
