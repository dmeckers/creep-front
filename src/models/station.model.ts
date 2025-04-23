import type { Playlist } from "./playlist.model";

export interface Station {
    id: number;
    name: string;
    is_live: boolean;
    mount_point: string;
    stream_url: string;
    stream_type: string;
    stream_format: string;
    stream_bitrate: string;
    stream_sample_rate: string;
    owner_id: number;
    is_public: boolean;
    description: string;
    created_at: string;
    updated_at: string;
    playlists?: (Playlist & {
        pivot: {
            playlist_id: number,
            station_id: number,
            is_playing: boolean
        }
    })[];
}