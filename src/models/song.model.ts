export interface Song {
    id: number;
    name: string;
    artist?: string;
    code: string;
    file_url: string;
    duration: number;
    codec: string;

    // album: string;
    // duration: number;
    // bitrate: number;
    // sample_rate: number;
    // format: string;
    // size: number;
}