import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';
import Login from '../component/LoginPage.vue';
import { authService } from '../auth/authService';
import FileViewer from '../views/FileViewer.vue';
import Site from '../views/Site.vue';

const routes = [
    {
        path: '/home',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/site/:siteId',
        name: 'SiteDetails',
        component: Site
    },
    {
        path: '/folder/:siteId/:folderPath*',
        name: 'FolderDetails',
        component: Site
    },
    {
        path: '/:pathMatch(.*)*', // 👈 captura / e qualquer rota não mapeada
        redirect: '/home'         // redireciona pra /home
    },
    {
        path: '/viewer',
        name: 'FileViewer',
        component: FileViewer,
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory('/sharepoint-clone/'), // 👈 adiciona o base
    routes
});

router.beforeEach(async (to, from, next) => {
    if (!to.meta.requiresAuth) {
        return next();
    }

    await authService._ready;

    const account = authService.getAccount();

    if (!account) {
        return next('/login');
    }

    next();
});

export default router;