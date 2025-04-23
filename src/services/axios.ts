import { RouteNames } from '@/constants/route-names';
import { USER_DATA_LOCAL_STORAGE_KEY } from '@/constants/telegram';
import router from '@/router';
import axios from 'axios'

const XSRF_NAME = 'XSRF-TOKEN';

const _axios = axios.create({
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: XSRF_NAME,
    xsrfHeaderName: 'X-XSRF-TOKEN',
    baseURL: import.meta.env.VITE_API_URL_BASE,
})

_axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            if ([401, 403].some(err => error.response.status === err)) {
                localStorage.removeItem(USER_DATA_LOCAL_STORAGE_KEY);

                router.push({ name: RouteNames.WELCOME });
            } else {
                console.log('An error occurred. Please try again later.', error)
            }
        }
        return Promise.reject(error)
    },
);

export default _axios
