<template>
  <div class="border rounded-lg p-4 h-[70vh] flex flex-col bg-gray-50">
    <!-- Message History -->
    <div ref="historyContainer" class="flex-grow overflow-y-auto mb-4 p-4 space-y-4">
      <div v-for="(msg, index) in conversationHistory" :key="index" class="flex"
           :class="msg.isUser ? 'justify-end' : 'justify-start'">
        <div 
          class="rounded-lg px-4 py-2 max-w-xs lg:max-w-md relative group"
          :class="msg.isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 shadow-sm cursor-pointer'"
          @dblclick="editStep(msg.stepId)"
        >
          <p>{{ msg.text }}</p>
          <button 
            v-if="!msg.isUser" 
            @click.stop="deleteStep(msg.stepId)" 
            class="absolute top-0 right-0 mt-1 mr-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
             <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- User Input -->
    <div class="flex-shrink-0 pt-4 border-t">
      <div class="flex items-center space-x-2">
        <!-- Quick Reply Buttons -->
        <div v-if="isQuickReply" class="flex flex-wrap gap-2 justify-center flex-grow">
          <Button v-for="(option, key) in currentStep.options" :key="key" :label="option" @click="handleOptionClick(key)" />
        </div>

        <!-- List Picker -->
        <div v-if="isListPicker" class="flex-grow flex items-center space-x-2">
            <Listbox v-model="selectedListBoxOption" :options="listBoxOptions" optionLabel="label" optionValue="value" class="w-full md:w-14rem" />
            <Button label="Submit" @click="handleListBoxSubmit" :disabled="!selectedListBoxOption"/>
        </div>

        <!-- Text Input -->
        <div v-if="isText" class="flex-grow flex space-x-2">
          <InputText v-model="userInput" @keyup.enter="handleTextInput" placeholder="Type your message..." class="flex-grow" />
          <Button icon="pi pi-send" @click="handleTextInput" />
          <Button v-if="hasNextStepForText()" label="Next" @click="handleNextClick" severity="secondary"/>
        </div>

        <!-- Flow Transition -->
        <div v-if="availableFlowTransitions.length > 0" class="flex-grow flex items-center space-x-2">
          <Select 
            v-model="selectedFlowTransition" 
            :options="availableFlowTransitions" 
            optionLabel="label" 
            optionValue="value" 
            placeholder="Select a flow to transition to"
            class="w-full md:w-14rem"
          />
          <Button label="Transition" @click="handleFlowTransition" :disabled="!selectedFlowTransition" />
        </div>

        <!-- Flow End -->
        <div v-if="!currentStep && conversationHistory.length > 0" class="text-center flex-grow">
           <p class="text-gray-500 mb-2">Flow ended.</p>
        </div>

        <Button label="Reset" icon="pi pi-refresh" @click="startSimulation" severity="secondary"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue';
import type { FlowStepTemplate } from '~/composables/useFlowStepTemplate';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Listbox from 'primevue/listbox';
import Select from 'primevue/select';
import { useFetchFlowTemplates } from '~/composables/useFlowTemplate';

const props = defineProps<{
  steps: FlowStepTemplate[];
}>();

const emit = defineEmits(['edit-step', 'delete-step']);

interface ConversationMessage {
  text: string;
  isUser: boolean;
  stepId?: number;
}

const conversationHistory = ref<ConversationMessage[]>([]);
const currentStep = ref<FlowStepTemplate | null>(null);
const userInput = ref('');
const selectedListBoxOption = ref<string | null>(null);
const selectedFlowTransition = ref<number | null>(null);
const historyContainer = ref<HTMLElement | null>(null);

// Fetch all flow templates for category matching
const { flowTemplates } = useFetchFlowTemplates();

const cleanMessageType = (type: string) => type.replace(/[^a-z-]/gi, '').toLowerCase();

const isQuickReply = computed(() => currentStep.value && cleanMessageType(currentStep.value.message_type) === 'quick-reply');
const isListPicker = computed(() => currentStep.value && cleanMessageType(currentStep.value.message_type) === 'list-picker');
const isText = computed(() => currentStep.value && cleanMessageType(currentStep.value.message_type) === 'text');

const listBoxOptions = computed(() => {
    if (!currentStep.value || !currentStep.value.options) return [];
    return Object.entries(currentStep.value.options).map(([key, value]) => ({ label: value, value: key }));
});

