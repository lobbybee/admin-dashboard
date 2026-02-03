<template>
<div class="page-container">
  <!-- Header Section -->
  <header class="mb-8">
    <div class="header-content">
      <div class="header-section">
        <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900">
          Templates
        </h1>
        <p class="mt-2 text-gray-600">
          Manage global message templates for chat system
        </p>
      </div>
    </div>
  </header>

  <!-- Loading State -->
  <div
    v-if="isLoading"
    class="space-y-4"
    role="status"
    aria-label="Loading templates"
  >
    <div
      v-for="i in 5"
      :key="i"
      class="skeleton-card animate-pulse"
    >
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="w-48 h-6 skeleton mb-2"></div>
            <div class="w-32 h-4 skeleton mb-2"></div>
            <div class="w-full h-4 skeleton"></div>
          </div>
          <div class="w-24 h-8 skeleton"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div
    v-else-if="error"
    class="error-state"
    role="alert"
  >
    <div class="text-center py-12">
      <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <Icon name="prime:exclamation-triangle" class="text-xl text-red-600" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        Unable to load templates
      </h3>
      <p class="text-gray-600 mb-6 max-w-md mx-auto">
        {{ error?.message || 'There was an error loading the templates. Please try again.' }}
      </p>
      <button
        @click="refetch"
        class="button-primary"
      >
        Try Again
      </button>
    </div>
  </div>

  <!-- Templates List -->
  <div
    v-else-if="templatesData"
    class="space-y-4"
  >
    <!-- Results Count -->
    <div class="text-sm text-gray-600 mb-6">
      <p>
        Showing {{ templatesData?.results?.length || 0 }} of {{ templatesData?.count || 0 }} templates
      </p>
    </div>

    <!-- Templates Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="template in templatesData?.results"
        :key="template.id"
        class="card hover:shadow-lg transition-all duration-200"
      >
        <div class="p-6">
          <!-- Header with Status and Actions -->
          <div class="flex justify-between items-center mb-4">
            <!-- Status Tag on Left -->
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                template.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ template.is_active ? 'Active' : 'Inactive' }}
            </span>

            <!-- Action Buttons on Right -->
            <div class="flex items-center gap-1">
              <button
                @click="openPreviewModal(template)"
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Preview template"
              >
                <Icon name="prime:eye" class="w-4 h-4" />
              </button>
              <button
                @click="openEditModal(template)"
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit template"
              >
                <Icon name="prime:pencil" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Template Content with Media -->
          <div class="space-y-4">
            <!-- Text Content -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                {{ template.name }}
              </h3>
              <p class="text-sm text-gray-600 mb-2">
                {{ template.description }}
              </p>
              <p class="text-sm text-gray-500 line-clamp-3">
                {{ template.text_content }}
              </p>
            </div>

            <!-- Template Variables -->
            <div class="flex flex-wrap gap-1" v-if="template.variables.length">
              <span
                v-for="variable in template.variables"
                :key="variable"
                class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {{ '{' + variable + '}' }}
              </span>
            </div>

            <!-- Image Preview -->
            <div 
              v-if="template.media_url && isImageFile(template.media_filename)"
              class="flex justify-center"
            >
              <img 
                :src="template.media_url" 
                :alt="template.media_filename"
                class="max-w-full h-auto rounded-lg max-h-48 object-contain border border-gray-200"
                @error="handleImageError"
              />
            </div>

            <!-- Non-Image Media Info -->
            <div v-if="template.media_filename && !isImageFile(template.media_filename)" class="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <Icon name="prime:file" class="w-4 h-4" />
              <span class="truncate">{{ template.media_filename }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="templatesData?.results?.length === 0"
      class="text-center py-12"
    >
      <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon name="prime:file" class="text-xl text-gray-400" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        No templates found
      </h3>
      <p class="text-gray-600">
        There are no templates available at the moment.
      </p>
    </div>
  </div>

  <!-- Edit Template Modal -->
  <Dialog
    v-model:visible="showEditModal"
    :modal="true"
    :header="selectedTemplate ? 'Edit Template' : 'Create Template'"
    :style="{ width: '640px' }"
    :breakpoints="{ '640px': '90vw' }"
    @hide="resetEditForm"
  >
    <form @submit.prevent="handleSaveTemplate" class="space-y-6">
      <!-- Name -->
      <div>
        <label for="template-name" class="block text-sm font-medium text-gray-700 mb-2">
          Template Name
        </label>
        <InputText
          id="template-name"
          v-model="editForm.name"
          class="w-full"
          required
        />
      </div>

      <!-- Description -->
      <div>
        <label for="template-description" class="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <Textarea
          id="template-description"
          v-model="editForm.description"
          rows="2"
          class="w-full"
        />
      </div>

      <!-- Content -->
      <div>
        <label for="template-content" class="block text-sm font-medium text-gray-700 mb-2">
          Template Content
        </label>
        <Textarea
          id="template-content"
          v-model="editForm.text_content"
          rows="5"
          class="w-full"
          required
        />
        <p class="mt-1 text-sm text-gray-500">
          Use {'{variable}'} for dynamic content (e.g., {guest_name})
        </p>
      </div>

          <!-- Variables are auto-detected from template content -->

      <!-- Media File -->
      <div>
        <label for="template-media" class="block text-sm font-medium text-gray-700 mb-2">
          Media File (Optional)
        </label>
        <FileUpload
          id="template-media"
          mode="advanced"
          :auto="false"
          :showUploadButton="false"
          :showCancelButton="false"
          :multiple="false"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          :maxFileSize="10000000"
          :fileLimit="1"
          @select="onFileSelect"
          @remove="onFileRemove"
          class="w-full"
          chooseLabel="Choose File"
        >
          <template #empty>
            <div class="flex items-center justify-center py-4">
              <div class="text-center">
                <Icon name="prime:cloud-upload" class="text-4xl text-gray-400 mb-2" />
                <p class="text-sm text-gray-500">Drag and drop files here or click to browse</p>
                <p class="text-xs text-gray-400 mt-1">Images, videos, audio, and documents (Max: 10MB)</p>
              </div>
            </div>
          </template>
        </FileUpload>
        
        <!-- Current Media Display -->
        <div v-if="selectedTemplate?.media_filename || selectedTemplate?.media_url" class="mt-3 p-3 bg-gray-50 rounded-lg">
          <p class="text-sm font-medium text-gray-700 mb-2">Current Media:</p>
          <div class="flex items-center gap-3">
            <!-- Image Preview -->
            <div v-if="selectedTemplate.media_url && isImageFile(selectedTemplate.media_filename)" class="flex-shrink-0">
              <img 
                :src="selectedTemplate.media_url" 
                :alt="selectedTemplate.media_filename"
                class="w-16 h-16 object-cover rounded-lg"
              />
            </div>
            <!-- File Icon -->
            <div v-else class="flex-shrink-0">
              <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Icon name="prime:file" class="text-2xl text-gray-500" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ selectedTemplate.media_filename }}
              </p>
              <p class="text-xs text-gray-500">
                Media file for template
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Status -->
      <div class="flex items-center">
        <Checkbox
          id="template-active"
          v-model="editForm.is_active"
          binary
          class="mr-2"
        />
        <label for="template-active" class="text-sm font-medium text-gray-700">
          Template is active
        </label>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <Button
          label="Cancel"
          severity="secondary"
          @click="showEditModal = false"
        />
        <Button
          type="submit"
          :label="selectedTemplate ? 'Update Template' : 'Create Template'"
          :loading="isSaving"
        />
      </div>
    </form>
  </Dialog>

  <!-- Preview Template Modal -->
  <Dialog
    v-model:visible="showPreviewModal"
    :modal="true"
    :header="`Preview: ${previewData?.template_name || 'Template'}`"
    :style="{ width: '480px' }"
    :breakpoints="{ '480px': '95vw' }"
    contentClass="p-0"
  >
    <div v-if="previewData" class="bg-gray-100">
      <!-- WhatsApp-like Phone Container -->
      <div class="mx-auto" style="max-width: 360px;">
        <div class="bg-white shadow-xl">
          <!-- WhatsApp Header -->
          <div class="bg-[#075E54] px-4 py-3 flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="prime:user" class="w-4 h-4 text-white" />
            </div>
            <div class="flex-1">
              <p class="text-white font-medium text-sm">Guest</p>
              <p class="text-green-300 text-xs">Sample Contact</p>
            </div>
          </div>

          <!-- WhatsApp Message Area -->
          <div class="bg-[#E5DDD5] min-h-[300px] p-4" 
               style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRkFGQUZBIi8+Cjwvc3ZnPgo='); background-repeat: repeat; background-size: 40px 40px;">
            
            <!-- Message Bubble -->
            <div class="flex justify-start mb-3">
              <div class="max-w-[80%]">
                <!-- Message Content -->
                <div class="bg-white rounded-lg rounded-tl-none shadow-sm p-3">
                  <p class="text-gray-800 text-sm whitespace-pre-wrap break-words">
                    {{ previewData.rendered_content }}
                  </p>
                </div>
                
                <!-- Image in Message -->
                <div v-if="previewData.media_url && isImageFile(previewData.media_filename)" 
                     class="mt-1 bg-white rounded-lg rounded-tl-none shadow-sm overflow-hidden">
                  <img 
                    :src="previewData.media_url" 
                    :alt="previewData.media_filename"
                    class="max-w-full h-auto"
                    @error="handleImageError"
                  />
                </div>

                <!-- Timestamp -->
                <p class="text-xs text-gray-500 mt-1 px-1">
                  Just now
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Chips from 'primevue/chips';
import FileUpload from 'primevue/fileupload';
import { 
  useFetchTemplates, 
  useUpdateTemplate, 
  useFetchTemplateVariables,
  useManualTemplatePreview,
} from '~/composables/useTemplates';
import type {
  Template,
  TemplateUpdateRequest
} from '~/types/templates';

