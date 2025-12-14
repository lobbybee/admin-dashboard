<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <div class="flex h-screen overflow-hidden">
      <!-- Mobile Drawer -->
      <Drawer v-model:visible="sidebarVisible" position="left" :pt="{ content: { class: 'p-0' } }" class="w-72 md:hidden">
        <MainSideBar
          :user-role="userRole"
          :navigation="navigation"
          @navigate="sidebarVisible = false"
        />
      </Drawer>

      <!-- Desktop Sidebar -->
      <aside class="hidden w-72 flex-shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
        <MainSideBar :user-role="userRole" :navigation="navigation" />
      </aside>

      <!-- Main Content -->
      <div class="flex flex-1 flex-col overflow-hidden">
        <!-- Main Header -->
        <header class="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 shadow-sm">
          <div class="flex items-center gap-3">
            <Button
              @click="sidebarVisible = true"
              rounded
              text
              class="md:hidden"
              aria-label="Toggle sidebar"
            >
              <template #icon>
                <Icon name="prime:bars" class="h-5 w-5 text-gray-500" />
              </template>
            </Button>
            <div>
              <h1 class="text-xl font-semibold text-gray-900">{{ pageTitle }}</h1>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-4">

            <Button text rounded aria-label="Notifications" class="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <template #icon>
                <Icon name="prime:bell" class="h-5 w-5" />
              </template>
              <Badge v-if="totalUnreadMessages > 0" :value="totalUnreadMessages" severity="danger" />
            </Button>

            <div class="relative">
              <Button @click="toggleUserMenu" text class="flex items-center gap-2 rounded-full p-1 text-left hover:bg-gray-100">
                <Avatar :label="userInitials" shape="circle" class="bg-gradient-to-br from-orange-400 to-blue-400 text-white" />
                <div class="hidden xl:block">
                  <p class="truncate text-sm font-medium text-gray-900">
                    {{ user?.first_name }} {{ user?.last_name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Admin
                  </p>
                </div>
                <Icon name="prime:chevron-down" class="hidden h-4 w-4 text-gray-500 xl:block" />
              </Button>
              <Menu ref="userMenu" :model="userMenuItems" :popup="true" class="mt-2 w-60">
                <template #item="{ item, props }">
                  <div v-if="item.separator" class="my-1 border-t border-gray-200" />
                  <NuxtLink v-else-if="item.route" :to="item.route" class="flex cursor-pointer items-center rounded-md p-2 hover:bg-gray-50 text-gray-700" v-bind="props.action">
                    <Icon :name="item.icon" class="mr-2 h-5 w-5 text-gray-500" />
                    <span class="text-sm">{{ item.label }}</span>
                  </NuxtLink>
                  <a v-else @click="item.command" class="flex cursor-pointer items-center rounded-md p-2 hover:bg-gray-50 text-gray-700" v-bind="props.action">
                    <Icon :name="item.icon" class="mr-2 h-5 w-5 text-gray-500" />
                    <span class="text-sm">{{ item.label }}</span>
                  </a>
                </template>
              </Menu>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useAPI } from '~/composables/useAPI';
import { useAuthStore } from '~/stores/auth';

const router = useRouter();
const route = useRoute();
const { logout } = useAPI();
const authStore = useAuthStore();
const { user, isAuthenticated, userRole, userInitials } = storeToRefs(authStore);

const userMenu = ref(null);

const hotel = ref({ name: 'Loading...' });
const totalUnreadMessages = ref(0); // Mocked for now
const sidebarVisible = ref(false);

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'prime:home' },
  { name: 'Hotel Onboarding', href: '/hotel-onboarding', icon: 'prime:building' },
  { name: 'Staff Management', href: '/staff', icon: 'prime:users' },
  { name: 'Message Templates', href: '/templates', icon: 'prime:comments' },
  { name: 'Payments', href: '/payments', icon: 'prime:credit-card' },
  {name:'Reports', href:'/reports', icon:'prime:chart-bar'}
];

// Fetch hotel data will be triggered automatically by useQuery
// when user.value.hotel_id becomes available.
// const { HotelData, HotelIsLoading, HotelError } = useFetchHotel(computed(() => user.value?.hotel_id));
const HotelData = ref(null);

watch(HotelData, (newHotel) => {
  if (newHotel) {
    hotel.value = newHotel;
  }
});

// Redirect to login if not authenticated
watch(isAuthenticated, (isAuth) => {
  if (process.client && !isAuth) {
    navigateTo('/login');
  }
}, { immediate: true });

const userMenuItems = ref([
  {
    separator: true
  },
  {
    label: 'Sign out',
    icon: 'prime:sign-out',
    command: () => handleLogout()
  }
]);

const toggleUserMenu = (event) => {
  userMenu.value.toggle(event);
};

const handleLogout = async () => {
  try {
    await logout();
    await router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const pageTitle = computed(() => {
  const titleMap = {
    '/': 'Dashboard',
    '/hotel-onboarding': 'Hotel Onboarding',
    '/staff': 'Staff Management',
    '/templates': 'Message Templates'
  };
  return titleMap[route.path] || 'Dashboard';
});

</script>
