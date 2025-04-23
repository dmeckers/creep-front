import _axios from "@/services/axios";
import type { TrackPlayedEventPayload } from "./useStationPlayback";

let audio: HTMLAudioElement | null = null;

export function useHTML5AudioPlayer() {
    const play = async ({ track: { code, start_at } }: TrackPlayedEventPayload) => {
        if (audio) {
            audio.pause();
            audio.src = "";
        }

        const requestSentAt = Date.now();
        const syncResponse = await _axios.get<{ server_time: number }>("api/v1/sync");
        const responseReceivedAt = Date.now();

        const roundTripTime = responseReceivedAt - requestSentAt;
        const approximateLatency = roundTripTime / 2;

        const correctedServerTime = syncResponse.data.server_time * 1000 + approximateLatency;
        const startedAtMs = new Date(start_at).getTime();

        const elapsed = correctedServerTime - startedAtMs;

        if (elapsed < 0) {
            console.warn("Трек ещё не начался");
            return;
        }

        const streamUrl = `${import.meta.env.VITE_API_URL}/songs/${code}/stream`;
        audio = audio ?? new Audio(streamUrl);
        audio.src
        audio.preload = "auto";
        audio.crossOrigin = "anonymous";

        audio.addEventListener("loadedmetadata", () => {
            if (!audio) return;

            const duration = audio.duration * 1000;

            if (isNaN(duration)) {
                console.warn("Длительность трека не определена");
                return;
            }

            if (elapsed >= duration) {
                console.warn("Трек уже закончился");
                audio = null;
                return;
            }
            console.log("Трек загружен, длительность:", duration , 'elapsed:', elapsed);
            audio.currentTime = elapsed / 1000;

            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.error("Ошибка воспроизведения:", err);
                });
            }
        });

        audio.addEventListener("ended", () => {
            console.log("Трек завершён");
            audio = null;
        });

        audio.addEventListener("error", (e) => {
            console.error("Ошибка загрузки аудио:", e);
            audio = null;
        });
    };

    const stop = () => {
        if (audio) {
            audio.pause();
            audio.src = "";
            audio = null;
        }
    };

    return {
        play,
        stop,
        isPlaying: () => audio !== null && !audio.paused,
        getCurrentTime: () => audio?.currentTime ?? 0,
        getDuration: () => audio?.duration ?? 0,
        getElement: () => audio
    };
}
