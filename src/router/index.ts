import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import MainPage from '../pages/MainPage.vue';
import SettingsPage from '../pages/SettingsPage.vue';
import RunPage from '../pages/RunPage.vue';
import EndPage from '@/pages/EndPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Main',
    component: MainPage,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: {
      emoji: '🎬',
    },
  },
  {
    path: '/run',
    name: 'Run',
    component: RunPage,
    meta: {
      emoji: '🎲',
    },
  },
  {
    path: '/end',
    name: 'End',
    component: EndPage,
    meta: {
      emoji: '🏆',
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
