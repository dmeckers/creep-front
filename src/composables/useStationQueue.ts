import _axios from "@/services/axios"
import type { ApiResponse } from "@/models/shared.models";

export type QueuedTrack = {
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

export function useStationQueue({ stationName }: { stationName: string }) {

    const current = async (): Promise<QueuedTrack | undefined> => {
        try {
            const { data: { data } } = await _axios.get<ApiResponse<QueuedTrack>>(`api/v1/stations/${stationName}/queue/current`);

            return data;
        } catch (error) {
            return undefined;
        }
    }

    return { current }
}