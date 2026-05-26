<template>
    <v-container style="background-color: #67921E; height: 100vh;">
        <v-sheet style="background-color: #67921E;">
            <v-row v-if="!isMobile">
                <v-col cols="12">
                    <span class="text-headline-medium" style="color: #fff; font-weight: bold;">{{ site?.displayName
                        }}</span>
                </v-col>
            </v-row>
            <v-row v-if="!isMobile" class="d-flex align-center">
                <v-col cols="12" lg="12">
                    <v-text-field hide-details prepend-inner-icon="mdi-magnify" variant="outlined" density="compact"
                        placeholder="Buscar pastas ou arquivos"></v-text-field>
                </v-col>
            </v-row>
            <v-row class="pt-3" no-gutters v-if="!isMobile">
                <v-col cols="4" lg="2">
                    <v-select class="type-select" label="Tipo" variant="outlined" density="compact" />
                </v-col>
                <v-col cols="5" lg="3">
                    <v-select class="locality-select" label="Localização" variant="outlined" density="compact" />
                </v-col>
                <v-col cols="4" lg="2">
                    <v-select class="owner-select" label="Proprietário" variant="outlined" density="compact" />
                </v-col>
            </v-row>

            <v-row v-if="isMobile" class="d-flex flex-row justify-space-between mt-2">
                <v-col cols="auto" class="">
                    <span class="text-headline-medium"
                        style="color: #fff; font-weight: bold; line-height: 1; font-size: 2.5rem;"> Pastas</span>
                </v-col>
                <v-col cols="auto" class="">
                    <v-btn icon class="bg-transparent elevation-0 d-flex align-start" style="color: #fff;">
                        <v-icon size="25">mdi-magnify</v-icon>
                    </v-btn>
                </v-col>
            </v-row>

            <v-row v-if="!isMobile">
                <v-col cols="12" class="d-flex justify-end ga-2">
                    <v-btn class="elevation-0">
                        <v-icon size="20">mdi-land-rows-horizontal</v-icon>
                    </v-btn>
                    <v-divider vertical></v-divider>
                    <v-btn class="elevation-0">
                        <v-icon size="20">mdi-view-grid-outline</v-icon>
                    </v-btn>
                </v-col>
            </v-row>

            <v-row class="mt-4" v-if="!isMobile">
                <v-col cols="12">
                    <div v-if="loadingFolder" class="d-flex justify-center align-center py-8">
                        <v-progress-circular indeterminate color="#87d209" size="48" />
                    </div>

                    <v-alert v-else-if="!folderData || folderData.length === 0" variant="tonal" color="grey"
                        class="text-center" icon="mdi-folder-open-outline">
                        Nenhum arquivo ou pasta encontrado neste diretório.
                    </v-alert>

                    <v-table v-else class="explorer-table">
                        <thead>
                            <tr class="text-title-medium">
                                <th class="text-left font-weight-bold text-grey-lighten-1">Nome</th>
                                <th class="text-left font-weight-bold text-grey-lighten-1 d-none d-sm-table-cell">
                                    Modificado em</th>
                                <th class="text-right font-weight-bold text-grey-lighten-1">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in folderData" :key="item.UniqueId" class="text-title-medium  explorer-row">
                                <td class="font-weight-medium clicable-item"
                                    @click="fetchSubFolders(item.ServerRelativeUrl)">
                                    <div class="d-flex align-center ga-3">
                                        <Icon :color="item.tipo === 'pasta' ? '#87d209' : 'blue-lighten-2'" width="30"
                                            :icon="item.tipo === 'pasta' ? 'glyphs-poly:folder-1' : 'mdi-file-document-outline'">
                                        </Icon>
                                        <span class="text-truncate" style="max-width: 250px || 100%;">
                                            {{ item.Name }}
                                        </span>
                                    </div>
                                </td>

                                <td class="text-grey-lighten-1 text-body-2 d-none d-sm-table-cell">
                                    {{ new Date(item.TimeLastModified).toLocaleDateString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) }}
                                </td>

                                <td class="text-right">
                                    <v-menu>
                                        <template #activator="{ props }">
                                            <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text"
                                                density="comfortable" color="grey-lighten-1" />
                                        </template>

                                        <v-list-item variant="elevated"
                                            v-for="opcao in item.tipo === 'pasta' ? opcoesPasta : opcoesArquivo"
                                            :key="opcao.label" @click="opcao.acao(item)">
                                            <v-list-item-title class="d-flex ga-3">
                                                <v-icon>{{ opcao.icon }}</v-icon>
                                                <span>{{ opcao.label }}</span>
                                            </v-list-item-title>
                                        </v-list-item>
                                    </v-menu>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-col>
            </v-row>

            <!-- Grid de Pastas e Arquivos -->
            <v-sheet v-if="isMobile" class="container-folders-mobile">
                <v-row class="d-flex justify-space-between">
                    <v-col cols="auto">
                        <v-btn class="bg-transparent elevation-0" style="color: #476515;">
                            <v-icon size="25">mdi-filter-variant</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn class="bg-transparent elevation-0" style="color: #476515;">
                            <v-icon size="25">mdi-view-grid-outline</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row class="mt-6" v-if="!loadingFolder && folderData.length > 0 && isMobile">
                    <v-col v-for="(item, index) in folderData" :key="index" cols="12" sm="4" md="3" lg="2">

                        <!-- Bottom Sheet — aberto pelo toque longo via openMenuIndex -->
                        <v-bottom-sheet :model-value="openMenuIndex === index"
                            @update:model-value="val => { if (!val) openMenuIndex = null }">

                            <template #activator="{ props: sheetProps }">

                                <v-card v-bind="sheetProps"
                                    class=" bg-transparent elevation-0 d-flex flex-row align-center justify-start text-center cursor-pointer item-card fill-height"
                                    @click.stop="handleClick(item)" @touchstart="startLongPress(item, index)"
                                    @touchend="cancelLongPress" @touchmove="cancelLongPress">

                                    <Icon
                                        :icon="item.tipo === 'pasta' ? 'ant-design:folder-filled' : 'ant-design:file-filled'"
                                        width="56" :color="item.tipo === 'pasta' ? '#98d72d' : '#ccc'"
                                        class="mb-3 folder-icon" :style="{
                                            filter: item.tipo === 'pasta'
                                                ? 'drop-shadow(0 6px 4px #6F9D21)'
                                                : 'drop-shadow(0 6px 4px #888)'
                                        }">
                                    </Icon>
                                    <!-- Botão de menu com v-menu próprio -->
                                    <!-- <v-card-title class="d-flex justify-end pa-0 border">
                                    <v-menu>
                                        <template #activator="{ props: menuProps }">
                                            <v-btn class="elevation-0" v-bind="menuProps" @click.stop>
                                                <v-icon size="25">mdi-dots-vertical</v-icon>
                                            </v-btn>
                                        </template>
                <v-list>
                    <v-list-item v-for="opcao in item.tipo === 'pasta' ? opcoesPasta : opcoesArquivo" :key="opcao.label"
                        @click="opcao.acao(item)">
                        <v-list-item-title class="d-flex ga-3">
                            <v-icon>{{ opcao.icon }}</v-icon>
                            <span>{{ opcao.label }}</span>
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
                </v-menu>
                </v-card-title> -->

                                    <div
                                        class=" d-flex flex-column align-center justify-center text-start fill-height mx-2">
                                        <div class="text-body-1 font-weight-medium text-truncate w-100">
                                            <span style="color: #476515; font-weight: 600; font-size: 1.2rem;">{{
                                                item.Name }}</span>
                                        </div>

                                        <div class="text-caption text-grey text-truncate w-100">
                                            <!-- Pasta -->
                                            <template v-if="item.tipo === 'pasta'">
                                                <span style="color: #577B1A; font-size: 1rem;">
                                                    {{ item.ItemCount > 1 ? `${item.ItemCount} itens` : '1 item' }}
                                                </span>
                                                <span style="color: #577B1A; font-size: 1rem;" class="mx-2">|</span>
                                                <span style="color: #577B1A; font-size: 1rem;">
                                                    <template v-if="item.TotalSize === null"> calculando...</template>
                                                    <template v-else-if="item.TotalSize === -1"> —</template>
                                                    <template v-else> {{ formatBytes(item.TotalSize) }}</template>
                                                </span>
                                            </template>

                                            <!-- Arquivo -->
                                            <template v-else>
                                                <span style="color: #577B1A; font-size: 1rem;">
                                                    {{ formatBytes(parseInt(item.Length)) }}
                                                </span>
                                            </template>
                                        </div>
                                    </div>
                                </v-card>
                            </template>

                            <!-- Conteúdo do Bottom Sheet (toque longo) -->
                            <v-list>
                                <v-list-item v-for="opcao in item.tipo === 'pasta' ? opcoesPasta : opcoesArquivo"
                                    :key="opcao.label" @click="opcao.acao(item)">
                                    <v-list-item-title class="d-flex ga-3">
                                        <v-icon>{{ opcao.icon }}</v-icon>
                                        <span>{{ opcao.label }}</span>
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-bottom-sheet>

                    </v-col>
                </v-row>

                <v-row class="mt-6" v-else-if="loadingFolder && isMobile">
                    <v-col v-for="n in 6" :key="n" cols="6" sm="4" md="3" lg="2">
                        <v-skeleton-loader type="card" class="border" height="130"></v-skeleton-loader>
                    </v-col>
                </v-row>

                <!-- Estado Vazio -->
                <v-row class="mt-6 justify-center" v-else-if="isMobile">
                    <v-col cols="12" class="text-center pa-8">
                        <v-icon size="64" color="grey-lighten-1" class="mb-2">mdi-folder-open-outline</v-icon>
                        <div class="text-grey text-body-1">Nenhum arquivo ou pasta encontrado neste diretório.</div>
                    </v-col>
                </v-row>
            </v-sheet>

        </v-sheet>
    </v-container>
