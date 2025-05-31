import _axios from "@/services/axios"
import type { TrackPlayedEventPayload } from "./useSyncPlayer";

export type QueuedTrack = {
    data: {
        id: number;
        start_at: string;
        song: {
            id: number;
            name: string;
            artist: string;
            fileUrl: string;
            code: string;
            duration: number;
        };
    };
};

export function useStationQueue({ stationName }: { stationName: string }) {

    const current = async (): Promise<TrackPlayedEventPayload | undefined> => {
        try {
            const { data: { data } } = await _axios.get<QueuedTrack>(`api/v1/stations/${stationName}/queue/current`);

            return {
                track: {
                    id: data.id,
                    code: data.song.code,
                    start_at: data.start_at,
                    duration: data.song.duration,
                }
            };
        } catch (error) {
            return undefined;
        }
    }

    return { current }
}