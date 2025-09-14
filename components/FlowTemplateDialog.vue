<template>
  <Dialog :visible="isTemplateDialogVisible" modal :header="header" :style="{ width: '40vw' }" @update:visible="closeTemplateDialog">
    <form @submit.prevent="saveTemplate" v-if="editingTemplate" class="p-fluid">
      <div class="field">
        <label for="name">Template Name</label>
        <InputText id="name" v-model="editingTemplate.name" required />
      </div>
      <div class="field">
        <label for="description">Description</label>
        <Textarea id="description" v-model="editingTemplate.description" rows="3" />
      </div>
      <div class="field">
        <label for="category">Category</label>
        <InputText id="category" v-model="editingTemplate.category" required placeholder="e.g., guest_checkin"/>
      </div>
      <div class="field-checkbox flex items-center">
        <InputSwitch id="is_active" v-model="editingTemplate.is_active" />
        <label for="is_active" class="ml-2">Is Active</label>
      </div>
    </form>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="closeTemplateDialog" severity="secondary" />
      <Button label="Save" icon="pi pi-check" @click="saveTemplate" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useFlowStore } from '~/stores/flow';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';

const flowStore = useFlowStore();

const {
  isTemplateDialogVisible,
  editingTemplate,
} = storeToRefs(flowStore);

const {
  closeTemplateDialog,
  saveTemplate,
} = flowStore;

const header = computed(() => (editingTemplate.value?.id ? 'Edit Flow Template' : 'Create New Flow Template'));

</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>