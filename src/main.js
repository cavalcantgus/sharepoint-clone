import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { Icon } from '@iconify/vue';

import { authService } from './auth/authService'; // ← importa o singleton
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const vuetify = createVuetify({
    components,
    theme: { defaultTheme: 'light' },
    directives,
    icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
});

await authService._ready; // ← aguarda o handleRedirectPromise (já roda no construtor)

const app = createApp(App);

app.use(Toast);
app.config.globalProperties.$msal = authService.msalInstance; // ← mesma instância
app.config.devtools = false;
app.component('Icon', Icon);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount('#app');
