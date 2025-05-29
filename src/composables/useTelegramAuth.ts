import { onMounted, ref } from 'vue';
import axios from '@/services/axios';
import { useUserStore } from '@/stores/userStore';
import { GET_SANCTUM_TOKEN_URL, INIT_DATA_SESSION_STORAGE_KEY, USER_DATA_LOCAL_STORAGE_KEY } from '@/constants/telegram';
import router from '@/router';

export function useTelegramAuth() {

    const AUTH_TELEGRAM_URL = 'auth/login';

    const isLoadingUser = ref(false);

    const error = ref<string | null>(null);

    const userStore = useUserStore();

    const fetchUser = async () => {
        const tgData = localStorage.getItem(INIT_DATA_SESSION_STORAGE_KEY);

        const url = `/api/v1/${AUTH_TELEGRAM_URL}?${(window as any).Telegram?.WebApp?.initData || tgData}`;

        try {

            await axios.get(import.meta.env.VITE_API_URL_BASE + GET_SANCTUM_TOKEN_URL);

            const response = await axios.post(url);

            const data = response.data;

            const userData = {
                id: data.user.telegram_id,
                name: data.user.name,
                username: data.user.telegram_username,
                photo_url: data.user.photo_url,
                last_name: data.user.last_name,
                language_code: data.user.language_code,
                is_bot: data.user.is_bot,
                is_premium: data.user.is_premium,
            }

            localStorage.setItem(USER_DATA_LOCAL_STORAGE_KEY, JSON.stringify(userData));

            userStore.$patch(userData);

        } catch (er: unknown) {
            console.error('Error fetching user:', error.value);
        } finally {
            isLoadingUser.value = false;
        }
    };

    onMounted(() => {
        isLoadingUser.value = true;

        fetchUser().then(() => {
            if (!error.value) {
                router.push({ name: 'Home' });
            }
        });
    })

    return { isLoadingUser, error };
}