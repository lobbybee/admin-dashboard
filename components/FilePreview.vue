<template>
    <div v-if="url" class="inline-flex flex-col gap-1">
        <button
            v-if="showsImage"
            type="button"
            class="group relative block rounded-lg border border-gray-200 bg-gray-50 overflow-hidden hover:border-blue-400 transition-colors"
            :class="sizeClass"
            :title="`Open ${label}`"
            @click="isOpen = true"
        >
            <img
                :src="url"
                :alt="label"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="failedToLoad = true"
            />
            <span
                class="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/40"
            >
                <i class="pi pi-search-plus text-white"></i>
            </span>
        </button>

        <!-- PDFs and anything the browser cannot render inline -->
        <a
            v-else
            :href="url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
        >
            <i class="pi pi-file-pdf text-red-500"></i>
            {{ label }}
        </a>

        <span v-if="caption" class="text-xs text-gray-500">{{ caption }}</span>

        <Dialog
            v-model:visible="isOpen"
            modal
            :header="label"
            class="w-full max-w-3xl"
            dismissable-mask
        >
            <img :src="url" :alt="label" class="w-full h-auto rounded" />
            <template #footer>
                <a
                    :href="url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    <i class="pi pi-external-link"></i>
                    Open original
                </a>
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Dialog from "primevue/dialog";

const props = withDefaults(
    defineProps<{
        url: string | null;
        label?: string;
        caption?: string;
        size?: "sm" | "md";
    }>(),
    { label: "Document", caption: "", size: "md" },
);

const isOpen = ref(false);
const failedToLoad = ref(false);

const sizeClass = computed(() =>
    props.size === "sm" ? "w-16 h-16" : "w-24 h-24",
);

// Query strings on signed S3 URLs would break a naive endsWith check.
const isPdf = computed(() => {
    const [path = ""] = (props.url || "").split("?");
    return path.toLowerCase().endsWith(".pdf");
});

// Try to render anything that is not obviously a PDF; the img error handler
// catches the rest, so an unknown extension still degrades to a link.
const showsImage = computed(
    () => !!props.url && !isPdf.value && !failedToLoad.value,
);
</script>
