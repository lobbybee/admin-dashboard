<template>
    <Dialog
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        :header="`Hotel Details: ${hotel?.name}`"
        modal
        class="w-full max-w-4xl"
        :content-style="{ padding: 0 }"
    >
        <div v-if="hotel">
            <TabView class="pt-0">
                <TabPanel header="General Information">
                    <div class="px-4 py-3 md:p-6">
                        <!-- Edit/Save Actions -->
                        <div
                            class="flex justify-end gap-2 md:gap-3 mb-4 md:mb-6"
                        >
                            <template v-if="!isEditing">
                                <Button
                                    label="Edit Details"
                                    icon="pi pi-pencil"
                                    @click="startEditing"
                                    size="small"
                                    severity="secondary"
                                />
                            </template>
                            <template v-else>
                                <Button
                                    label="Cancel"
                                    icon="pi pi-times"
                                    @click="cancelEditing"
                                    size="small"
                                    severity="secondary"
                                    :disabled="isSaving"
                                />
                                <Button
                                    label="Save Changes"
                                    icon="pi pi-check"
                                    @click="saveHotelDetails"
                                    size="small"
                                    severity="success"
                                    :loading="isSaving || updateLoading"
                                />
                            </template>
                        </div>

                        <!-- Hotel Overview Section -->
                        <div
                            class="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6 hover:shadow-md transition-all duration-200"
                        >
                            <div class="flex items-center gap-3 md:gap-4 mb-4">
                                <div
                                    class="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg flex items-center justify-center"
                                >
                                    <i
                                        class="pi pi-building text-blue-600 text-lg md:text-xl"
                                    ></i>
                                </div>
                                <div class="flex-1">
                                    <h3
                                        class="text-base md:text-lg font-semibold text-gray-900"
                                    >
                                        Hotel Overview
                                    </h3>
                                    <p class="text-sm text-gray-600">
                                        Basic information and status
                                    </p>
                                </div>
                                <StatusBadge :status="hotel.status" />
                            </div>

                            <div class="space-y-4">
                                <!-- Hotel Name and Status -->
                                <div
                                    class="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <div class="space-y-2">
                                        <label
                                            class="text-xs md:text-sm font-medium text-gray-700"
                                            >Hotel Name</label
                                        >
                                        <template v-if="isEditing">
                                            <InputText
                                                v-model="hotelFormData.name"
                                                class="w-full"
                                                placeholder="Enter hotel name"
                                            />
                                        </template>
                                        <template v-else>
                                            <p
                                                class="text-sm md:text-base text-gray-900 font-medium"
                                            >
                                                {{ hotel.name }}
                                            </p>
                                        </template>
                                    </div>

                                    <div class="space-y-2">
                                        <label
                                            class="text-xs md:text-sm font-medium text-gray-700"
                                            >Status</label
                                        >
                                        <StatusBadge :status="hotel.status" />
                                    </div>
                                </div>

                                <!-- Description -->
                                <div class="space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >Description</label
                                    >
                                    <template v-if="isEditing">
                                        <Textarea
                                            v-model="hotelFormData.description"
                                            rows="3"
                                            class="w-full"
                                            placeholder="Enter hotel description"
                                        />
                                    </template>
                                    <template v-else>
                                        <p
                                            class="text-sm text-gray-700 leading-relaxed"
                                        >
                                            {{
                                                hotel.description ||
                                                "No description available"
                                            }}
                                        </p>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- Location Section -->
                        <div
                            class="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6 hover:shadow-md transition-all duration-200"
                        >
                            <div class="flex items-center gap-3 md:gap-4 mb-4">
                                <div
                                    class="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-lg flex items-center justify-center"
                                >
                                    <i
                                        class="pi pi-map-marker text-amber-600 text-lg md:text-xl"
                                    ></i>
                                </div>
                                <div>
                                    <h3
                                        class="text-base md:text-lg font-semibold text-gray-900"
                                    >
                                        Location
                                    </h3>
                                    <p class="text-sm text-gray-600">
                                        Address and geographic information
                                    </p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Address -->
                                <div class="md:col-span-2 space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >Street Address</label
                                    >
                                    <template v-if="isEditing">
                                        <InputText
                                            v-model="hotelFormData.address"
                                            class="w-full"
                                            placeholder="Enter street address"
                                        />
                                    </template>
                                    <template v-else>
                                        <p class="text-sm text-gray-900">
                                            {{
                                                hotel.address || "Not provided"
                                            }}
                                        </p>
                                    </template>
                                </div>

                                <!-- City & State -->
                                <div class="space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >City</label
                                    >
                                    <template v-if="isEditing">
                                        <InputText
                                            v-model="hotelFormData.city"
                                            class="w-full"
                                            placeholder="Enter city"
                                        />
                                    </template>
                                    <template v-else>
                                        <p
                                            class="text-sm text-gray-900 font-medium"
                                        >
                                            {{ hotel.city }}
                                        </p>
                                    </template>
                                </div>

                                <div class="space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >State</label
                                    >
                                    <template v-if="isEditing">
                                        <InputText
                                            v-model="hotelFormData.state"
                                            class="w-full"
                                            placeholder="Enter state"
                                        />
                                    </template>
                                    <template v-else>
                                        <p class="text-sm text-gray-900">
                                            {{ hotel.state }}
                                        </p>
                                    </template>
                                </div>

                                <!-- Pincode & Country -->
                                <div class="space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >Pincode</label
                                    >
                                    <template v-if="isEditing">
                                        <InputText
                                            v-model="hotelFormData.pincode"
                                            class="w-full"
                                            placeholder="Enter pincode"
                                        />
                                    </template>
                                    <template v-else>
                                        <p class="text-sm text-gray-900">
                                            {{ hotel.pincode }}
                                        </p>
                                    </template>
                                </div>

                                <div class="space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >Country</label
                                    >
                                    <template v-if="isEditing">
                                        <InputText
                                            v-model="hotelFormData.country"
                                            class="w-full"
                                            placeholder="Enter country"
                                        />
                                    </template>
                                    <template v-else>
                                        <p
                                            class="text-sm text-gray-900 font-medium"
                                        >
                                            {{ hotel.country }}
                                        </p>
                                    </template>
                                </div>


                            </div>
                            <!-- Coordinates -->
                                                <div class="py-3 flex flex-col gap-3">
                                                    <label
                                                        class="text-xs md:text-sm font-medium text-gray-700"
                                                        >Latitude</label
                                                    >
                                                    <template v-if="isEditing">
                                                        <InputNumber
                                                            v-model="hotelFormData.latitude"
                                                            class="max-w-sm"
                                                            placeholder="Enter latitude"
                                                            mode="decimal"
                                                            :minFractionDigits="6"
                                                            :maxFractionDigits="6"
                                                        />
                                                    </template>
                                                    <template v-else>
                                                        <p class="text-sm text-gray-900">
                                                            {{
                                                                hotel.latitude || "Not provided"
                                                            }}
                                                        </p>
                                                    </template>
                                                </div>
                            <div class="py-3 flex flex-col gap-3">
                                <label
                                    class="text-xs md:text-sm font-medium text-gray-700"
                                    >Longitude</label
                                >
                                <template v-if="isEditing">
                                    <InputNumber
                                        v-model="hotelFormData.longitude"
                                        class="max-w-sm"
                                        placeholder="Enter longitude"
                                        mode="decimal"
                                        :minFractionDigits="6"
                                        :maxFractionDigits="6"
                                    />
                                </template>
                                <template v-else>
                                    <p class="text-sm text-gray-900">
                                        {{ hotel.longitude || "Not provided" }}
                                    </p>
                                </template>
                            </div>
                        </div>

                        <!-- Contact Information Section -->
                        <div
                            class="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6 hover:shadow-md transition-all duration-200"
                        >
                            <div class="flex items-center gap-3 md:gap-4 mb-4">
                                <div
                                    class="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-lg flex items-center justify-center"
                                >
                                    <i
                                        class="pi pi-phone text-green-600 text-lg md:text-xl"
                                    ></i>
                                </div>
                                <div>
                                    <h3
                                        class="text-base md:text-lg font-semibold text-gray-900"
                                    >
                                        Contact Information
                                    </h3>
                                    <p class="text-sm text-gray-600">
                                        Phone, email and communication channels
                                    </p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Phone -->
                                <div class="space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >Phone Number</label
                                    >
                                    <template v-if="isEditing">
                                        <InputText
                                            v-model="hotelFormData.phone"
                                            class="w-full"
                                            placeholder="Enter phone number"
                                        />
                                    </template>
                                    <template v-else>
                                        <p class="text-sm text-gray-900">
                                            {{ hotel.phone || "Not provided" }}
                                        </p>
                                    </template>
                                </div>

                                <!-- Email -->
                                <div class="space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >Email Address</label
                                    >
                                    <template v-if="isEditing">
                                        <InputText
                                            v-model="hotelFormData.email"
                                            class="w-full"
                                            placeholder="Enter email address"
                                        />
                                    </template>
                                    <template v-else>
                                        <p class="text-sm text-gray-900">
                                            {{ hotel.email || "Not provided" }}
                                        </p>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- Additional Settings Section -->
                        <div
                            class="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-md transition-all duration-200"
                        >
                            <div class="flex items-center gap-3 md:gap-4 mb-4">
                                <div
                                    class="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-lg flex items-center justify-center"
                                >
                                    <i
                                        class="pi pi-cog text-purple-600 text-lg md:text-xl"
                                    ></i>
                                </div>
                                <div>
                                    <h3
                                        class="text-base md:text-lg font-semibold text-gray-900"
                                    >
                                        Additional Settings
                                    </h3>
                                    <p class="text-sm text-gray-600">
                                        External links and operational settings
                                    </p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Google Review Link -->
                                <div class="space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >Google Review Link</label
                                    >
                                    <template v-if="isEditing">
                                        <InputText
                                            v-model="
                                                hotelFormData.google_review_link
                                            "
                                            class="w-full"
                                            placeholder="Enter Google review link"
                                        />
                                    </template>
                                    <template v-else>
                                        <p
                                            class="text-sm text-gray-900 break-all"
                                        >
                                            {{
                                                hotel.google_review_link ||
                                                "Not provided"
                                            }}
                                        </p>
                                    </template>
                                </div>

                                <!-- QR Code URL -->
                                <!-- <div class="space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >QR Code URL</label
                                    >
                                    <template v-if="isEditing">
                                        <InputText
                                            v-model="hotelFormData.qr_code_url"
                                            class="w-full"
                                            placeholder="Enter QR code URL"
                                        />
                                    </template>
                                    <template v-else>
                                        <p
                                            class="text-sm text-gray-900 break-all"
                                        >
                                            {{
                                                hotel.qr_code_url ||
                                                "Not provided"
                                            }}
                                        </p>
                                    </template>
                                </div> -->

                                <!-- Check-in Time -->
                                <div class="space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >Check-in Time</label
                                    >
                                    <template v-if="isEditing">
                                        <DatePicker
                                            v-model="
                                                hotelFormData.check_in_time
                                            "
                                            time-only
                                            hour-format="24"
                                            :step-minute="15"
                                            show-time
                                            class="w-full"
                                            placeholder="Select check-in time"
                                        />
                                    </template>
                                    <template v-else>
                                        <p class="text-sm text-gray-900">
                                            {{
                                                hotel.check_in_time ||
                                                "Not provided"
                                            }}
                                        </p>
                                    </template>
                                </div>

                                <!-- Time Zone -->
                                <div class="space-y-2">
                                    <label
                                        class="text-xs md:text-sm font-medium text-gray-700"
                                        >Time Zone</label
                                    >
                                    <template v-if="isEditing">
                                        <Dropdown
                                            v-model="hotelFormData.time_zone"
                                            :options="timezones"
                                            option-label="label"
                                            option-value="value"
                                            class="w-full"
                                            placeholder="Select timezone"
                                            filter
                                        />
                                    </template>
                                    <template v-else>
                                        <p class="text-sm text-gray-900">
                                            {{
                                                getTimezoneLabel(
                                                    hotel.time_zone,
                                                ) || "Not provided"
                                            }}
                                        </p>
                                    </template>
                                </div>
                            </div>
                            
                        </div>

                        <!-- Toggle Upload Form Button - Always visible when upload form is hidden -->
                        <div v-if="!showUploadForm" class="text-center py-4">
                            <Button
                                label="Add Document"
                                icon="pi pi-plus"
                                @click="showUploadForm = true"
                                severity="primary"
                                size="small"
                            />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Documents">
                    <div class="p-6">
                        <!-- Document Upload Section -->
                        <div
                            v-if="showUploadForm"
                            class="bg-white rounded-lg border border-gray-200 p-6 mb-6"
                        >
                            <div class="flex items-center gap-3 mb-4">
                                <div
                                    class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center"
                                >
                                    <i class="pi pi-upload text-green-600"></i>
                                </div>
                                <div>
                                    <h3
                                        class="text-lg font-semibold text-gray-900"
                                    >
                                        Upload New Document
                                    </h3>
                                    <p class="text-sm text-gray-600">
                                        Add verification documents for this
                                        hotel
                                    </p>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <div
                                    class="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <div>
                                        <label
                                            for="documentType"
                                            class="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Document Type
                                        </label>
                                        <Dropdown
                                            id="documentType"
                                            v-model="documentType"
                                            :options="[
                                                { label: 'License Document', value: 'license' },
                                                { label: 'Registration Document', value: 'registration' },
                                                { label: 'Other Document', value: 'other' }
                                            ]"
                                            option-label="label"
                                            option-value="value"
                                            placeholder="Select document type"
                                            class="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            for="documentFile"
                                            class="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Document File
                                        </label>
                                        <FileUpload
                                            id="documentFile"
                                            mode="basic"
                                            :auto="false"
                                            :custom-upload="true"
                                            @select="onDocumentFileSelect"
                                            @upload="onDocumentUpload"
                                            :disabled="documentUploadLoading"
                                            accept="application/pdf,.jpg,.jpeg,.png"
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <div class="flex justify-end">
                                    <Button
                                        label="Upload Document"
                                        icon="pi pi-upload"
                                        @click="uploadDocument"
                                        :loading="documentUploadLoading"
                                        :disabled="
                                            !documentType ||
                                            !selectedDocumentFile
                                        "
                                        severity="primary"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Existing Documents Section -->
                        <div
                            v-if="hotel.documents && hotel.documents.length > 0"
                        >
                            <div
                                class="bg-white rounded-lg border border-gray-200 overflow-hidden"
                            >
                                <DataTable
                                    :value="hotel.documents"
                                    :paginator="hotel.documents.length > 5"
                                    :rows="5"
                                    class="border-0"
                                >
                                    <template #header>
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"
                                            >
                                                <i
                                                    class="pi pi-file text-indigo-600"
                                                ></i>
                                            </div>
                                            <div>
                                                <h3
                                                    class="text-lg font-semibold text-gray-900"
                                                >
                                                    Uploaded Documents
                                                </h3>
                                                <p
                                                    class="text-sm text-gray-600"
                                                >
                                                    Hotel verification documents
                                                </p>
                                            </div>
                                        </div>
                                    </template>
                                    <Column
                                        field="document_type"
                                        header="Document Type"
                                        sortable
                                    >
                                        <template #body="{ data }">
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <div
                                                    class="w-8 h-8 bg-gray-50 rounded flex items-center justify-center"
                                                >
                                                    <i
                                                        class="pi pi-file-pdf text-red-500 text-sm"
                                                    ></i>
                                                </div>
                                                <span
                                                    class="font-medium text-gray-900"
                                                    >{{
                                                        data.document_type
                                                    }}</span
                                                >
                                            </div>
                                        </template>
                                    </Column>
                                    <Column
                                        field="uploaded_at"
                                        header="Upload Date"
                                        sortable
                                    >
                                        <template #body="{ data }">
                                            <div class="text-gray-700">
                                                {{
                                                    new Date(
                                                        data.uploaded_at,
                                                    ).toLocaleDateString()
                                                }}
                                            </div>
                                        </template>
                                    </Column>
                                    <Column header="Actions">
                                        <template #body="{ data }">
                                            <a
                                                :href="data.document_file_url"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <i class="pi pi-eye"></i>
                                                View Document
                                            </a>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                            
                            <!-- Add Document Button - Always visible when upload form is hidden -->
                            <div v-if="!showUploadForm" class="text-center py-4">
                                <Button
                                    label="Add Document"
                                    icon="pi pi-plus"
                                    @click="showUploadForm = true"
                                    severity="primary"
                                    size="small"
                                />
                            </div>
                        </div>
                        <div v-else class="text-center py-12">
                            <div
                                class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <i
                                    class="pi pi-file text-gray-400 text-2xl"
                                ></i>
                            </div>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">
                                No documents found
                            </h3>
                            <p class="text-gray-500">
                                No documents have been uploaded for this hotel
                            </p>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Admin">
                    <div class="p-6">
                        <div v-if="hotel && hotel.admin">
                            <div
                                class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                            >
                                <div class="flex items-center gap-4 mb-6">
                                    <div
                                        class="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center"
                                    >
                                        <i
                                            class="pi pi-user text-purple-600 text-xl"
                                        ></i>
                                    </div>
                                    <div>
                                        <h3
                                            class="text-xl font-bold text-gray-900"
                                        >
                                            {{ hotel.admin.username }}
                                        </h3>
                                        <p class="text-sm text-gray-600">
                                            {{ hotel.admin.user_type }}
                                        </p>
                                    </div>
                                    <div class="ml-auto">
                                        <StatusBadge
                                            :status="
                                                hotel.admin.status || 'active'
                                            "
                                        />
                                    </div>
                                </div>

                                <div class="border-t border-gray-200 pt-4">
                                    <h4
                                        class="text-sm font-semibold text-gray-900 mb-3"
                                    >
                                        Admin Contact Information
                                    </h4>
                                    <div
                                        class="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"
                                            >
                                                <i
                                                    class="pi pi-envelope text-blue-600 text-sm"
                                                ></i>
                                            </div>
                                            <div>
                                                <p
                                                    class="text-xs font-medium text-gray-700"
                                                >
                                                    Email
                                                </p>
                                                <p
                                                    class="text-sm text-gray-900"
                                                >
                                                    {{ hotel.admin.email }}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"
                                            >
                                                <i
                                                    class="pi pi-phone text-green-600 text-sm"
                                                ></i>
                                            </div>
                                            <div>
                                                <p
                                                    class="text-xs font-medium text-gray-700"
                                                >
                                                    Phone
                                                </p>
                                                <p
                                                    class="text-sm text-gray-900"
                                                >
                                                    {{
                                                        hotel.admin
                                                            .phone_number ||
                                                        "Not provided"
                                                    }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-12">
                            <div
                                class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <i
                                    class="pi pi-user text-gray-400 text-2xl"
                                ></i>
                            </div>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">
                                No admin information
                            </h3>
                            <p class="text-gray-500">
                                Admin information is not available for this
                                hotel
                            </p>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Actions">
                    <div class="p-6">
                        <div
                            v-if="hotel.status === 'pending'"
                            class="space-y-6"
                        >
                            <div
                                class="bg-amber-50 border border-amber-200 rounded-lg p-4"
                            >
                                <div class="flex">
                                    <div class="flex-shrink-0">
                                        <i
                                            class="pi pi-exclamation-triangle text-amber-400 text-xl"
                                        ></i>
                                    </div>
                                    <div class="ml-3">
                                        <h3
                                            class="text-sm font-medium text-amber-800"
                                        >
                                            Review Application
                                        </h3>
                                        <p class="mt-1 text-sm text-amber-700">
                                            This hotel application is pending
                                            review. Please verify the documents
                                            and information before approval.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <h3 class="text-lg font-semibold text-gray-900">
                                    Verification Actions
                                </h3>

                                <div class="space-y-2">
                                    <label
                                        for="verificationNotes"
                                        class="block text-sm font-medium text-gray-700"
                                    >
                                        Notes
                                        <span class="text-red-500">*</span>
                                        <span class="text-gray-500"
                                            >(Required for rejection)</span
                                        >
                                    </label>
                                    <Textarea
                                        v-model="verificationNotes"
                                        id="verificationNotes"
                                        placeholder="Add verification notes or rejection reasons..."
                                        rows="4"
                                        class="w-full"
                                    />
                                </div>

                                <div
                                    class="flex justify-end gap-3 pt-4 border-t border-gray-200"
                                >
                                    <Button
                                        label="Reject Application"
                                        icon="pi pi-times"
                                        @click="onRejectHotel"
                                        :loading="rejectLoading"
                                        severity="danger"
                                        size="large"
                                    />
                                    <Button
                                        label="Verify & Approve"
                                        icon="pi pi-check"
                                        @click="onVerifyHotel"
                                        :loading="verifyLoading"
                                        severity="success"
                                        size="large"
                                    />
                                </div>
                            </div>
                        </div>

                        <div
                            v-else-if="hotel.status === 'verified'"
                            class="space-y-6"
                        >
                            <h3 class="text-lg font-semibold text-gray-900">
                                Hotel Management
                            </h3>

                            <div
                                class="bg-white rounded-lg border border-gray-200 p-6"
                            >
                                <div class="flex items-center justify-between">
                                    <div>
                                        <h4
                                            class="text-base font-medium text-gray-900 mb-2"
                                        >
                                            Hotel Active Status
                                        </h4>
                                        <p class="text-sm text-gray-600 mb-3">
                                            The hotel is currently
                                            <StatusBadge
                                                :status="
                                                    hotel.is_active
                                                        ? 'active'
                                                        : 'inactive'
                                                "
                                                class="inline-flex ml-1"
                                            />
                                        </p>
                                    </div>
                                    <Button
                                        :label="
                                            hotel.is_active
                                                ? 'Deactivate Hotel'
                                                : 'Activate Hotel'
                                        "
                                        :icon="
                                            hotel.is_active
                                                ? 'pi pi-times-circle'
                                                : 'pi pi-check-circle'
                                        "
                                        @click="onToggleActive"
                                        :loading="toggleActiveLoading"
                                        :severity="
                                            hotel.is_active
                                                ? 'danger'
                                                : 'success'
                                        "
                                        size="large"
                                    />
                                </div>
                            </div>
                        </div>

                        <div v-else class="text-center py-12">
                            <div
                                class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <i
                                    class="pi pi-info-circle text-gray-400 text-2xl"
                                ></i>
                            </div>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">
                                No actions available
                            </h3>
                            <p class="text-gray-500">
                                No actions are available for a hotel with
                                status:
                                <span class="font-medium">{{
                                    hotel.status
                                }}</span>
                            </p>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </div>
        <div v-else class="flex items-center justify-center p-8">
            <div class="text-center">
                <div
                    class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
                ></div>
                <p class="text-gray-600">Loading hotel details...</p>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Textarea from "primevue/textarea";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Dropdown from "primevue/dropdown";
import FileUpload from "primevue/fileupload";
import DatePicker from "primevue/datepicker";
import { useToast } from "primevue/usetoast";
import StatusBadge from "./StatusBadge.vue";
import {
    useVerifyHotel,
    useToggleHotelActive,
    useRejectHotel,
    useUpdateHotel,
    useUpdateHotelDocument,
    type Hotel,
} from "~/composables/useHotel";
import type { UpdateHotelDocumentData } from "~/types/hotel";

const props = defineProps<{
    hotel: Hotel | null;
    visible: boolean;
}>();

const emit = defineEmits<{
    (e: "update:visible", value: boolean): void;
    (e: "hotel-updated"): void;
}>();

const toast = useToast();
const verificationNotes = ref("");

// Edit mode states
const isEditing = ref(false);
const isSaving = ref(false);
const hotelFormData = ref({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    phone: "",
    email: "",
    google_review_link: "",
    latitude: null as number | null,
    longitude: null as number | null,
    qr_code_url: "",
    check_in_time: "",
    time_zone: "",
});

const { verifyHotel, isLoading: verifyLoading } = useVerifyHotel();
const { toggleHotelActive, isLoading: toggleActiveLoading } =
    useToggleHotelActive();
const { rejectHotel, isLoading: rejectLoading } = useRejectHotel();
const { updateHotel, isLoading: updateLoading } = useUpdateHotel();
const { updateHotelDocument, isLoading: documentUploadLoading } =
    useUpdateHotelDocument();

watch(
    () => props.hotel,
    (newHotel) => {
        if (newHotel) {
            verificationNotes.value = newHotel.verification_notes || "";

            // Populate form data when hotel changes
            hotelFormData.value = {
                name: newHotel.name || "",
                description: newHotel.description || "",
                address: newHotel.address || "",
                city: newHotel.city || "",
                state: newHotel.state || "",
                country: newHotel.country || "",
                pincode: newHotel.pincode || "",
                phone: newHotel.phone || "",
                email: newHotel.email || "",
                google_review_link: newHotel.google_review_link || "",
                latitude: newHotel.latitude
                    ? parseFloat(newHotel.latitude)
                    : null,
                longitude: newHotel.longitude
                    ? parseFloat(newHotel.longitude)
                    : null,
                qr_code_url: newHotel.qr_code_url || "",
                check_in_time: newHotel.check_in_time || "",
                time_zone: newHotel.time_zone || "",
            };
        }
    },
);

const getStatusSeverity = (status: string) => {
    switch (status) {
        case "verified":
            return "success";
        case "pending":
            return "warning";
        case "suspended":
            return "danger";
        case "rejected":
            return "danger";
        default:
            return "info";
    }
};

const onVerifyHotel = async () => {
    if (!props.hotel) return;
    try {
        await verifyHotel({
            id: props.hotel.id,
            data: { notes: verificationNotes.value },
        });
        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Hotel verified successfully!",
            life: 3000,
        });
        emit("update:visible", false);
        emit("hotel-updated");
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.message || "Failed to verify hotel.",
            life: 3000,
        });
    }
};

