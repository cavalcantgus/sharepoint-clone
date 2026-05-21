<template>
    <v-container class="pa-0 pt-4" style="background-color: #98d72d; height: 100vh;">
        <v-sheet class="secondary-container">
            <div class="pa-5 pt-6">
                <div class="d-flex justify-space-between">
                    <span class="font-weight-bold" style="color: #64748b; font-size: 1.20rem;">Atividades Recentes</span>
                    <span class="" style="color: #64748b; font-size: 1rem;">Ver tudo</span>
                </div>
                <v-row v-for="(item, index) in recentActivities.slice(0, 3)" :key="index"
                    class="border d-flex align-center flex-row row-item mt-3"> <v-col cols="auto"
                        class="d-flex align-center justify-center">
                        <Icon :icon="item.items[item.items.length - 1].isFolder
                            ? 'ant-design:folder-filled'
                            : 'ant-design:file-filled'" :color="item.items[item.items.length - 1].isFolder ? '#98d72d' : '#ccc'"
                            width="30" class="folder-icon" :style="{
                                filter: item.tipo === 'pasta'
                                    ? 'drop-shadow(0 6px 4px #6F9D21)'
                                    : 'drop-shadow(0 6px 4px #888)'
                            }" />
                    </v-col>
                    <v-col>
                        <div class="d-flex flex-column">
                            <span class="font-weight-bold" style="color: #476515;">{{ item.items[item.items.length -
                                1].itemName }}</span>
                            <span style="color: #577B1A;">{{ item.actionType === 'create' ? 'Criado' : 'Editado' }} por:
                                <span>{{ item.who }}</span></span>
                        </div>
                    </v-col>
                    <v-col cols="auto">
                        <v-icon>mdi-chevron-down</v-icon>
                    </v-col>
                </v-row>
            </div>
        </v-sheet>
    </v-container>
</template>

