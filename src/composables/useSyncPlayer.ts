import _axios from "@/services/axios";
import { Howl } from "howler";

export type TrackPlayedEventPayload = {
    track: {
        id: number;
        code: string;
        start_at: string;
        duration: number;
    }
}

// Глобальные переменные для синхронизации
let clockDelta: number | null = Number(localStorage.getItem("clockDelta")) || null;
let lastSyncTime = 0;
const SYNC_INTERVAL = 10000; // 10 секунд

export function useSyncPlayer() {
    const howls: Map<string, any> = new Map();
    let audioContext: AudioContext | null = null;

    const initAudioContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    };

    const syncClock = async (force = false): Promise<number> => {
        if (!force && clockDelta !== null && Date.now() - lastSyncTime < SYNC_INTERVAL) {
            return clockDelta;
        }

        const measurements: { delta: number; rtt: number }[] = [];

        for (let i = 0; i < 3; i++) {
            try {
                const t0 = performance.now();
                const res = await _axios.

                get<{ server_time: number }>("api/v1/sync", {
                    headers: { 'Cache-Control': 'no-cache', 'X-Request-Sync': '1' }
                });
                const t3 = performance.now();

                const rtt = t3 - t0;
                const serverTime = res.data.server_time * 1000;
                const clientTime = Date.now() + (rtt / 2);
                const delta = serverTime - clientTime;

                measurements.push({ delta, rtt });
            } catch (e) {
                console.warn("Sync attempt failed", e);
            }
        }

        if (measurements.length === 0) {
            if (clockDelta !== null) return clockDelta;
            throw new Error("All sync attempts failed");
        }

        measurements.sort((a, b) => a.delta - b.delta);
        const newDelta = measurements[Math.floor(measurements.length / 2)].delta;

        clockDelta = newDelta;
        lastSyncTime = Date.now();
        localStorage.setItem("clockDelta", String(clockDelta));

        return clockDelta;
    };

    const getCurrentPosition = async (startAt: string, duration: number) => {
        const delta = await syncClock();
        const startTime = new Date(startAt).getTime();
        const now = Date.now() + delta;
        const elapsed = Math.max(0, now - startTime);

        return {
            position: Math.min(elapsed / 1000, duration),
            isExpired: elapsed >= duration * 1000,
            serverTime: now
        };
    };

    const playWithPrecision = async ({ track }: TrackPlayedEventPayload) => {
        initAudioContext();
        if (!audioContext) throw new Error("AudioContext not available");

        const { code, start_at, duration } = track;
        const { position, isExpired } = await getCurrentPosition(start_at, duration);

        if (isExpired) {
            stop(code);
            return;
        }

        // Останавливаем предыдущие треки
        stop();

        try {
            // Загружаем аудио через ArrayBuffer для точного контроля
            const response = await fetch(`${import.meta.env.VITE_API_URL}/songs/${code}/stream`, {
                credentials: "include"
            });
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Точный расчет времени старта
            const startTime = audioContext.currentTime + 0.05; // 50мс на подготовку
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            // Коррекция дрифта
            const driftCorrection = () => {
                getCurrentPosition(start_at, duration).then(({ position }) => {
                    const currentTime = source.context.currentTime - startTime;
                    if (Math.abs(currentTime - position) > 0.05) {
                        // Создаем новый источник с корректировкой
                        const newSource = audioContext!.createBufferSource();
                        newSource.buffer = audioBuffer;
                        newSource.connect(audioContext!.destination);
                        newSource.start(0, position % duration);
                        source.stop();
                        howls.set(code, createHowlControl(newSource));
                    }
                });
            };

            const correctionInterval = setInterval(driftCorrection, 2000);
            source.onended = () => clearInterval(correctionInterval);

            source.start(startTime, position % duration);
            howls.set(code, createHowlControl(source));
        } catch (error) {
            console.error("Precision playback failed:", error);
            // Fallback к Howler.js
            await playWithHowler({ track });
        }
    };

    const createHowlControl = (source: AudioBufferSourceNode) => ({
        stop: () => source.stop(),
        playing: () => source.context.currentTime < (source.buffer?.duration || 0),
        seek: (pos: number) => {
            const newSource = audioContext!.createBufferSource();
            newSource.buffer = source.buffer;
            newSource.connect(audioContext!.destination);
            newSource.start(0, pos);
            source.stop();
            return pos;
        }
    });

    const playWithHowler = async ({ track }: TrackPlayedEventPayload) => {
        const { code, start_at, duration } = track;
        const { position, isExpired } = await getCurrentPosition(start_at, duration);

        if (isExpired) {
            stop(code);
            return;
        }

        const howl = new Howl({
            src: [`${import.meta.env.VITE_API_URL}/songs/${code}/stream`],
            html5: true,
            format: ["mp3", "aac", "ogg"]
        });

        await new Promise<void>((resolve) => {
            howl.once("load", resolve);
            howl.once("loaderror", () => {
                console.error("Howler load error for track:", code);
                stop(code);
            });
        });

        const soundId = howl.play();
        howl.seek(position, soundId);

        // Периодическая коррекция
        const correctPosition = () => {
            if (!howl.playing()) return;
            getCurrentPosition(start_at, duration).then(({ position }) => {
                const current = howl.seek() as number;
                if (Math.abs(current - position) > 0.1) {
                    howl.seek(position, soundId);
                }
            });
        };

        const interval = setInterval(correctPosition, 2000);
        howl.once("end", () => clearInterval(interval));

        howls.set(code, howl);
    };

    const stop = (code?: string) => {
        if (!code) {
            howls.forEach(h => "stop" in h ? h.stop() : (h.unload?.(), h.stop?.()));
            howls.clear();
        } else {
            const h = howls.get(code);
            if (h) {
                "stop" in h ? h.stop() : (h.unload?.(), h.stop?.());
                howls.delete(code);
            }
        }
    };

    return {
        play: playWithPrecision,
        stop,
        syncNow: async (payload: TrackPlayedEventPayload) => {
            await syncClock(true);
            return getCurrentPosition(payload.track.start_at, payload.track.duration);
        },
        preload: async (_: string) => {
            // Предзагрузка не требуется для Web Audio API
        },
    };
}