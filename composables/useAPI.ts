import { ofetch } from 'ofetch';
import { useAuthStore } from '~/stores/auth';
import { useAPIHelper } from './useAPIHelper';
import type { User } from '~/types/user';

export interface LoginRequest {
  username?: string;
  email?: string;
  password?: string;
}

// Custom error classes
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class APIError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

export class ForbiddenUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenUserError";
  }
}



export const useAPI = () => {
  const config = useRuntimeConfig();
  const apiURL = config.public.apiUrl || 'http://localhost:8000/api';
  const authStore = useAuthStore();
  const { getErrorMessage, getData, getMessage } = useAPIHelper();

  const authToken = useCookie<string | null>('auth_token');
  const refreshToken = useCookie<string | null>('auth_refresh_token');

  const refreshState = useState('auth-refresh', () => ({
    isRefreshing: false,
    refreshPromise: null as Promise<{ access: string; refresh: string } | null> | null,
  }));

  const clearAuthData = () => {
    authToken.value = null;
    refreshToken.value = null;
    authStore.setUser(null);
  }

  const refreshTokens = async (): Promise<{ access: string; refresh: string } | null> => {
    if (refreshState.value.isRefreshing && refreshState.value.refreshPromise) {
      return refreshState.value.refreshPromise;
    }

    if (!refreshToken.value) {
      throw new AuthenticationError("No refresh token available");
    }

    refreshState.value.isRefreshing = true;
    refreshState.value.refreshPromise = ofetch('/login/refresh/', {
      baseURL: apiURL,
      method: 'POST',
      body: { refresh: refreshToken.value },
    })
      .then((response) => {
        const data = getData<{ access: string; refresh?: string }>(response);
        authToken.value = data.access;
        // Refresh token might not be rotated always, but if it is:
        if (data.refresh) {
          refreshToken.value = data.refresh;
        }
        return { access: data.access, refresh: data.refresh || refreshToken.value! };
      })
      .catch((error) => {
        clearAuthData();
        throw new AuthenticationError(error.message || "Token refresh failed");
      })
      .finally(() => {
        refreshState.value.isRefreshing = false;
        refreshState.value.refreshPromise = null;
      });

    return refreshState.value.refreshPromise;
  };

  const API = ofetch.create({
    baseURL: apiURL,
    onRequest({ options }) {
      if (authToken.value) {
        options.headers = {
          ...(options.headers as any),
          Authorization: `Bearer ${authToken.value}`,
        };
      }
    },
    async onResponseError({ request, options, response, error }) {
      // Skip 401 handling for login and refresh endpoints to allow actual error to propagate
      const isLoginRequest = typeof request === 'string'
        ? (request.includes('/login/') || request.includes('/login'))
        : (request.url.includes('/login/') || request.url.includes('/login'));

      if (response?.status === 401 && !isLoginRequest) {
        return refreshTokens()
          .then(() => {
            const newOptions = { ...options };
            if (authToken.value) {
              // Ensure headers are mutable and set Authorization
              newOptions.headers = new Headers(newOptions.headers as HeadersInit);
              newOptions.headers.set('Authorization', `Bearer ${authToken.value}`);
            }
            // ofetch expects a URL string or Request object, not the internal Request type from onResponseError
            const url = typeof request === 'string' ? request : request.url;
            return ofetch(url, newOptions);
          })
          .catch((error: any) => {
            clearAuthData();
            if (process.client) {
              navigateTo('/login');
            }
            throw new AuthenticationError("Authentication failed, please log in again");
          });
      }

      const errorMessage = getErrorMessage({ data: response?._data, message: error?.message, response });

      throw new APIError(
        errorMessage,
        response?.status || 0,
        response?._data || null
      );
    }
  });

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await API('/login/', {
        method: 'POST',
        body: credentials,
      });

      const data = getData<{ access: string; refresh: string; user: User }>(response);


      // Check if user type is allowed before setting any tokens
      // Whitelist allowed roles for better security
      const allowedRoles = ['platform_admin', 'platform_staff'];
      const userRole = data.user?.user_type;

      if (!allowedRoles.includes(userRole)) {
        // Don't set tokens, throw error immediately
        throw new ForbiddenUserError("Access denied: Your user type is not allowed to access this application");
      }

      // Only set tokens and user if role is allowed
      authToken.value = data.access;
      refreshToken.value = data.refresh;
      authStore.setUser(data.user);

      // Return the full response in case the component wants to show the success message
      return response;
    } catch (err) {
      clearAuthData();
      if (err instanceof ForbiddenUserError) {
        throw err;
      }
      if (err instanceof APIError) {
        throw err;
      }
      throw new AuthenticationError((err as Error).message || "Login failed");
    }
  };

  const logout = async () => {
    if (refreshToken.value) {
      try {
        await API('/logout/', {
          method: 'POST',
          body: { refresh: refreshToken.value },
        });
      } catch (err: unknown) {
        console.error("Failed to logout from backend. Clearing local tokens anyway.", err);
      }
    }
    clearAuthData();
    refreshState.value = {
      isRefreshing: false,
      refreshPromise: null,
    };
  };

  const requestPasswordReset = async (credentials: { email: string }) => {
    try {
      const response = await API('/password-reset/request/', {
        method: 'POST',
        body: credentials,
      });
      return response;
    }
    catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      // Use standard error message extraction
      throw new Error(getErrorMessage(err));
    }
  };

  const confirmPasswordReset = async (credentials: { email: string; otp: string; new_password: string }) => {
    try {
      const response = await API('/password-reset/confirm/', {
        method: 'POST',
        body: credentials,
      });
      return response;
    }
    catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new Error(getErrorMessage(err));
    }
  };

  return {
    login,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    API,
    refreshTokens,
  };
};
