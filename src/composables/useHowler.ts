import _axios from "@/services/axios";
import type { TrackPlayedEventPayload } from "./useStationPlayback";
import { Howl } from "howler";

export function useHowler() {
    const howls: Map<string , Howl> = new Map();

    const _elapsed = async ({ track: { start_at } }: TrackPlayedEventPayload) => {
        const requestSentAt = Date.now();
        const syncResponse = await _axios.get<{ server_time: number }>("api/v1/sync");
        const responseReceivedAt = Date.now();

        const roundTripTime = responseReceivedAt - requestSentAt;
        const approximateLatency = roundTripTime / 2;

        const correctedServerTime = syncResponse.data.server_time * 1000 + approximateLatency;
        const startedAtMs = new Date(start_at).getTime();

        const elapsed = correctedServerTime - startedAtMs;

        return elapsed;
    }

    const playFromStart = (songCode : string) => {
        const streamUrl = `${import.meta.env.VITE_API_URL}/songs/${songCode}/stream`;
        const howl = new Howl({
            src: [streamUrl],
            preload: true,
            html5: true,
            format: ['mp3', 'aac', 'ogg', 'wav'],
        });

        (howl as any)._src = streamUrl;

        howl.play();
        howls.set(songCode, howl);
    }

    const play = async (payload: TrackPlayedEventPayload) => {

        const elapsedTime = await _elapsed(payload);

        if (elapsedTime < 0) {
            console.warn("Трек ещё не начался");
            return;
        }

        const streamUrl = `${import.meta.env.VITE_API_URL}/songs/${payload.track.code}/stream`;

        const howl = new Howl({
            src: [streamUrl],
            preload: true,
            html5: true,
            format: ['mp3', 'aac', 'ogg', 'wav'],
        });

        (howl as any)._src = streamUrl;

        /**
         * @TODO FIX TIMING ISSUE TEMP FIX???
         */
        const didElapsed = elapsedTime > payload.track.duration * 1000;

        if (!didElapsed) {
            howl.seek(elapsedTime / 1000);
        }

        howl.play();
        howls.set(payload.track.code, howl);
    }

    const stop = (songCode? : string | undefined | number) => {
        if(! songCode ) {
            howls.forEach((howl) => {
                howl.stop();
                howl.unload();
            });
    
            howls.clear();
            return;
        }

        const howl = howls.get(String(songCode));
        
        if (howl) {
            howl.stop();
            howl.unload();
            howls.delete(String(songCode));
        } else {
            console.warn(`Howl for song code ${songCode} not found.`);
        }
    }

    return {
        play,
        stop,
        playFromStart,
    }
}