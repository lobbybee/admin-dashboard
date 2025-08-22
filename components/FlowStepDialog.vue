<template>
  <Dialog :visible="true" modal header="Edit Flow Step" :style="{ width: '50vw' }" @update:visible="onClose">
    <form @submit.prevent="onSave" v-if="editableStep" class="p-fluid">
      <!-- Core Fields -->
      <div class="field">
        <label for="step_name">Step Name</label>
        <InputText id="step_name" v-model="editableStep.step_name" />
      </div>
      <div class="field">
        <label for="message_template">Message Template</label>
        <Textarea id="message_template" v-model="editableStep.message_template" rows="4" />
      </div>
      <div class="field">
        <label for="message_type">Message Type</label>
        <Select 
          id="message_type" 
          v-model="editableStep.message_type" 
          :options="messageTypeOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>

      <!-- Combined Options & Branching for Quick Reply / List Picker -->
      <div v-if="isQuickReplyOrListPicker" class="field">
        <h3 class="text-lg font-semibold mb-2">Options & Branching</h3>
        <div v-for="(option, index) in combinedOptions" :key="index" class="grid grid-cols-12 gap-2 mb-2 items-center">
          <InputText :modelValue="option.key" placeholder="Key" class="col-span-2" disabled/>
          <InputText :modelValue="option.text" @update:modelValue="updateOptionText(option.key, $event)" placeholder="Display Text (e.g., Yes)" class="col-span-5" />
          <Select 
            :modelValue="option.nextStepId"
            @update:modelValue="updateOptionNextStep(option.key, $event)"
            :options="stepOptions" 
            optionLabel="label" 
            optionValue="value" 
            placeholder="Select Next Step"
            class="col-span-4"
          />
          <Button icon="pi pi-trash" severity="danger" @click="removeOption(option.key)" class="col-span-1"/>
        </div>
        <Button label="Add Option" icon="pi pi-plus" @click="addOption" class="mt-2" />
      </div>

      <!-- Conditional Next Steps for Text -->
      <div v-if="!isQuickReplyOrListPicker" class="field">
        <h3 class="text-lg font-semibold mb-2">Conditional Branching</h3>
        <div v-for="(stepId, condition) in editableStep.conditional_next_steps" :key="condition" class="flex items-center space-x-2 mb-2">
          <InputText :value="condition" @input="updateConditionKey($event, condition)" placeholder="User Input (e.g., * for any)" class="w-1/4" />
          <Select 
            :modelValue="stepId"
            @update:modelValue="editableStep.conditional_next_steps[condition] = $event"
            :options="stepOptions" 
            optionLabel="label" 
            optionValue="value" 
            placeholder="Select Next Step"
            class="w-1/2" 
          />
          <Button icon="pi pi-trash" severity="danger" @click="removeCondition(condition)" />
        </div>
        <Button label="Add Condition" icon="pi pi-plus" @click="addCondition" class="mt-2" />
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
import type { FlowStepTemplate } from '~/composables/useFlowStepTemplate';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Button from 'primevue/button';

const props = defineProps<{
  step: FlowStepTemplate | null;
  allSteps: FlowStepTemplate[];
}>();

const emit = defineEmits(['close', 'save']);

const editableStep = ref<FlowStepTemplate | null>(null);

const messageTypeOptions = [
    { label: 'Text', value: 'text' },
    { label: 'Quick Reply', value: 'quick-reply' },
    { label: 'List Picker', value: 'list-picker' }
];

const cleanMessageType = (type: string = '') => type.replace(/[^a-z-]/gi, '').toLowerCase();

const isQuickReplyOrListPicker = computed(() => {
    const type = cleanMessageType(editableStep.value?.message_type);
    return type === 'quick-reply' || type === 'list-picker';
});

const stepOptions = computed(() => {
  return props.allSteps
    .filter(s => s.id !== props.step?.id)
    .map(s => ({ label: `${s.step_name} (ID: ${s.id})`, value: s.id }));
});

const combinedOptions = computed(() => {
    if (!editableStep.value?.options) return [];
    return Object.keys(editableStep.value.options).map(key => ({
        key,
        text: editableStep.value.options[key],
        nextStepId: editableStep.value.conditional_next_steps?.[key] || null
    }));
});

watch(() => props.step, (newStep) => {
  if (newStep) {
    editableStep.value = JSON.parse(JSON.stringify(newStep));
    if (editableStep.value.message_type) {
      editableStep.value.message_type = cleanMessageType(editableStep.value.message_type);
    }
    if (!editableStep.value.options) editableStep.value.options = {};
    if (!editableStep.value.conditional_next_steps) editableStep.value.conditional_next_steps = {};
  } else {
    editableStep.value = null;
  }
}, { immediate: true, deep: true });

const addOption = () => {
  if (!editableStep.value) return;
  const newKey = `${Date.now()}`;
  editableStep.value.options[newKey] = 'New Option';
  editableStep.value.conditional_next_steps[newKey] = null;
};

const removeOption = (key: string) => {
  if (!editableStep.value) return;
  delete editableStep.value.options[key];
  delete editableStep.value.conditional_next_steps[key];
};

const updateOptionText = (key: string, text: string) => {
    if (!editableStep.value) return;
    editableStep.value.options[key] = text;
}

const updateOptionNextStep = (key: string, nextStepId: number | null) => {
    if (!editableStep.value) return;
    editableStep.value.conditional_next_steps[key] = nextStepId;
}

const addCondition = () => {
  if (editableStep.value && editableStep.value.conditional_next_steps) {
    const newKey = `new_condition_${Date.now()}`;
    editableStep.value.conditional_next_steps[newKey] = null;
  }
};

const removeCondition = (condition: string) => {
  if (editableStep.value && editableStep.value.conditional_next_steps) {
    delete editableStep.value.conditional_next_steps[condition];
  }
};

const updateConditionKey = (event: Event, oldCondition: string) => {
  const newCondition = (event.target as HTMLInputElement).value;
  if (editableStep.value && editableStep.value.conditional_next_steps) {
    const value = editableStep.value.conditional_next_steps[oldCondition];
    delete editableStep.value.conditional_next_steps[oldCondition];
    editableStep.value.conditional_next_steps[newCondition] = value;
  }
};

const onClose = () => {
  emit('close');
};

const onSave = () => {
  if (editableStep.value) {
    emit('save', editableStep.value);
  }
};
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>