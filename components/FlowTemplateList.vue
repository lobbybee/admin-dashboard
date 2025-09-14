<template>
  <div>
    <div class="mb-4">
      <Button label="New Template" icon="pi pi-plus" @click="openNewTemplateDialog" class="w-full" />
    </div>
    <div v-if="isLoadingTemplates">Loading...</div>
    <div v-if="templatesError">Error fetching flow templates</div>
    <ul v-if="flowTemplates" class="space-y-2">
      <li
        v-for="template in flowTemplates"
        :key="template.id"
        @click="selectTemplate(template.id)"
        class="p-2 rounded-md cursor-pointer border flex justify-between items-center"
        :class="{ 'bg-blue-500 text-white border-blue-500': selectedTemplateId === template.id, 'hover:bg-gray-200': selectedTemplateId !== template.id }"
      >
        <div class="flex items-center">
          <span :class="{ 'line-through': !template.is_active }">{{ template.name }}</span>
          <span :class="[template.is_active ? 'bg-green-500' : 'bg-gray-400', 'w-2.5 h-2.5 rounded-full ml-2']"></span>
        </div>
        <div class="space-x-2 opacity-50 group-hover:opacity-100">
          <InputSwitch :modelValue="template.is_active" @update:modelValue="(value) => handleToggle(template, value)" @click.stop/>
          <Button icon="pi pi-pencil" severity="secondary" text rounded @click.stop="openEditTemplateDialog(template)"/>
          <Button icon="pi pi-trash" severity="danger" text rounded @click.stop="deleteTemplate(template.id)"/>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFlowStore } from '~/stores/flow';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';
import type { FlowTemplate } from '~/composables/useFlowTemplate';

const flowStore = useFlowStore();

const {
  flowTemplates,
  isLoadingTemplates,
  templatesError,
  selectedTemplateId,
} = storeToRefs(flowStore);

const {
  selectTemplate,
  openNewTemplateDialog,
  openEditTemplateDialog,
  deleteTemplate,
  saveTemplate,
} = flowStore;

const handleToggle = async (template: FlowTemplate, value: boolean) => {
  // Temporarily set the template to be edited and save it.
  // The store's saveTemplate action will handle the update and cleanup.
  flowStore.editingTemplate = { ...template, is_active: value };
  await saveTemplate();
}
</script>
