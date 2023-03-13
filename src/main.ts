import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import locales from './locales';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import 'normalize.css';

import 'primevue/resources/themes/lara-light-teal/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

import '@/assets/style/colors.scss';
import '@/assets/style/main.scss';
import { useStore } from './store';
import { createPinia } from 'pinia';

const i18n = createI18n({
  locale: navigator.language,
  fallbackLocale: 'en',
  messages: locales,
  legacy: false,
});

const pinia = createPinia();

createApp(App)
  .use(router)
  .use(i18n)
  .use(pinia)
  .use(PrimeVue)
  .use(ConfirmationService)
  .use(ToastService)
  .mount('#app');

const store = useStore();
store.load();
