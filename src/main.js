import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia'; // ✅

import { createVuetify } from 'vuetify';
import 'vuetify/styles';

import '@mdi/font/css/materialdesignicons.css';

import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import { aliases, mdi } from 'vuetify/iconsets/mdi';

import { Icon } from '@iconify/vue';

import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './auth/authConfig';

const vuetify = createVuetify({
    components,
    theme: {
        defaultTheme: 'light',
    },
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: { mdi },
    },
});

const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize();

const app = createApp(App);

app.config.globalProperties.$msal = msalInstance;

app.component('Icon', Icon);

app.use(createPinia()); // ✅
app.use(router);
app.use(vuetify);

app.mount('#app');