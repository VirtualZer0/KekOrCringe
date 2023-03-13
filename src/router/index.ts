import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import MainPage from '../pages/MainPage.vue';
import SettingsPage from '../pages/SettingsPage.vue';
import RunPage from '../pages/RunPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Main',
    component: MainPage,
    meta: {
      color: '#E76F51',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: {
      color: '#264653',
    },
  },
  {
    path: '/run',
    name: 'Run',
    component: RunPage,
    meta: {
      color: '#E9C46A',
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
