<template>
    <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" :header="header" :modal="true" :style="{ width: '500px' }" :draggable="false">
        <div class="space-y-6">
            <div>
                <FloatLabel>
                    <InputText id="step_name" v-model="form.step_name" class="w-full" />
                    <label for="step_name">Step Name</label>
                </FloatLabel>
            </div>
            <div>
                <FloatLabel>
                    <Textarea id="message_body" v-model="form.message_body" class="w-full" rows="5" />
                    <label for="message_body">Message Body</label>
                </FloatLabel>
            </div>
            <div>
                <FloatLabel>
                    <InputText id="message_type" v-model="form.message_type" class="w-full" />
                    <label for="message_type">Message Type</label>
                </FloatLabel>
            </div>
        </div>
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="emit('update:visible', false)" />
            <Button :label="step ? 'Update' : 'Create'" icon="pi pi-check" @click="submitForm" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import FloatLabel from 'primevue/floatlabel';

const props = defineProps<{
    visible: boolean;
    step: any | null;
}>();

const emit = defineEmits(['update:visible', 'save']);

const form = reactive({
    step_name: '',
    message_type: 'text',
    message_body: '' // Use message_body internally
});

const header = computed(() => props.step ? 'Edit Step' : 'Create New Step');

watch(() => props.step, (newStep) => {
    if (newStep) {
        form.step_name = newStep.data.label;
        form.message_body = newStep.data.message_body; // Expect message_body from node data
        form.message_type = newStep.message_type || 'text';
    } else {
        form.step_name = '';
        form.message_body = ''; // Reset to empty string
        form.message_type = 'text';
    }
});

const submitForm = () => {
    emit('save', form);
}

</script>