const onRejectHotel = async () => {
    if (!props.hotel) return;
    if (!verificationNotes.value) {
        toast.add({
            severity: "warn",
            summary: "Warning",
            detail: "Rejection notes are required.",
            life: 3000,
        });
        return;
    }
    try {
        await rejectHotel({
            id: props.hotel.id,
            data: { notes: verificationNotes.value },
        });
        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Hotel rejected successfully!",
            life: 3000,
        });
        emit("update:visible", false);
        emit("hotel-updated");
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.message || "Failed to reject hotel.",
            life: 3000,
        });
    }
};

const onToggleActive = async () => {
    if (!props.hotel) return;
    try {
        const response = await toggleHotelActive(props.hotel.id);
        toast.add({
            severity: "success",
            summary: "Success",
            detail: response.status,
            life: 3000,
        });
        emit("update:visible", false);
        emit("hotel-updated");
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.message || "Failed to update hotel status.",
            life: 3000,
        });
    }
};

// Document upload related state
const documentType = ref("license");
const selectedDocumentFile = ref<File | null>(null);
const showUploadForm = ref(false);

// Timezone data
const timezones = [
    { label: "India Standard Time (IST)", value: "Etc/GMT-5" },
    { label: "UTC", value: "UTC" },
    { label: "GMT", value: "GMT" },
    { label: "EST (Eastern Standard Time)", value: "America/New_York" },
    { label: "CST (Central Standard Time)", value: "America/Chicago" },
    { label: "MST (Mountain Standard Time)", value: "America/Denver" },
    { label: "PST (Pacific Standard Time)", value: "America/Los_Angeles" },
    { label: "GMT+1", value: "Etc/GMT-1" },
    { label: "GMT+2", value: "Etc/GMT-2" },
    { label: "GMT+3", value: "Etc/GMT-3" },
    { label: "GMT+4", value: "Etc/GMT-4" },
    { label: "GMT+5", value: "Etc/GMT-5" },
    { label: "GMT+6", value: "Etc/GMT-6" },
    { label: "GMT+7", value: "Etc/GMT-7" },
    { label: "GMT+8", value: "Etc/GMT-8" },
    { label: "GMT+9", value: "Etc/GMT-9" },
    { label: "GMT+10", value: "Etc/GMT-10" },
    { label: "GMT+11", value: "Etc/GMT-11" },
    { label: "GMT+12", value: "Etc/GMT-12" },
    { label: "GMT-1", value: "Etc/GMT+1" },
    { label: "GMT-2", value: "Etc/GMT+2" },
    { label: "GMT-3", value: "Etc/GMT+3" },
    { label: "GMT-4", value: "Etc/GMT+4" },
    { label: "GMT-5", value: "Etc/GMT+5" },
    { label: "GMT-6", value: "Etc/GMT+6" },
    { label: "GMT-7", value: "Etc/GMT+7" },
    { label: "GMT-8", value: "Etc/GMT+8" },
    { label: "GMT-9", value: "Etc/GMT+9" },
    { label: "GMT-10", value: "Etc/GMT+10" },
    { label: "GMT-11", value: "Etc/GMT+11" },
    { label: "GMT-12", value: "Etc/GMT+12" },
    { label: "London", value: "Europe/London" },
    { label: "Paris", value: "Europe/Paris" },
    { label: "Tokyo", value: "Asia/Tokyo" },
    { label: "Sydney", value: "Australia/Sydney" },
];

