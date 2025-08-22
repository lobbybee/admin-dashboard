export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  // Public pages that don't require authentication
  const publicPages = ['/login'];
  const isPublicPage = publicPages.includes(to.path);
  
  // If accessing a public page, allow
  if (isPublicPage) {
    return;
  }
  
  // If not authenticated, redirect to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }
});