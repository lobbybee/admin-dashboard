<template>
  <div class="space-y-4">

    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-700">Flow Templates</h2>

      <Button icon="pi pi-plus" class="p-button-rounded p-button-text" @click="openAddFlowTemplateForm" v-tooltip.bottom="'New Flow Template'" />
    </div>
    <div v-if="isLoading" class="flex justify-center p-4">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>
    <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded">
      Error loading templates.
    </div>
    <div v-else-if="!flowTemplates || flowTemplates.length === 0" class="text-center text-gray-500 py-4">
        <p>No templates found.</p>
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="template in flowTemplates"
        :key="template.id"
        @click="emit('template-selected', template)"
        class="p-3 rounded-lg cursor-pointer transition-colors duration-200"
        :class="[selectedTemplateId === template.id ? 'bg-primary-100 text-primary-800 shadow-md' : 'hover:bg-gray-200']"
      >
        <h3 class="font-semibold">{{ template.name }}</h3>
        <p class="text-sm opacity-70">{{ template.description }}</p>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="dialogVisible" :header="editingTemplate ? 'Edit Flow Template' : 'New Flow Template'" :modal="true" :style="{ width: '500px' }" :draggable="false">
    <div class="space-y-6">
      <div>
        <FloatLabel>
          <InputText id="name" v-model="form.name" class="w-full" />
          <label for="name">Template Name</label>
        </FloatLabel>
      </div>
      <div>
        <FloatLabel>
          <Textarea id="description" v-model="form.description" class="w-full" rows="3" />
          <label for="description">Description</label>
        </FloatLabel>
      </div>
      <div>
        <FloatLabel>
          <InputText id="trigger_keyword" v-model="form.trigger_keyword" class="w-full" />
          <label for="trigger_keyword">Trigger Keyword</label>
        </FloatLabel>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDialog" />
      <Button :label="editingTemplate ? 'Update' : 'Create'" icon="pi pi-check" @click="saveFlowTemplate" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import FloatLabel from 'primevue/floatlabel';
import ProgressSpinner from 'primevue/progressspinner';
import Tooltip from 'primevue/tooltip';


const props = defineProps<{ selectedTemplateId: number | null }>();
const emit = defineEmits(['template-selected', 'template-updated']);

const {  flowTemplates, isLoading, error, refetch } = useFetchFlowTemplates();
const { mutateAsync: createFlowTemplate } = useCreateFlowTemplate();
const { mutateAsync: updateFlowTemplate } = useUpdateFlowTemplate();

const toast = useToast();
const dialogVisible = ref(false);
const editingTemplate = ref<any>(null);
const form = reactive({ name: '', description: '', trigger_keyword: '' });

const openAddFlowTemplateForm = () => {
  editingTemplate.value = null;
  form.name = '';
  form.description = '';
  form.trigger_keyword = '';
  dialogVisible.value = true;
};

const openEditFlowTemplateForm = (template: any) => {
  editingTemplate.value = template;
  form.name = template.name;
  form.description = template.description;
  form.trigger_keyword = template.trigger_keyword;
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
};

const saveFlowTemplate = async () => {
  try {
    if (editingTemplate.value) {
      await updateFlowTemplate({ id: editingTemplate.value.id, data: form });
      toast.add({ severity: 'success', summary: 'Success', detail: 'Template updated', life: 3000 });
    } else {
      await createFlowTemplate(form);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Template created', life: 3000 });
    }
    refetch();
    emit('template-updated');
    closeDialog();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save template', life: 5000 });
  }
};

defineExpose({ openEditFlowTemplateForm });
</script>
