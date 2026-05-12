import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import locales from './locales';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Aura from '@primeuix/themes/aura';

import 'normalize.css';
import 'primeicons/primeicons.css';

import '@/assets/style/colors.css';
import '@/assets/style/main.css';
import { useStore } from './store';
import { createPinia } from 'pinia';

const i18n = createI18n({
  locale: localStorage['lang'] ?? navigator.language,
  fallbackLocale: 'en',
  messages: locales,
  legacy: false,
});

const pinia = createPinia();

const app = createApp(App)
  .use(router)
  .use(i18n)
  .use(pinia)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        prefix: 'p',
        darkModeSelector: '.dark-mode',
        cssLayer: false,
      },
    },
  })
  .use(ConfirmationService)
  .use(ToastService);

const store = useStore();
store.load();

app.mount('#app');