// Document upload functions
const onDocumentFileSelect = (event: any) => {
    selectedDocumentFile.value = event.files[0];
};

const onDocumentUpload = async () => {
    if (!props.hotel || !selectedDocumentFile.value || !documentType.value)
        return;

    try {
        const documentData: UpdateHotelDocumentData = {
            document_type: documentType.value as
                | "license"
                | "registration"
                | "other",
            document_file: selectedDocumentFile.value,
        };

        // Use the new smart composable - no documentId means use update-by-type endpoint
        await updateHotelDocument({
            hotelId: props.hotel.id,
            data: documentData,
        });

        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Document uploaded successfully!",
            life: 3000,
        });

        // Reset form and hide upload form
        selectedDocumentFile.value = null;
        documentType.value = "license";
        showUploadForm.value = false;

        // Emit event to refresh hotel data
        emit("hotel-updated");
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.message || "Failed to upload document.",
            life: 3000,
        });
    }
};

// Upload document function for template
const uploadDocument = onDocumentUpload;

// Helper function to get timezone label
const getTimezoneLabel = (timezoneValue: string | undefined) => {
    if (!timezoneValue) return "";
    const timezone = timezones.find((tz) => tz.value === timezoneValue);
    return timezone ? timezone.label : timezoneValue;
};

