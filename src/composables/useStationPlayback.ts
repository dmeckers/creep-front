import _axios from "@/services/axios";

export function useStationPlayback() {
    const audioContext = new AudioContext();

    const syncTimeOffset = async (): Promise<number> => {
        const t0 = Date.now();
        const res = await _axios.get("/api/v1/sync");
        const serverTimeStr = res.data.server_time;
        const t1 = Date.now();

        const serverTime = new Date(serverTimeStr).getTime();
        const clientTime = (t0 + t1) / 2;

        return serverTime - clientTime;
    };

    const fetchAudioBuffer = async (url: string): Promise<AudioBuffer> => {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    };

    const playTrackAt = async (url: string, startAtIso: string) => {
        const offset = await syncTimeOffset();

        const trackStart = new Date(startAtIso).getTime() - offset;

        const buffer = await fetchAudioBuffer(url);

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);

        const now = Date.now();
        const delay = (trackStart - now) / 1000;

        if (delay < 0) {
            console.warn("Уже началось, играем с задержкой");
            source.start(audioContext.currentTime + 0);
        } else {
            source.start(audioContext.currentTime + delay);
        }

        console.log("Track scheduled to play in", delay, "seconds");
    };

    return {
        syncTimeOffset,
        fetchAudioBuffer,
        playTrackAt,
        audioContext
    }
}

export type TrackPlayedEventPayload = {
    track: {
        id: number;
        code: string;
        start_at: string;
        duration: number;
    }
}