</template>

<script>
import { useSiteStore } from '../stores/siteStore'
import { authService } from '../auth/authService';

export default {
    name: 'SiteDetails',
    data: () => ({
        openMenuIndex: null,
        timer: null,
        longPressed: false,
        folderData: null,
        loadingFolder: false,
        header: [
            { title: 'Nome', value: 'Name' },
            { title: 'Modificado em', value: 'TimeLastModified' },
            { title: 'Ações' },
        ]
    }),

    computed: {
        site() {
            const store = useSiteStore()
            const siteId = this.$route.params.siteId
            if (store.selectedSite?.id === siteId) return store.selectedSite
            return store.getSiteById(siteId)
        },
        isMobile() {
            return this.$vuetify.display.smAndDown;
        },

        opcoesPasta() {
            return [
                { label: 'Abrir', icon: 'mdi-folder-open-outline', acao: this.abrirPasta },
                { label: 'Renomear', icon: 'mdi-pencil-outline', acao: this.renomearPasta },
                { label: 'Deletar', icon: 'mdi-trash-can-outline', acao: this.deletarPasta },
            ]
        },

        opcoesArquivo() {
            return [
                { label: 'Baixar', icon: 'mdi-tray-arrow-down', acao: this.baixarArquivo },
                { label: 'Visualizar', icon: 'mdi-eye', acao: this.visualizarArquivo },
                { label: 'Deletar', icon: 'mdi-trash-can-outline', acao: this.deletarArquivo },
                { label: 'Comentar', icon: 'mdi-comment-text-outline', acao: this.deletarArquivo },
            ]
        }
    },

    watch: {
        isMobile(value) {
            if (!value) this.drawer = true
        },

        '$route': {
            immediate: true,
            async handler(to) {
                console.log('route changed - TO:', to.name, to.params)
                if (to.name === 'SiteDetails') {
                    await this.fetchSharePointFolder()
                } else if (to.name === 'FolderDetails') {
                    const folderPath = decodeURIComponent(to.params.folderPath)
                    await this.fetchSubFolders(folderPath, false) // false = não navega de novo
                }
            }
        }
    },

    methods: {
        handleClick(item) {
            if (this.longPressed) {
                this.longPressed = false
                return
            }

            if (item.tipo === 'arquivo') {
                this.$router.push({
                    name: 'FileViewer',
                    query: {
                        path: item.ServerRelativeUrl,
                        name: item.Name
                    },
                })
            } else {
                this.fetchSubFolders(item.ServerRelativeUrl)
            }
        },
        startLongPress(item, index) {
            this.longPressed = false
            this.timer = setTimeout(() => {
                this.longPressed = true
                navigator.vibrate?.(50)
                this.openMenuIndex = index // 👈 abre o menu do item certo
            }, 500)
        },

        cancelLongPress() {
            clearTimeout(this.timer)
        },
        async fetchSharePointFolder() {
            this.loadingFolder = true;
            try {
                const token = await authService.acquireSharePointToken();
                if (!token) throw new Error('Sem token');

                const siteName = this.site?.name;
                if (!siteName) throw new Error('Sem siteName');

                const folderRelativeUrl = `/sites/${siteName}/Teste`;
                const encoded = encodeURIComponent(folderRelativeUrl);
                const baseUrl = `https://mmmalufconsultoria.sharepoint.com/sites/${siteName}`;

                const headers = {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json;odata=verbose",
                };

                const [foldersRes, filesRes] = await Promise.all([
                    fetch(`${baseUrl}/_api/web/GetFolderByServerRelativeUrl('${encoded}')/Folders`, { headers }),
                    fetch(`${baseUrl}/_api/web/GetFolderByServerRelativeUrl('${encoded}')/Files?$expand=ListItemAllFields,ListItemAllFields/ParentList`, { headers }),
                ]);

                const foldersData = await foldersRes.json();
                const filesData = await filesRes.json();

                const pastas = foldersData.d.results
                    .filter(f => f.Name !== 'Forms')
                    .map(f => ({ ...f, tipo: 'pasta' }));

                const arquivos = filesData.d.results
                    .map(f => ({ ...f, tipo: 'arquivo' }));

                this.folderData = [...pastas, ...arquivos];
            } catch (error) {
                this.folderData = [];
                console.error("Erro ao acessar SharePoint:", error);
            } finally {
                this.loadingFolder = false;
            }
        },

        // navigate=true quando vem do clique, false quando vem do watch (já está na URL certa)
        async fetchSubFolders(folderPath, navigate = true) {
            this.loadingFolder = true;
            try {
                const token = await authService.acquireSharePointToken();
                if (!token) throw new Error('Sem token');

                const encoded = encodeURIComponent(folderPath);
                const siteName = this.site?.name;
                if (!siteName) throw new Error('Sem siteName');

                const baseUrl = `https://mmmalufconsultoria.sharepoint.com/sites/${siteName}`;
                const headers = {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json;odata=verbose",
                };

                const [foldersRes, filesRes] = await Promise.all([
                    fetch(`${baseUrl}/_api/web/GetFolderByServerRelativeUrl('${encoded}')/Folders`, { headers }),
                    fetch(`${baseUrl}/_api/web/GetFolderByServerRelativeUrl('${encoded}')/Files?$expand=ListItemAllFields`, { headers }),
                ]);

                const foldersData = await foldersRes.json();
                const filesData = await filesRes.json();

                const pastas = foldersData.d.results
                    .filter(f => f.Name !== 'Forms')
                    .map(f => ({ ...f, tipo: 'pasta', TotalSize: null })); // null = carregando

                const arquivos = filesData.d.results
                    .map(f => ({ ...f, tipo: 'arquivo' }));

                this.folderData = [...pastas, ...arquivos];

                if (navigate) {
                    this.$router.push({
                        name: 'FolderDetails',
                        params: {
                            siteId: this.site.id,
                            folderPath: encodeURIComponent(folderPath)
                        }
                    });
                }

                // 🔥 Busca métricas em background sem travar a UI
                this.fetchFolderMetrics(pastas, baseUrl, headers);
                console.log('Conteúdo da pasta:', this.folderData);
            } catch (error) {
                this.folderData = [];
                console.error("Erro ao acessar conteúdo:", error);
            } finally {
                this.loadingFolder = false;
            }
        },

        async fetchFolderMetrics(pastas, baseUrl, headers) {
            await Promise.allSettled(
                pastas.map(async (pasta) => {
                    try {
                        const encodedUrl = encodeURIComponent(pasta.ServerRelativeUrl);
                        const res = await fetch(
                            `${baseUrl}/_api/web/GetFolderByServerRelativeUrl('${encodedUrl}')?$expand=StorageMetrics`,
                            { headers }
                        );
                        const data = await res.json();
                        const totalSize = data.d?.StorageMetrics?.TotalSize ?? 0;

                        // Atualiza reativo o item já renderizado
                        const item = this.folderData.find(f => f.UniqueId === pasta.UniqueId);
                        if (item) item.TotalSize = totalSize;

                    } catch {
                        const item = this.folderData.find(f => f.UniqueId === pasta.UniqueId);
                        if (item) item.TotalSize = -1; // indica erro
                    }
                })
            );
        },

        formatBytes(bytes) {
            if (!bytes) return '0 B';
            if (bytes < 1024) return `${bytes} Bytes (B)`;
            if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KiloBytes (KB)`;
            return `${(bytes / 1048576).toFixed(2)} MegaBytes (MB)`;
        },
    },

    mounted() {
        this.drawer = !this.isMobile;
    }
}

</script>

<style scoped>
.container-folders-mobile {
    height: 100vh;
    border-top: 12px solid #98d72d;
    border-bottom: 0px;
    border-top-left-radius: 34px;
    border-top-right-radius: 34px;
    margin-left: -16px;
    margin-right: -16px;
    margin-bottom: -16px;
    padding: 16px;
    margin-top: 16px;
    background-color: #f3f2f2;
}

.clicable-item {
    cursor: pointer;
}

::v-deep(.type-select .v-field) {
    border-top-left-radius: 48px;
    border-bottom-left-radius: 48px;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
}

::v-deep(.locality-select .v-field) {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
}

::v-deep(.owner-select .v-field) {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-top-right-radius: 48px;
    border-bottom-right-radius: 48px;
}
</style>