export const useAPIHelper = () => {
    /**
     * Extracts the core data from the API response.
     * Fallback to the response itself if 'data' key is missing.
     */
    const getData = <T>(response: any): T => {
        return response?.data ?? response;
    }

    /**
     * Extracts a list of results from the API response.
     * Use this for paginated responses or lists wrapped in 'data'.
     */
    const getResults = <T>(response: any): T[] => {
        // Check for nested structure: { data: { results: [...] } } or { data: [...] } or { results: [...] }
        if (Array.isArray(response?.data)) {
            return response.data;
        }
        return response?.data?.results ?? response?.results ?? [];
    }

    /**
     * Extracts the success message from the API response.
     */
    const getMessage = (response: any): string => {
        return response?.message || "Operation successful";
    }

    /**
     * Standardized error message extraction.
     * Prioritizes the new error format: { success: false, message: "...", errors: {...} }
     */
    const getErrorMessage = (error: any): string => {
        // Handle new formatted errors (often in error.data or error.response._data)
        const errData = error?.data || error?.response?._data;

        if (errData?.message) {
            return errData.message;
        }

        // Fallback for legacy Django/DRF errors
        if (errData?.detail) {
            if (typeof errData.detail === 'string') return errData.detail;
            if (typeof errData.detail === 'object') return JSON.stringify(errData.detail);
        }
        if (errData?.error) {
            return errData.error;
        }

        // Check for "errors" object in new format
        if (errData?.errors) {
            const firstErrorKey = Object.keys(errData.errors)[0];
            if (firstErrorKey) {
                const firstError = errData.errors[firstErrorKey];
                return Array.isArray(firstError) ? firstError[0] : firstError;
            }
        }

        // Fallback for standard error objects or simple strings
        return error?.message || "An unexpected error occurred";
    }

    /**
     * Extracts paginated results from the API response.
     * Returns { count, next, previous, results }.
     */
    const getPaginatedResponse = <T = any>(response: any): { results: T[], count: number, next: string | null, previous: string | null } => {
        const data = getData<{ results: T[], count?: number, next?: string | null, previous?: string | null }>(response);
        if (data && Array.isArray(data.results)) {
            return {
                results: data.results,
                count: data.count || 0,
                next: data.next || null,
                previous: data.previous || null
            };
        }
        return { results: [], count: 0, next: null, previous: null };
    };

    /**
     * Extracts paginated results from the API response.
     * Returns only the 'results' array.
     */
    const getPaginatedResults = <T = any>(response: any): T[] => {
        return getPaginatedResponse<T>(response).results;
    };

    return {
        getData,
        getResults,
        getPaginatedResults,
        getPaginatedResponse,
        getMessage,
        getErrorMessage,
    };
};
