<template>
    <v-app-bar v-if="isMobile" class="elevation-0 py-2" style="background-color: #67921E;">
        <v-app-bar-nav-icon @click="drawer = !drawer" style="color: #fff;" />
        <v-row class="mx-3" style="color: #fff;">
            <v-col class="d-flex flex-column">
                <span>{{ saudacao }},</span>
                <span class="text-headline-small font-weight-semibold">{{ userProfile?.displayName }}</span>
            </v-col>
            <v-col cols="auto">
                <div class="d-flex border align-center rounded-xl" style="background-color: #1E2B094D;">
                    <div class="avatar-wrapper" :style="wrapperStyle" :title="name">
                        <transition name="avatar-fade" mode="out-in">
                            <img v-if="userPhoto && !imgError" :key="'photo'" :src="userPhoto" :alt="name"
                                class="avatar-img" @error="imgError = true" />
                            <div v-else :key="'initials'" class="avatar-initials" :style="initialsStyle">
                                {{ initials }}
                            </div>
                        </transition>

                        <span v-if="status" class="avatar-status" :class="`status--${status}`" />
                    </div>
                    <v-btn class="pa-0 mx-2" min-width="0" width="auto" >
                        <v-icon size="20">mdi-chevron-down</v-icon>
                    </v-btn>
                </div>
            </v-col>
        </v-row>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" :temporary="isMobile" :permanent="!isMobile" width="280" class="pa-2">
        <v-list-item>
            <header class="profile-header" v-if="userProfile">
                <div class="user-info">
                    <div class="avatar">{{ userProfile.displayName?.charAt(0) }}</div>
                    <div>
                        <span>{{ userProfile.displayName }}</span>
                        <p class="email-text">{{ userProfile.mail || userProfile.userPrincipalName }}</p>
                    </div>
                </div>

            </header>
        </v-list-item>
        <v-divider></v-divider>

        <v-list>
            <v-list-item v-for="(site, index) in sites" :key="index" rounded="lg" class="mb-2"
                @click="selectAndNavigate(site)">
                <template #prepend>
                    <v-icon icon="mdi-web" />
                </template>

                <v-list-item-title>
                    {{ site.displayName }}
                </v-list-item-title>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
import { authService } from '../auth/authService';
import axios from '../service/axios.js';
import { useSiteStore } from '../stores/siteStore';

export default {
    name: 'NavigationDrawer',

    data: () => ({
        userProfile: null,
        drawer: false,
        sites: [],
        loadingFolder: false,
        userPhoto: null,
        imgError: false,
    }),
    watch: {
        isMobile(value) {
            // desktop deixa aberto
            if (!value) {
                this.drawer = true
            }
        }
    },

    computed: {
        isMobile() {
            return this.$vuetify.display.smAndDown;
        },

        saudacao() {
            const hora = new Date().getHours();
            if (hora >= 6 && hora < 12) return 'Bom dia';
            if (hora >= 12 && hora < 18) return 'Boa tarde';
            return 'Boa noite';
        },

        wrapperStyle() {
            return { width: '40px', height: '40px', fontSize: '15px' };
        },
        initials() {
            const name = this.userProfile?.displayName || '';
            const parts = name.trim().split(/\s+/);
            if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        },
        initialsStyle() {
            return { background: '#4F7FFA' };
        },
    },
    methods: {
        selectAndNavigate(site) {
            const store = useSiteStore()
            store.selectSite(site)  // já persiste no localStorage
            this.$router.push({ name: 'SiteDetails', params: { siteId: site.id } })
        },

        async listarSites() {
            const token = await authService.acquireSharePointToken();
            const { data } = await axios.get('https://graph.microsoft.com/v1.0/sites?search=*', {
                headers: {
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            const store = useSiteStore();
            store.setSites(data.value);
            this.sites = data.value;
            console.log(data.value)
        },

        async fetchUserProfile() {
            const token = await authService.acquireToken();
            if (!token) return;

            try {
                // Busca os dados do perfil
                const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.userProfile = await response.json();

                // Busca a foto separadamente
                const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (photoResponse.ok) {
                    const blob = await photoResponse.blob();
                    this.userPhoto = URL.createObjectURL(blob);
                }

            } catch (error) {
                console.error('Erro ao buscar perfil:', error);
            }
        },
    },

    async mounted() {
        await authService._ready;
        this.fetchUserProfile();
        this.listarSites();
        this.drawer = !this.isMobile
    },
}
</script>

<style scoped>
.avatar-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: visible;
    flex-shrink: 0;
    user-select: none;
}

/* ── Foto ── */
.avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    display: block;
}

/* ── Fallback de iniciais ── */
.avatar-initials {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 600;
    letter-spacing: 0.03em;
    line-height: 1;
}

/* ── Status badge ── */
.avatar-status {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 28%;
    height: 28%;
    min-width: 8px;
    min-height: 8px;
    max-width: 14px;
    max-height: 14px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-sizing: border-box;
}

.status--online {
    background: #3AAF9F;
}

.status--away {
    background: #F2A65A;
}

.status--busy {
    background: #E05A8A;
}

.status--offline {
    background: #9CA3AF;
}

/* ── Transição foto ↔ iniciais ── */
.avatar-fade-enter-active,
.avatar-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.avatar-fade-enter-from,
.avatar-fade-leave-to {
    opacity: 0;
    transform: scale(0.85);
}

.profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.avatar {
    width: 50px;
    height: 50px;
    background: #2563eb;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
}

h1 {
    font-size: 1.5rem;
    margin: 0;
    font-weight: 700;
}

.email-text {
    color: #64748b;
    margin: 0;
    font-size: 0.9rem;
}
</style>