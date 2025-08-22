<template>
  <div>
    <div class="mb-4">
      <Button label="New Template" icon="pi pi-plus" @click="$emit('create')" class="w-full" />
    </div>
    <div v-if="isLoading">Loading...</div>
    <div v-if="error">Error fetching flow templates</div>
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
          <InputSwitch :modelValue="template.is_active" @update:modelValue="(value) => $emit('toggle-active', { ...template, is_active: value })" @click.stop/>
          <Button icon="pi pi-pencil" severity="secondary" text rounded @click.stop="$emit('edit', template)"/>
          <Button icon="pi pi-trash" severity="danger" text rounded @click.stop="$emit('delete', template.id)"/>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFetchFlowTemplates, type FlowTemplate } from '~/composables/useFlowTemplate';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';

const emit = defineEmits(['template-selected', 'create', 'edit', 'delete', 'toggle-active']);

const { flowTemplates, isLoading, error } = useFetchFlowTemplates();

const selectedTemplateId = ref<number | null>(null);

const selectTemplate = (id: number) => {
  selectedTemplateId.value = id;
  emit('template-selected', id);
};

</script>