import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useFetchFlowTemplates, useCreateFlowTemplate, useUpdateFlowTemplate, useDeleteFlowTemplate, type FlowTemplate } from '~/composables/useFlowTemplate';
import { useFetchFlowStepTemplates, useCreateFlowStepTemplate, useUpdateFlowStepTemplate, useDeleteFlowStepTemplate, type FlowStepTemplate } from '~/composables/useFlowStepTemplate';

export const useFlowStore = defineStore('flow', () => {
    // state
    const isTemplateDialogVisible = ref(false);
    const editingTemplate = ref<Partial<FlowTemplate> | null>(null);
    const selectedTemplateId = ref<number | null>(null);

    const isStepDialogVisible = ref(false);
    const selectedStep = ref<Partial<FlowStepTemplate> | null>(null);

    // API composables for Flow Templates
    const { flowTemplates, isLoading: isLoadingTemplates, error: templatesError, refetch: refetchTemplates } = useFetchFlowTemplates();
    const { createFlowTemplate } = useCreateFlowTemplate();
    const { updateFlowTemplate } = useUpdateFlowTemplate();
    const { deleteFlowTemplate: deleteTemplateFn } = useDeleteFlowTemplate();

    // API composables for Flow Steps
    const templateIdForSteps = computed(() => selectedTemplateId.value ?? undefined);
    const { flowStepTemplates, isLoading: isLoadingSteps, error: stepsError, refetch: refetchSteps } = useFetchFlowStepTemplates(templateIdForSteps);

    const { mutateAsync: createStep } = useCreateFlowStepTemplate();
    const { mutateAsync: updateStep } = useUpdateFlowStepTemplate();
    const { mutateAsync: deleteStep } = useDeleteFlowStepTemplate();

    watch(selectedTemplateId, () => {
        refetchSteps();
    });

    // getters
    const sortedFlowStepTemplates = computed(() => {
        if (!flowStepTemplates.value) return [];
        return [...flowStepTemplates.value].sort((a, b) => a.order - b.order);
    });

    const allFlowTemplates = computed(() => flowTemplates.value || []);

    const flowCategories = computed(() => {
        if (!flowTemplates.value) return [];
        // get unique categories
        const categories = [...new Set(flowTemplates.value.map(template => template.category))];
        return categories.map(category => ({
            label: category,
            value: category
        }));
    });

    // actions
    function selectTemplate(id: number | null) {
        selectedTemplateId.value = id;
    }

    function openNewTemplateDialog() {
        editingTemplate.value = { name: '', description: '', category: '', is_active: true };
        isTemplateDialogVisible.value = true;
    }

    function openEditTemplateDialog(template: FlowTemplate) {
        editingTemplate.value = { ...template };
        isTemplateDialogVisible.value = true;
    }

    function closeTemplateDialog() {
        isTemplateDialogVisible.value = false;
        editingTemplate.value = null;
    }

    async function saveTemplate() {
        if (!editingTemplate.value) return;

        const templateData = editingTemplate.value;
        if (templateData.id) {
            await updateFlowTemplate({ id: templateData.id, data: templateData });
        } else {
            await createFlowTemplate(templateData as any);
        }
        refetchTemplates();
        closeTemplateDialog();
    }

    async function deleteTemplate(id: number) {
        if (confirm('Are you sure you want to delete this flow template and all its steps?')) {
            await deleteTemplateFn(id);
            if (selectedTemplateId.value === id) {
                selectedTemplateId.value = null;
            }
            refetchTemplates();
        }
    }

    function openNewStepDialog() {
        const maxOrder = sortedFlowStepTemplates.value.reduce((max, step) => Math.max(max, step.order), 0);
        selectedStep.value = {
            flow_template: selectedTemplateId.value,
            step_name: 'New Step',
            message_template: '',
            message_type: 'text',
            order: maxOrder + 1,
            options: {},
            conditional_next_steps: {},
            next_step_template: null,
            allowed_flow_categories: []
        };
        isStepDialogVisible.value = true;
    }

    function openEditStepDialog(stepId: number) {
        const stepToEdit = flowStepTemplates.value?.find(s => s.id === stepId);
        if (stepToEdit) {
            selectedStep.value = { ...stepToEdit };
            isStepDialogVisible.value = true;
        }
    }

    function closeStepDialog() {
        isStepDialogVisible.value = false;
        selectedStep.value = null;
    }

    async function saveStep(step: FlowStepTemplate) {
        if (!step) return;
        if (step.id) {
            await updateStep({ id: step.id, data: step });
        } else {
            await createStep(step as any);
        }
        closeStepDialog();
        refetchSteps();
    }

    async function deleteStepAction(id: number) {
        if (confirm('Are you sure you want to delete this step?')) {
            await deleteStep(id);
            refetchSteps();
        }
    }

    return {
        // state
        isTemplateDialogVisible,
        editingTemplate,
        selectedTemplateId,
        isStepDialogVisible,
        selectedStep,
        flowTemplates: allFlowTemplates,
        isLoadingTemplates,
        templatesError,
        flowStepTemplates,
        isLoadingSteps,
        stepsError,
        // getters
        sortedFlowStepTemplates,
        flowCategories,
        // actions
        selectTemplate,
        openNewTemplateDialog,
        openEditTemplateDialog,
        closeTemplateDialog,
        saveTemplate,
        deleteTemplate,
        refetchTemplates,
        openNewStepDialog,
        openEditStepDialog,
        closeStepDialog,
        saveStep,
        deleteStep: deleteStepAction,
    };
});
