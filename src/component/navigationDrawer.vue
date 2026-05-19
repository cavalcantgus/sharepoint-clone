<template>
    <v-app-bar v-if="isMobile">
        <v-app-bar-nav-icon @click="drawer = !drawer" />
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
        mockSites: [
            {
                "createdDateTime": "2026-05-04T19:06:23Z",
                "description": "Geracao Bancaria Maluf",
                "id": "mmmalufconsultoria.sharepoint.com,b64909bd-3f9b-4c8f-8f60-9aa4cf79e086,85441a70-d838-4bbb-b9dc-ebfbbfdd723a",
                "lastModifiedDateTime": "2026-05-04T19:09:18Z",
                "name": "ServidorGeraoBancria",
                "webUrl": "https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria",
                "displayName": "Geracao Bancaria Maluf",
                "root": {},
                "siteCollection": {
                    "hostname": "mmmalufconsultoria.sharepoint.com"
                }
            },
            {
                "createdDateTime": "2026-05-01T17:54:16Z",
                "id": "mmmalufconsultoria.sharepoint.com,b1b83087-b01d-4ea3-9254-026f5060e6b2,2306e5a2-4d54-4bd9-a721-c00469f059d7",
                "lastModifiedDateTime": "2026-05-04T18:44:59Z",
                "name": "GeracaoBancaria",
                "webUrl": "https://mmmalufconsultoria.sharepoint.com/sites/GeracaoBancaria",
                "displayName": "Geracao Bancaria",
                "root": {},
                "siteCollection": {
                    "hostname": "mmmalufconsultoria.sharepoint.com"
                }
            },
            {
                "createdDateTime": "2024-12-14T15:22:34Z",
                "id": "mmmalufconsultoria.sharepoint.com,f27c92f5-7d98-4c7b-82b5-9e6deb19bf58,c4e7d62c-a183-478c-9478-6e09beb9db05",
                "lastModifiedDateTime": "2024-11-24T03:01:33Z",
                "name": "MMMalufConsultoria",
                "webUrl": "https://mmmalufconsultoria.sharepoint.com/sites/MMMalufConsultoria",
                "displayName": "M M Maluf Consultoria",
                "root": {},
                "siteCollection": {
                    "hostname": "mmmalufconsultoria.sharepoint.com"
                }
            },
            {
                "createdDateTime": "2024-12-14T15:22:10Z",
                "id": "mmmalufconsultoria.sharepoint.com,ce5a8179-514a-42b2-bddf-5747ab720edc,577ff5b2-8309-4bcc-8d60-6f0c3d2e7940",
                "lastModifiedDateTime": "2024-11-24T03:04:44Z",
                "name": "mmmalufconsultoria.sharepoint.com",
                "webUrl": "https://mmmalufconsultoria.sharepoint.com",
                "displayName": "Communication site",
                "root": {},
                "siteCollection": {
                    "hostname": "mmmalufconsultoria.sharepoint.com"
                }
            },
            {
                "createdDateTime": "2024-12-14T15:25:14Z",
                "id": "mmmalufconsultoria.sharepoint.com,98735342-1b72-4867-879c-dd74d5796b4c,367df6ab-6022-4375-9464-29eb9cb40c24",
                "lastModifiedDateTime": "2024-11-24T03:04:16Z",
                "name": "contentTypeHub",
                "webUrl": "https://mmmalufconsultoria.sharepoint.com/sites/contentTypeHub",
                "displayName": "Team Site",
                "root": {},
                "siteCollection": {
                    "hostname": "mmmalufconsultoria.sharepoint.com"
                }
            },
            {
                "createdDateTime": "2026-01-29T17:01:20Z",
                "id": "mmmalufconsultoria.sharepoint.com,a0927643-f2e8-47d6-a8f1-be1776055b03,384e8018-1393-4188-bd0d-73204b2af6a8",
                "lastModifiedDateTime": "2026-01-11T03:02:26Z",
                "name": "appcatalog",
                "webUrl": "https://mmmalufconsultoria.sharepoint.com/sites/appcatalog",
                "displayName": "Aplicativos",
                "root": {},
                "siteCollection": {
                    "hostname": "mmmalufconsultoria.sharepoint.com"
                }
            },
            {
                "createdDateTime": "2025-06-20T04:45:08Z",
                "description": "Group that stores content and metadata for Answers in Viva Engage in network 151196868608. Deleting this this group will disrupt Answers in Viva Engage.",
                "id": "mmmalufconsultoria.sharepoint.com,1a3c6cdb-4ac4-4bf2-a57f-b1357621a312,e71d55c2-6d4f-43fc-ab13-3af0595755e3",
                "lastModifiedDateTime": "2025-06-04T02:03:30Z",
                "name": "groupforanswersinvivaengagedonotdelete151196868608364",
                "webUrl": "https://mmmalufconsultoria.sharepoint.com/sites/groupforanswersinvivaengagedonotdelete151196868608364",
                "displayName": "Group for Answers in Viva Engage – DO NOT DELETE 151196868608",
                "root": {},
                "siteCollection": {
                    "hostname": "mmmalufconsultoria.sharepoint.com"
                }
            },
            {
                "createdDateTime": "2024-12-14T15:24:36Z",
                "description": "This is the default group for everyone in the network",
                "id": "mmmalufconsultoria.sharepoint.com,2e98c49a-f285-4385-99c1-8a4f6985d8e0,c4e7d62c-a183-478c-9478-6e09beb9db05",
                "lastModifiedDateTime": "2024-11-24T03:01:33Z",
                "name": "allcompany",
                "webUrl": "https://mmmalufconsultoria.sharepoint.com/sites/allcompany",
                "displayName": "All Company",
                "root": {},
                "siteCollection": {
                    "hostname": "mmmalufconsultoria.sharepoint.com"
                }
            }
        ]
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
    },
    methods: {
        selectAndNavigate(site) {
            const store = useSiteStore()
            store.selectSite(site)  // já persiste no localStorage
            this.$router.push({ name: 'SiteDetails', params: { siteId: site.id } })
        },

        async listarSites() {
            const token = await authService.acquireToken();
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
                const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.userProfile = await response.json();
            } catch (error) {
                console.error('Erro ao buscar perfil:', error);
            }
        },
    },

    mounted() {
        authService._ready;
        this.fetchUserProfile();
        this.listarSites();
        this.drawer = !this.isMobile
    },
}
</script>

<style scoped>
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