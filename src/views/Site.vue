<template>
    <v-container>
        <v-sheet>
            <v-row>
                <v-col cols="12">
                    <span class="text-headline-medium">{{ site?.displayName }}</span>
                </v-col>
            </v-row>
            <v-row class="d-flex align-center border">
                <v-col cols="9" lg="12">
                    <v-text-field hide-details prepend-inner-icon="mdi-magnify" variant="outlined" density="compact"
                        placeholder="Buscar pastas ou arquivos"></v-text-field>
                </v-col>
                <v-col v-if="isMobile" cols="3" class="border">
                    <v-btn variant="outlined" color="primary" class="">
                        <v-icon size="25">mdi-filter-variant</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-row dense no-gutters v-if="!isMobile">
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

            <v-row class="mt-4">
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
                                            <v-list-item-title>{{ opcao.label }}</v-list-item-title>
                                        </v-list-item>
                                    </v-menu>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
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
                { label: 'Abrir', acao: this.abrirPasta },
                { label: 'Renomear', acao: this.renomearPasta },
                { label: 'Deletar', acao: this.deletarPasta },
            ]
        },
        opcoesArquivo() {
            return [
                { label: 'Baixar', acao: this.baixarArquivo },
                { label: 'Visualizar', acao: this.visualizarArquivo },
                { label: 'Deletar', acao: this.deletarArquivo },
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