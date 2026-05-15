import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import locales from './locales';

import 'normalize.css';
import 'vue-sonner/style.css';
import 'youtube-video-element';

import '@/assets/style/colors.css';
import '@/assets/style/main.css';
import '@/assets/style/anim.css';
import { useStore } from './store';
import { createPinia } from 'pinia';
import { getInitialLang } from '@/utils/locale';

const i18n = createI18n({
  locale: getInitialLang(),
  fallbackLocale: 'en',
  messages: locales,
  legacy: false,
});

const pinia = createPinia();

const app = createApp(App).use(router).use(i18n).use(pinia);

const store = useStore();
store.load();

app.mount('#app');
