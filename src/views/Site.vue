<template>
    <v-container>
        <v-sheet>
            <v-row>
                <v-col cols="12">
                    <span class="text-headline-medium">{{ site?.displayName }}</span>
                </v-col>
            </v-row>
            <v-row class="d-flex align-center">
                <v-col cols="9" lg="12">
                    <v-text-field hide-details prepend-inner-icon="mdi-magnify" variant="outlined" density="compact"
                        placeholder="Buscar pastas ou arquivos"></v-text-field>
                </v-col>
                <v-col v-if="isMobile" cols="3" class="d-flex justify-end">
                    <v-btn variant="outlined" color="primary" class="">
                        <v-icon size="25">mdi-filter-variant</v-icon>
                    </v-btn>
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
            <v-row class="mt-6" v-if="!loadingFolder && folderData.length > 0 && isMobile">
                <v-col v-for="(item, index) in folderData" :key="index" cols="6" sm="4" md="3" lg="2">
                    <!-- Card principal com hover e ação de clique -->
                    <v-card variant="elevated"
                        class="pa-2 d-flex flex-column align-center justify-center text-center cursor-pointer item-card fill-height"
                        @click="fetchSubFolders(item.ServerRelativeUrl)"
                        @touchstart="startLongPress(item)"
                        @touchend="cancelLongPress"
                        @touchmove="cancelLongPress">
                        <!-- Ícone Grande Dinâmico -->
                        <v-card-title class="d-flex justify-end w-100 pa-0">
                            <v-icon class="">mdi-dots-vertical</v-icon>
                        </v-card-title>
                        <v-icon size="56" :color="item.tipo === 'pasta' ? 'amber-darken-1' : 'blue-accent-2'"
                            class="mb-3">
                            {{ item.tipo === 'pasta' ? 'mdi-folder' : 'mdi-file-document-outline' }}
                        </v-icon>

                        <!-- Nome do Item (Tratado para não quebrar o layout com nomes longos) -->
                        <div class="text-body-2 font-weight-medium text-truncate w-100 px-1">
                            {{ item.Name }}
                        </div>

                        <!-- Subtítulo opcional de metadados se necessário -->
                        <div class="text-caption text-grey mt-1 text-truncate w-100">
                            {{ item.tipo === 'pasta' ? 'Pasta' : 'Arquivo' }}
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </v-sheet>
    </v-container>
</template>

<script>
import { useSiteStore } from '../stores/siteStore'
import { authService } from '../auth/authService';

export default {
    name: 'SiteDetails',
    data: () => ({
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

        startLongPress(item) {
            this.longPressed = false

            this.timer = setTimeout(() => {

                this.longPressed = true

                navigator.vibrate?.(50)

                item.menu = true

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
                    .map(f => ({ ...f, tipo: 'pasta' }));

                const arquivos = filesData.d.results
                    .map(f => ({ ...f, tipo: 'arquivo' }));

                this.folderData = [...pastas, ...arquivos];

                // Só navega se veio de um clique — evita loop com o watch
                if (navigate) {
                    this.$router.push({
                        name: 'FolderDetails',
                        params: {
                            siteId: this.site.id,
                            folderPath: encodeURIComponent(folderPath)
                        }
                    });
                }
            } catch (error) {
                this.folderData = [];
                console.error("Erro ao acessar conteúdo:", error);
            } finally {
                this.loadingFolder = false;
            }
        },
    },

    mounted() {
        this.drawer = !this.isMobile;
    }
}

</script>

<style scoped>
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