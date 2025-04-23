import type { Image } from "./image.model";
import type { FlatPaginatedResponse, PaginatedResponse } from "./shared.models";
import type { Song } from "./song.model";

export interface Playlist {
    id: number;
    name: string;
    description: string;
    is_public: boolean;
    songs: Song[];
    image: Image
}

export interface PaginatedPlaylistSongs {
    id: number;
    name: string;
    songs: FlatPaginatedResponse<Song>;
}