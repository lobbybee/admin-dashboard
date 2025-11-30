<template>
  <div class="flex h-full flex-col bg-white">
    <div class="flex items-center border-b border-gray-200 px-6 pb-4 pt-6 mb-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden">
          <img
            src="/logo.png"
            alt="LobbyBee Logo"
            class="h-full w-full object-contain"
          />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-900">LobbyBee</h1>
          <p class="text-xs text-gray-600">Hotel CRM</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-2 pt-4">
      <div class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
          :class="{ 'bg-blue-50 text-blue-600 font-medium': $route.path === item.href }"
          @click="$emit('navigate')"
        >
          <Icon :name="item.icon" class="h-5 w-5 text-gray-500" />
          <span class="text-sm font-medium">{{ item.name }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
defineProps({
  navigation: {
    type: Array,
    default: () => []
  }
});
</script>
