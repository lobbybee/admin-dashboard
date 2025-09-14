<template>
  <div class="flex h-screen">
    <div class="w-1/4 bg-gray-100 p-4 overflow-y-auto border-r">
      <h2 class="text-lg font-semibold mb-4">Flow Templates</h2>
      <FlowTemplateList />
    </div>

    <div class="w-3/4 p-4 overflow-y-auto">
      <FlowEditor />
    </div>

    <FlowTemplateDialog />
  </div>
</template>

<script setup lang="ts">
import FlowTemplateList from '~/components/FlowTemplateList.vue';
import FlowEditor from '~/components/FlowEditor.vue';
import FlowTemplateDialog from '~/components/FlowTemplateDialog.vue';
</script>

<style scoped>
/* Scoped styles for the flows page */
</style>
