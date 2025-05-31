import { Howl } from 'howler';

export function useHowlerPlayer() {

    const howls: Map<string , Howl> = new Map();

    const play = (songCode : string) => {
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
    }
}
