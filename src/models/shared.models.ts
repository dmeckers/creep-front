import type { TypedFormData } from "@/lib/typed-form-data";

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface FlatPaginatedResponse<T> {
    data: T[];
    current_page: number;
    from: number;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface GetPaginatedPayload {
    page?: number;
    page_size?: number;
    sort?: string;
    search?: string;
    filter?: string;
    order?: "asc" | "desc";
}

export type MaybeFormData<T extends Record<string, any>> = TypedFormData<T> | T;

export function calculateShowing<T>(data: PaginatedResponse<T> | null) {
    if (data === null) {
        return null;
    }

    const {
        meta: { per_page, current_page, total },
    } = data;

    const showing =
        per_page * current_page >= total ? total : per_page * current_page;

    return `Showing ${showing} of ${total} songs`;
}