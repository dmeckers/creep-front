import { ref } from 'vue';
import Echo from 'laravel-echo';

let echoInstance: any = null;

export function useWs() {
    const isConnected = ref(false);

    const initEcho = () => {
        if (!echoInstance) {
            echoInstance = new Echo({
                broadcaster: 'pusher',
                key: import.meta.env.VITE_PUSHER_KEY,
                cluster: 'eu',
                forceTLS: true
            });

            isConnected.value = true;
        }
        return echoInstance;
    };

    const getEcho = () => {
        return echoInstance || initEcho();
    };

    const channel = (channelName: string) => {
        const echo = getEcho();
        return echo.channel(channelName);
    };

    const listen = (channelName: string, event: string, callback: (data: any) => void) => {
        const echoChannel = channel(channelName);

        echoChannel.listen(`.${event}`, callback);
        echoChannel.listen(`${event}`, callback);
    }

    const unlisten = (channelName: string, event: string) => {
        const echoChannel = channel(channelName);

        echoChannel.stopListening(`.${event}`);
        echoChannel.stopListening(`${event}`);
    }

    const dispose = () => {
        if (echoInstance) {
            echoInstance.disconnect();
            echoInstance = null;
            isConnected.value = false;
        }
    }

    return {
        isConnected,
        initEcho,
        getEcho,
        channel,
        listen,
        unlisten,
        dispose
    };
}