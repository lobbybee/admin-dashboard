<template>
    <div class="flex items-center gap-4">
        <div
            class="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden"
        >
            <img
                v-if="logoUrl"
                :src="logoUrl"
                alt="Hotel logo"
                class="w-full h-full object-contain"
            />
            <i v-else class="pi pi-image text-2xl text-gray-300" aria-hidden="true"></i>
        </div>
        <div class="space-y-2">
            <label class="text-xs md:text-sm font-medium text-gray-700 block">
                Logo <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <div class="flex items-center gap-2">
                <FileUpload
                    ref="uploader"
                    mode="basic"
                    name="logo"
                    :custom-upload="true"
                    :auto="true"
                    :multiple="false"
                    accept="image/*"
                    :max-file-size="2000000"
                    :choose-label="logoUrl ? 'Change' : 'Upload'"
                    :disabled="isLoading"
                    @uploader="onUpload"
                />
                <Button
                    v-if="logoUrl"
                    label="Remove"
                    text
                    severity="danger"
                    size="small"
                    :loading="isLoading"
                    @click="onRemove"
                />
            </div>
            <small class="text-gray-500 text-xs block">PNG or JPG, up to 2MB</small>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FileUpload, { type FileUploadUploaderEvent } from "primevue/fileupload";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import { useUpdateHotelLogo } from "~/composables/useHotel";

const props = defineProps<{
    hotelId: string;
    logoUrl: string | null;
}>();

const emit = defineEmits<{ (e: "updated"): void }>();

const toast = useToast();
const { updateHotelLogo, isLoading } = useUpdateHotelLogo();
const uploader = ref();

const save = async (logo: File | null, summary: string) => {
    try {
        await updateHotelLogo({ id: props.hotelId, logo });
        toast.add({ severity: "success", summary, life: 3000 });
        emit("updated");
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.message || "Failed to update the hotel logo.",
            life: 5000,
        });
    }
};

const onUpload = async (event: FileUploadUploaderEvent) => {
    const file = Array.isArray(event.files) ? event.files[0] : event.files;
    if (!file) return;
    await save(file, "Logo updated");
    uploader.value?.clear();
};

const onRemove = () => save(null, "Logo removed");
</script>
