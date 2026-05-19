import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';
import Login from '../component/LoginPage.vue';
import { authService } from '../auth/authService';
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
        path: '/folder/:siteId/:folderPath*',  // folderPath captura tudo depois
        name: 'FolderDetails',
        component: Site
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresAuth) {
        const account = authService.getAccount();
        if (!account) {
            await authService.login();
            const newAccount = authService.getAccount();
            if (newAccount) {
                next();
            } else {
                next('/login');
            }
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;