// Function to toggle upload form visibility
const toggleUploadForm = () => {
    showUploadForm.value = !showUploadForm.value;
};

// Hotel update functions
const startEditing = () => {
    isEditing.value = true;
};

const cancelEditing = () => {
    isEditing.value = false;
    // Reset form data to original hotel values
    if (props.hotel) {
        hotelFormData.value = {
            name: props.hotel.name || "",
            description: props.hotel.description || "",
            address: props.hotel.address || "",
            city: props.hotel.city || "",
            state: props.hotel.state || "",
            country: props.hotel.country || "",
            pincode: props.hotel.pincode || "",
            phone: props.hotel.phone || "",
            email: props.hotel.email || "",
            google_review_link: props.hotel.google_review_link || "",
            latitude: props.hotel.latitude
                ? parseFloat(props.hotel.latitude)
                : null,
            longitude: props.hotel.longitude
                ? parseFloat(props.hotel.longitude)
                : null,
            qr_code_url: props.hotel.qr_code_url || "",
            check_in_time: props.hotel.check_in_time || "",
            time_zone: props.hotel.time_zone || "",
        };
    }
};

const saveHotelDetails = async () => {
    if (!props.hotel) return;

    try {
        isSaving.value = true;

        // Only include non-empty fields in the update
        const updateData: any = {};
        Object.keys(hotelFormData.value).forEach((key) => {
            const value =
                hotelFormData.value[key as keyof typeof hotelFormData.value];
            
            // Format time value to ensure it's in HH:MM format
            if (key === 'check_in_time' && value) {
                // Convert Date object or time string to HH:MM format
                if (value instanceof Date) {
                    const hours = value.getHours().toString().padStart(2, '0');
                    const minutes = value.getMinutes().toString().padStart(2, '0');
                    updateData[key] = `${hours}:${minutes}`;
                } else if (typeof value === 'string') {
                    // If it's already a string, ensure it's in HH:MM format
                    // Handle various possible input formats
                    const timeMatch = value.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
                    if (timeMatch) {
                        const hours = parseInt(timeMatch[1]).toString().padStart(2, '0');
                        const minutes = parseInt(timeMatch[2]).toString().padStart(2, '0');
                        updateData[key] = `${hours}:${minutes}`;
                    } else {
                        updateData[key] = value;
                    }
                } else {
                    updateData[key] = value;
                }
            } else if (value !== "" && value !== null) {
                updateData[key] = value;
            }
        });

        await updateHotel({
            id: props.hotel.id,
            data: updateData,
        });

        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Hotel details updated successfully!",
            life: 3000,
        });

        isEditing.value = false;
        emit("hotel-updated");
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.message || "Failed to update hotel details.",
            life: 3000,
        });
    } finally {
        isSaving.value = false;
    }
};
</script>
