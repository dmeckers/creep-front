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

export const enum SUPPORTED_MUSIC_PROVIDERS {
    YOUTUBE = "youtube",
    YOUTU_BE = "youtu.be",
    VKONTATE = "vkontakte",
    // SOUNDCLOUD = "soundcloud",
    // SPOTIFY = "spotify",
    // APPLE_MUSIC = "apple_music",
    // DEEZER = "deezer",
    // BANDCAMP = "bandcamp",
    // TIDAL = "tidal",
    // AMAZON_MUSIC = "amazon_music",
    // PANDORA = "pandora",
    // YOUTUBE_MUSIC = "youtube_music",
}

export const ALL_SUPPORTED_MUSIC_PROVIDERS = [
    SUPPORTED_MUSIC_PROVIDERS.YOUTUBE,
    SUPPORTED_MUSIC_PROVIDERS.VKONTATE,
    SUPPORTED_MUSIC_PROVIDERS.YOUTU_BE,
    // SUPPORTED_MUSIC_PROVIDERS.SOUNDCLOUD,
    // SUPPORTED_MUSIC_PROVIDERS.SPOTIFY,
    // SUPPORTED_MUSIC_PROVIDERS.APPLE_MUSIC,
    // SUPPORTED_MUSIC_PROVIDERS.DEEZER,
    // SUPPORTED_MUSIC_PROVIDERS.BANDCAMP,
    // SUPPORTED_MUSIC_PROVIDERS.TIDAL,
    // SUPPORTED_MUSIC_PROVIDERS.AMAZON_MUSIC,
    // SUPPORTED_MUSIC_PROVIDERS.PANDORA,
    // SUPPORTED_MUSIC_PROVIDERS.YOUTUBE_MUSIC,
]

export const enum SINGLE_OPERATION_EVENTS {
    URL_SONG_DOWNLOAD_SUCCEEDED = "url.song.download.succeeded",
    URL_SONG_DOWNLOAD_FAILED = "url.song.download.failed",
}

export type ApiResponse<T> = {
    data: T;
}