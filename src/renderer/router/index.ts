import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { ROUTES } from '../../shared/constants';
import Library from '../views/Library.vue';
import Player from '../views/Player.vue';
import Settings from '../views/Settings.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: ROUTES.HOME,
        redirect: ROUTES.LIBRARY
    },
    {
        path: ROUTES.LIBRARY,
        name: 'Library',
        component: Library
    },
    {
        path: ROUTES.PLAYER,
        name: 'Player',
        component: Player
    },
    {
        path: ROUTES.SETTINGS,
        name: 'Settings',
        component: Settings
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: ROUTES.LIBRARY
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
