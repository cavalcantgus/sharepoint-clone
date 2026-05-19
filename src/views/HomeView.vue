<!-- <template>
    <div class="dashboard-container">
        <header class="profile-header" v-if="userProfile">
            <div class="user-info">
                <div class="avatar">{{ userProfile.displayName?.charAt(0) }}</div>
                <div>
                    <h1>Bem-vindo, {{ userProfile.displayName }}</h1>
                    <p class="email-text">{{ userProfile.mail || userProfile.userPrincipalName }}</p>
                </div>
            </div>

            <button @click="fetchSharePointFolder" :disabled="loadingFolder" class="btn-fetch">
                <span v-if="loadingFolder" class="loader"></span>
                {{ loadingFolder ? 'Sincronizando...' : 'Acessar Repositório' }}
            </button>
        </header>

        <div v-else class="skeleton-loader">
            <p>Carregando perfil do consultor...</p>
        </div>

        <hr class="divider" />

        <main class="content-section">
            <div v-if="folderData && folderData.length" class="folder-grid">
                <div v-for="item in folderData" :key="item.UniqueId" class="folder-card"
                    @click="item.tipo === 'pasta' ? fetchSubFolders(item.ServerRelativeUrl) : commentFile(item)">
                    <div class="icon-wrapper">
                        <svg v-if="item.tipo === 'pasta'" xmlns="http://www.w3.org/2000/svg" width="48" height="48"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                            stroke-linecap="round" stroke-linejoin="round" class="folder-icon">
                            <path
                                d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z">
                            </path>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" class="file-icon">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    </div>
                    <span class="folder-name">{{ item.Name }}</span>
                    <span class="item-type">{{ item.tipo === 'pasta' ? 'Pasta' : 'Arquivo' }}</span>
                </div>
            </div>

            <div v-else-if="folderData && folderData.length === 0" class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
                    stroke="#ccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p>Nenhum diretório encontrado no SharePoint.</p>
            </div>
        </main>
    </div>
</template> -->


<template>
    <v-layout class="h-screen">

        <v-main class="pa-4">
            <router-view />
        </v-main>

    </v-layout>
</template>

<script>
import { authService } from '../auth/authService';

export default {
    name: 'HomeView',

    data: () => ({
        userProfile: null,
        folderData: null,
        loadingFolder: false,        
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

        async usedByLastDays() {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/insights/trending', {
                headers: { Authorization: `Bearer ${await authService.acquireToken()}` }
            });

            console.log("Modificados recentemente:", await response.json());
        },

        async commentFile(file) {
            try {
                const token = await authService.acquireSharePointToken();
                if (!token) return;

                const listId = 'b2365f70-d3a1-4f9f-94d0-321706bc96b8';
                const itemId = file.ListItemAllFields.Id;

                const response = await fetch(
                    `https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api/web/lists('${listId}')/items(${itemId})/Comments`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json;odata=verbose",
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ text: 'Comentário de teste!' }),
                    }
                );

                const data = await response.json();

                if (data.error) {
                    console.error('Erro da API:', data.error.message?.value);
                } else {
                    console.log('Comentário adicionado:', data);
                    alert('Comentário adicionado com sucesso!');
                }
            } catch (error) {
                console.error('Erro ao comentar:', error);
            }
        },
    },

    mounted() {
        authService._ready;
        this.drawer = !this.isMobile
        this.usedByLastDays();
    },
};
</script>


<style scoped>
/* Variáveis de Cores Corporativas */
:root {
    --primary: #2563eb;
    --bg-body: #f8fafc;
    --text-main: #1e293b;
    --text-muted: #64748b;
    --card-bg: #ffffff;
    --border: #e2e8f0;
}

.dashboard-container {
    font-family: 'Inter', system-ui, sans-serif;
    max-width: 1000px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    color: #1e293b;
}

/* Header */
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

/* Botão Profissional */
.btn-fetch {
    background: #1e293b;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-fetch:hover:not(:disabled) {
    background: #334155;
    transform: translateY(-1px);
}

.btn-fetch:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

/* Divider */
.divider {
    border: 0;
    border-top: 1px solid #e2e8f0;
    margin: 2rem 0;
}

/* Grid de Pastas */
.folder-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.5rem;
}

.folder-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}

.folder-card:hover {
    border-color: #2563eb;
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.1);
    transform: translateY(-4px);
}

.icon-wrapper {
    color: #3b82f6;
    /* Cor das pastas */
    margin-bottom: 1rem;
}

.folder-name {
    font-size: 0.95rem;
    font-weight: 500;
    color: #334155;
    word-break: break-word;
}

.empty-state {
    text-align: center;
    padding: 4rem 0;
    color: #94a3b8;
}

/* Loader Simples */
.loader {
    width: 16px;
    height: 16px;
    border: 2px solid #FFF;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    animation: rotation 1s linear infinite;
}



@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>