const stepsMap = computed(() => {
  const map = new Map<number, FlowStepTemplate>();
  for (const step of props.steps) {
    map.set(step.id, step);
  }
  return map;
});

// Available flow transitions based on allowed_flow_categories
const availableFlowTransitions = computed(() => {
  if (!currentStep.value || !currentStep.value.allowed_flow_categories || !flowTemplates.value) return [];
  
  return flowTemplates.value
    .filter(template => 
      currentStep.value.allowed_flow_categories.includes(template.category) &&
      template.id !== currentStep.value.flow_template // Don't include current flow
    )
    .map(template => ({
      label: template.name,
      value: template.id
    }));
});

const scrollToBottom = () => {
  nextTick(() => {
    if (historyContainer.value) {
      historyContainer.value.scrollTop = historyContainer.value.scrollHeight;
    }
  });
};

const startSimulation = () => {
  conversationHistory.value = [];
  currentStep.value = null;
  selectedListBoxOption.value = null;
  selectedFlowTransition.value = null;
  if (props.steps.length > 0) {
    setCurrentStep(props.steps[0]);
  }
  scrollToBottom();
};

const setCurrentStep = (step: FlowStepTemplate | null) => {
  currentStep.value = step;
  selectedListBoxOption.value = null;
  selectedFlowTransition.value = null;
  if (step) {
    conversationHistory.value.push({ text: step.message_template, isUser: false, stepId: step.id });
  }
  scrollToBottom();
};

const handleOptionClick = (key: string) => {
  if (!currentStep.value) return;

  const selectedOptionText = currentStep.value.options?.[key];
  if(selectedOptionText){
    conversationHistory.value.push({ text: selectedOptionText, isUser: true });
  }

  const nextStepId = currentStep.value.conditional_next_steps?.[key];
  if (nextStepId) {
    setCurrentStep(stepsMap.value.get(nextStepId) || null);
  } else {
    handleFallback();
  }
  scrollToBottom();
};

const handleListBoxSubmit = () => {
    if(selectedListBoxOption.value){
        handleOptionClick(selectedListBoxOption.value);
    }
}

const handleTextInput = () => {
  if (!currentStep.value || !userInput.value) return;

  const userInputValue = userInput.value;
  conversationHistory.value.push({ text: userInputValue, isUser: true });
  userInput.value = '';

  // Check for conditional branching
  const nextStepId = currentStep.value.conditional_next_steps?.[userInputValue] 
                  || currentStep.value.conditional_next_steps?.['*'];

  if (nextStepId) {
    setCurrentStep(stepsMap.value.get(nextStepId) || null);
  } else {
     handleFallback();
  }
  scrollToBottom();
};

const handleNextClick = () => {
    if (!currentStep.value) return;
    handleFallback();
}

const hasNextStepForText = () => {
    if (!currentStep.value || !isText.value) return false;
    return currentStep.value.next_step_template != null || (currentStep.value.conditional_next_steps && currentStep.value.conditional_next_steps['*']);
}

const handleFallback = () => {
    if (!currentStep.value) return;
    
    // Check for conditional branching with wildcard
    const conditionalNext = currentStep.value.conditional_next_steps?.['*'];
    if (conditionalNext) {
        setCurrentStep(stepsMap.value.get(conditionalNext) || null);
        return;
    }
    
    // Check for linear progression
    const linearNext = currentStep.value.next_step_template;
    if (linearNext) {
        setCurrentStep(stepsMap.value.get(linearNext) || null);
        return;
    }
    
    // No next step, end flow
    currentStep.value = null;
}

const handleFlowTransition = () => {
  if (!selectedFlowTransition.value || !flowTemplates.value) return;
  
  const targetFlow = flowTemplates.value.find(f => f.id === selectedFlowTransition.value);
  if (targetFlow) {
    conversationHistory.value.push({ 
      text: `Transitioning to "${targetFlow.name}" flow...`, 
      isUser: false 
    });
    // In a real implementation, this would load the new flow steps
    // For simulation, we'll just end the current flow
    currentStep.value = null;
  }
  scrollToBottom();
}

const editStep = (stepId?: number) => {
  if (stepId) {
    emit('edit-step', stepId);
  }
};

const deleteStep = (stepId?: number) => {
  if (stepId) {
    emit('delete-step', stepId);
  }
};

watch(() => props.steps, startSimulation, { immediate: true, deep: true });

onMounted(startSimulation);

</script>