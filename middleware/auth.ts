export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  // Pages that don't require authentication
  const publicPages = ['/login'];
  const isPublicPage = publicPages.includes(to.path);
  
  // If accessing a public page or already authenticated, allow
  if (isPublicPage || authStore.isAuthenticated) {
    return;
  }
  
  // Redirect to login page if not authenticated
  return navigateTo('/login');
});