<script>
import { authService } from '../auth/authService';
import { useSiteStore } from '../stores/siteStore';
export default {
    name: 'HomeView',

    data: () => ({
        userProfile: null,
        folderData: null,
        loadingFolder: false,
        quickAccessItems: [],
        deltaLinks: {}, // { [driveId]: "https://graph.microsoft.com/v1.0/..." }
        isSyncing: false,
        recentActivities: [],
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

        async teste() {
            const token = await authService.acquireToken();
            const siteStore = useSiteStore();
            const siteId = "mmmalufconsultoria.sharepoint.com,b64909bd-3f9b-4c8f-8f60-9aa4cf79e086,85441a70-d838-4bbb-b9dc-ebfbbfdd723a";

            const headers = { Authorization: `Bearer ${token}` };

            // percorre recursivamente todos os itens de uma pasta
            async function getAllItems(driveId, folderId = 'root') {
                const res = await fetch(
                    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}/children`,
                    { headers }
                );
                const data = await res.json();
                const items = data.value ?? [];

                // para cada subpasta encontrada, busca os filhos recursivamente
                const children = await Promise.all(
                    items
                        .filter(item => item.folder)
                        .map(folder => getAllItems(driveId, folder.id))
                );

                return [...items, ...children.flat()];
            }

            // 1. lista todos os drives do site
            const resDrives = await fetch(
                `https://graph.microsoft.com/v1.0/sites/${siteId}/drives`,
                { headers }
            );
            const { value: drives } = await resDrives.json();

            // 2. processa cada drive em paralelo
            const results = await Promise.all(
                drives.map(async (drive) => {

                    // --- DELTA ---
                    const savedDeltaLink = siteStore.getDeltaLink(drive.id);
                    const deltaUrl = savedDeltaLink
                        ?? `https://graph.microsoft.com/v1.0/drives/${drive.id}/root/delta`;

                    const resDelta = await fetch(deltaUrl, { headers });
                    const dataDelta = await resDelta.json();

                    if (dataDelta['@odata.deltaLink']) {
                        siteStore.setDeltaLink(drive.id, dataDelta['@odata.deltaLink']);
                    }

                    const deleted = dataDelta.value.filter(item => item.deleted);
                    const changed = dataDelta.value.filter(item => !item.deleted);
                    console.log(`Drive ${drive.name} - Itens alterados:`, changed);
                    console.log(`Drive ${drive.name} - Itens deletados:`, deleted);
                    // --- TODOS OS ITENS (recursivo) ---
                    const allItems = await getAllItems(drive.id);

                    // --- ACTIVITIES por item em paralelo ---
                    const activitiesByItem = await Promise.all(
                        allItems.map(async (item) => {
                            const resAct = await fetch(
                                `https://graph.microsoft.com/v1.0/drives/${drive.id}/items/${item.id}/activities`,
                                { headers }
                            );
                            const dataAct = await resAct.json();
                            const rawActivities = dataAct.value ?? [];

                            return rawActivities.map((activity) => {
                                const action = activity.action;
                                const who = activity.actor?.user?.displayName
                                    ?? activity.actor?.user?.email
                                    ?? 'Desconhecido';

                                let actionType = 'unknown';
                                if (action.create) actionType = 'create';
                                if (action.edit) actionType = 'edit';
                                if (action.delete) actionType = 'delete';
                                if (action.move) actionType = 'move';
                                if (action.rename) actionType = 'rename';
                                if (action.restore) actionType = 'restore';
                                if (action.share) actionType = 'share';

                                return {
                                    who,
                                    actionType,
                                    itemName: item.name,
                                    itemId: item.id,
                                    itemUrl: item.webUrl ?? null,
                                    isFolder: !!item.folder,
                                    // caminho completo ex: /Documentos/2026/contrato.pdf
                                    itemPath: item.parentReference?.path?.replace(/.*root:/, '') ?? '/',
                                    happenedAt: activity.times?.recordedDateTime ?? null,
                                    newVersion: action.version?.newVersion ?? null,
                                    from: action.move?.from ?? action.rename?.oldName ?? null,
                                    to: action.move?.to ?? action.rename?.newName ?? null,
                                };
                            });
                        })
                    );

                    const activities = activitiesByItem.flat();
                    activities.sort((a, b) => new Date(b.happenedAt) - new Date(a.happenedAt));

                    return {
                        drive: drive.name,
                        driveId: drive.id,
                        isFirstSync: !savedDeltaLink,
                        delta: { changed, deleted },
                        activities
                    };
                })
            );

            // junta todas as activities de todos os drives
            const allActivities = results.flatMap(result =>
                result.activities.map(activity => ({
                    ...activity,
                    drive: result.drive,
                    driveId: result.driveId,
                }))
            );

            // agrupa por actionType + happenedAt + who
            const groupedMap = new Map();

            for (const activity of allActivities) {
                const key = [
                    activity.actionType,
                    activity.happenedAt,
                    activity.who
                ].join('|');

                if (!groupedMap.has(key)) {
                    groupedMap.set(key, {
                        actionType: activity.actionType,
                        happenedAt: activity.happenedAt,
                        who: activity.who,

                        // agregados
                        drives: new Set(),
                        items: [],
                        totalItems: 0,
                    });
                }

                const group = groupedMap.get(key);

                group.drives.add(activity.drive);

                group.items.push({
                    itemId: activity.itemId,
                    itemName: activity.itemName,
                    itemPath: activity.itemPath,
                    itemUrl: activity.itemUrl,
                    isFolder: activity.isFolder,
                    from: activity.from,
                    to: activity.to,
                    newVersion: activity.newVersion,
                });

                group.totalItems++;
            }

            // transforma em array final
            const groupedActivities = Array.from(groupedMap.values()).map(group => ({
                ...group,
                drives: Array.from(group.drives),
            }));

            // ordena mais recente primeiro
            groupedActivities.sort(
                (a, b) => new Date(b.happenedAt) - new Date(a.happenedAt)
            );

            console.log(groupedActivities);
            this.recentActivities = groupedActivities;
        },
    },
    mounted() {
        authService._ready;
        this.drawer = !this.isMobile
        this.usedByLastDays();
        this.teste();
        this._syncInterval = setInterval(() => this.syncRecentItems(), 30_000);
    },
    beforeUnmount() {
        clearInterval(this._syncInterval);
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

.row-item {
    border-radius: 12px;
    transition: all 0.2s;
    cursor: pointer;
    background-color: #fff;
    padding: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.secondary-container {
    background-color: #f3f2f2;
    height: 100%;
    border-top-left-radius: 34px;
    border-top-right-radius: 34px;
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