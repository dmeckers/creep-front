import axios from "@/services/axios";
import { ref, type Ref } from "vue";
import { AxiosError, isAxiosError } from "axios";
import { TypedFormData } from "@/lib/typed-form-data";
import type { MaybeFormData } from "@/models/shared.models";

export type ComposableResourceFunc = (url: string) => {
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
    data: Ref<any | null>;
}

export function useGetResource<T, R = any>(url: string, queryParams?: Record<string, any>) {
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const data = ref<T | null>(null);
    const isInitialLoad = ref(true);

    const fetchData = async (newQueryParams?: R) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await axios.get<T>(url, {
                params: newQueryParams ?? queryParams,
            });
            data.value = response.data;
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                error.value = err.message;
            } else {
                error.value = 'An unexpected error occurred';
            }
        } finally {
            isLoading.value = false;
            isInitialLoad.value = false;
        }
    };

    return { isLoading, error, data, fetchData, isInitialLoad };
}
export function usePostResource<T, P extends Record<string, any> = Record<string, any>>(url: string, payload: Record<string, any>): {
    postData: (newPayload?: MaybeFormData<P>) => Promise<void>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
    data: Ref<T | null>;
};

export function usePostResource<T, P extends Record<string, any> = Record<string, any>>(url: string): {
    postData: (newPayload: MaybeFormData<P>) => Promise<void>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
    data: Ref<T | null>;
};

export function usePostResource<T, P extends Record<string, any> = Record<string, any>>(
    url: string,
    payload?: MaybeFormData<P>
) {
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const data = ref<T | null>(null);

    const postData = async (newPayload?: MaybeFormData<P>) => {

        const finalPayload = (newPayload ?? payload) instanceof TypedFormData
            ? (newPayload ?? payload)?.toFormData()
            : newPayload ?? payload;

        if (!finalPayload) {
            throw new Error("Payload must be provided");
        }

        isLoading.value = true;
        error.value = null;

        try {
            const response = await axios.post(url, finalPayload);
            data.value = response.data;
        } catch (err: unknown) {
            error.value = isAxiosError(err)
                ? (err as AxiosError).message
                : "Unexpected error";
        } finally {
            isLoading.value = false;
        }
    };

    return { postData, isLoading, error, data };
}

export function useDeleteResource<T>(url: string) {
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const data = ref<T | null>(null);

    const deleteData = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await axios.delete(url);
            data.value = response.data;
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                error.value = err.message;
            } else {
                error.value = 'An unexpected error occurred';
            }
        } finally {
            isLoading.value = false;
        }
    };

    return { isLoading, error, data, deleteData };
}

export function usePutResource<T>(url: string, payload: Record<string, any>) {
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const data = ref<T | null>(null);

    const putData = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await axios.put(url, payload);
            data.value = response.data;
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                error.value = err.message;
            } else {
                error.value = 'An unexpected error occurred';
            }
        } finally {
            isLoading.value = false;
        }
    };

    return { isLoading, error, data, putData };
}

export function usePatchResource<T, R = Record<string, any>>(url: string) {
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const data = ref<T | null>(null);

    const patchData = async (payload: R) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await axios.patch(url, payload);
            data.value = response.data;
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                error.value = err.message;
            } else {
                error.value = 'An unexpected error occurred';
            }
        } finally {
            isLoading.value = false;
        }
    };

    return { isLoading, error, data, patchData };
}