// Page metadata
definePageMeta({
  title: 'Templates',
  description: 'Manage global message templates for chat system',
});

// Router and Route
const router = useRouter();
const route = useRoute();

// Reactive state
const searchQuery = ref<string>((route.query.search as string) || '');
const selectedType = ref<string>((route.query.template_type as string) || '');
const selectedStatus = ref<string>((route.query.is_active as string) || '');
const showEditModal = ref<boolean>(false);
const showPreviewModal = ref<boolean>(false);
const selectedTemplate = ref<Template | null>(null);
const previewData = ref<any>(null);

// Edit form state
const editForm = ref<TemplateUpdateRequest>({
  name: '',
  text_content: '',
  description: '',
  variables: [],
  is_active: true,
  media_file: undefined,
});

// Fetch data
const { 
  data: templatesData, 
  isLoading, 
  error, 
  refetch 
} = useFetchTemplates();

const { 
  data: availableVariables 
} = useFetchTemplateVariables();

const { 
  updateTemplate,
  isLoading: isSaving 
} = useUpdateTemplate();

const { 
  fetchPreview 
} = useManualTemplatePreview();

// Methods
const handleSearch = debounce(() => {
  updateRouteQuery();
}, 300);

const handleFilterChange = () => {
  updateRouteQuery();
};

