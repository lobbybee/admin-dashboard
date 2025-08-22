<template>
  <Dialog :visible="true" modal :header="header" :style="{ width: '40vw' }" @update:visible="onClose">
    <form @submit.prevent="onSave" v-if="editableTemplate" class="p-fluid">
      <div class="field">
        <label for="name">Template Name</label>
        <InputText id="name" v-model="editableTemplate.name" required />
      </div>
      <div class="field">
        <label for="description">Description</label>
        <Textarea id="description" v-model="editableTemplate.description" rows="3" />
      </div>
      <div class="field">
        <label for="category">Category</label>
        <InputText id="category" v-model="editableTemplate.category" required placeholder="e.g., guest_checkin"/>
      </div>
      <div class="field-checkbox flex items-center">
        <InputSwitch id="is_active" v-model="editableTemplate.is_active" />
        <label for="is_active" class="ml-2">Is Active</label>
      </div>
    </form>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="onClose" severity="secondary" />
      <Button label="Save" icon="pi pi-check" @click="onSave" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { FlowTemplate } from '~/composables/useFlowTemplate';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';

const props = defineProps<{
  template: Partial<FlowTemplate> | null;
}>();

const emit = defineEmits(['close', 'save']);

const editableTemplate = ref<Partial<FlowTemplate> | null>(null);

const header = computed(() => (props.template?.id ? 'Edit Flow Template' : 'Create New Flow Template'));

watch(() => props.template, (newTemplate) => {
  if (newTemplate) {
    editableTemplate.value = { ...newTemplate };
  } else {
    editableTemplate.value = null;
  }
}, { immediate: true, deep: true });

const onClose = () => {
  emit('close');
};

const onSave = () => {
  if (editableTemplate.value) {
    emit('save', editableTemplate.value);
  }
};
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>