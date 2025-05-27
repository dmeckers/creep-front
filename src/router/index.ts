import { RouteNames } from '@/constants/route-names';
import { USER_DATA_LOCAL_STORAGE_KEY } from '@/constants/telegram';
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: 'welcome'
    },
    {
        path: '/welcome',
        name: RouteNames.WELCOME,
        component: () => import('@/components/pages/WelcomeNigga.vue'),
        meta: {
            requiresGuest: true
        }
    },
    {
        path: '/home',
        name: RouteNames.HOME,
        component: () => import('@/components/pages/Home.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/my-station',
        name: RouteNames.USER_STATION,
        component: () => import('@/components/pages/UserStation.vue'),
    },
    {
        path: '/new-station',
        name: RouteNames.CREATE_OWN_STATION,
        component: () => import('@/components/pages/station-create/StationCreate.vue'),
    },
    {
        path: '/stations/:id',
        name: RouteNames.EDIT_STATION,
        component: () => import('@/components/pages/EditStation.vue'),
    },
    {
        path: '/stations/:id/playlists',
        name: RouteNames.STATION_PLAYLISTS,
        component: () => import('@/components/pages/station-playlist/StationPlaylists.vue'),
    },
    {
        path: '/stations/:stationName/stream',
        name: RouteNames.STATION_STREAM,
        component: () => import('@/components/pages/station-stream/StationStream.vue'),
    },
    {
        path: '/playlists/:playlistId/songs',
        name: RouteNames.EDIT_PLAYLIST_SONGS,
        component: () => import('@/components/pages/edit-playlist-songs/EditPlaylistSongs.vue'),
    },
    {
        path: '/playlists/:playlistId',
        name: RouteNames.EDIT_PLAYLIST,
        component: () => import('@/components/pages/EditPlaylist.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, _from, next) => {
    const userData = localStorage.getItem(USER_DATA_LOCAL_STORAGE_KEY);

    const isAuthenticated = !!userData;

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'Welcome', query: { redirect: to.fullPath } })
    }

    else if (to.meta.requiresGuest && isAuthenticated) {
        next({ name: 'Home' })
    }

    else {
        next()
    }
});

export default router