const updateRouteQuery = () => {
  const query: Record<string, string> = {};
  if (searchQuery.value) query.search = searchQuery.value;
  if (selectedType.value) query.template_type = selectedType.value;
  if (selectedStatus.value) query.is_active = selectedStatus.value;
  
  router.replace({ query });
};

const formatTemplateType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const openEditModal = (template: Template | null) => {
  selectedTemplate.value = template;
  
  if (template) {
    editForm.value = {
      name: template.name,
      text_content: template.text_content,
      description: template.description,
      variables: [...template.variables],
      is_active: template.is_active,
      media_file: undefined,
    };
  } else {
    editForm.value = {
      name: '',
      text_content: '',
      description: '',
      variables: [],
      is_active: true,
      media_file: undefined,
    };
  }
  
  showEditModal.value = true;
};

const resetEditForm = () => {
  selectedTemplate.value = null;
  editForm.value = {
    name: '',
    text_content: '',
    description: '',
    variables: [],
    is_active: true,
    media_file: undefined,
  };
};

const onFileSelect = (event: any) => {
  const files = event.files;
  if (files && files.length > 0) {
    editForm.value.media_file = files[0];
  }
};

const onFileRemove = () => {
  editForm.value.media_file = undefined;
};

const isImageFile = (filename: string): boolean => {
  if (!filename) return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension || '');
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Hide the image if it fails to load
  img.style.display = 'none';
};

const addVariable = (variableName: string) => {
  if (!editForm.value.variables) {
    editForm.value.variables = [];
  }
  if (!editForm.value.variables.includes(variableName)) {
    editForm.value.variables.push(variableName);
  }
  // Add variable to content
  if (editForm.value.text_content && !editForm.value.text_content.includes(`{${variableName}}`)) {
    editForm.value.text_content += ` {${variableName}}`;
  }
};

// Auto-detect variables from template content
const extractVariables = (content: string): string[] => {
  if (!content) return [];
  
  const regex = /\{([^}]+)\}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const variable = match[1].trim();
    if (variable && !variables.includes(variable)) {
      variables.push(variable);
    }
  }
  
  return variables;
};

const handleSaveTemplate = async () => {
  try {
    if (!selectedTemplate.value) {
      // TODO: Implement create template
      console.error('Create template not implemented yet');
      return;
    }
    
    // Auto-extract variables from content
    const detectedVariables = extractVariables(editForm.value.text_content || '');
    
    const hasMedia = !!editForm.value.media_file;
    await updateTemplate({
      id: selectedTemplate.value.id.toString(),
      data: {
        ...editForm.value,
        variables: detectedVariables
      },
      hasMedia
    });
    
    showEditModal.value = false;
    refetch();
  } catch (err) {
    console.error('Failed to save template:', err);
  }
};

const openPreviewModal = async (template: Template) => {
  try {
    const preview = await fetchPreview(template.id.toString());
    previewData.value = preview;
    showPreviewModal.value = true;
  } catch (err) {
    console.error('Failed to fetch template preview:', err);
  }
};

// Debounce utility
function debounce(fn: Function, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// SEO and meta
useHead({
  title: 'Templates - Hotel Admin',
  meta: [
    {
      name: 'description',
      content: 'Manage global message templates for chat system',
    },
  ],
});
</script>

<style scoped>
/* Button styles */
.button-primary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600;
}

/* Form select styles */
.form-select {
  @apply block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white;
}

/* Card styles */
.card {
  @apply bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg;
}

/* Error state styles */
.error-state {
  @apply bg-red-50 border border-red-200 rounded-lg p-6;
}

/* Loading skeleton styles */
.skeleton {
  @apply bg-gray-200 rounded;
}

.skeleton-card {
  @apply bg-white border border-gray-200 rounded-lg overflow-hidden;
}

/* Text clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .page-container {
    @apply px-3;
  }

  .header-section {
    @apply text-center;
  }

  .card {
    @apply p-4;
  }
}
</style>