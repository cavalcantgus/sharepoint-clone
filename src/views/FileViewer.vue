<template>
    <div class="viewer-container ga-3">
        <div class="viewer-content pa-2">
            <!-- Loading -->
            <div v-if="loading" class="d-flex justify-center align-center fill-height">
                <v-progress-circular indeterminate color="primary" />
            </div>

            <!-- Erro -->
            <div v-else-if="error" class="d-flex justify-center align-center fill-height">
                <v-empty-state icon="mdi-alert-circle-outline" :title="error" />
            </div>

            <!-- Imagem -->
            <div v-else-if="fileType === 'image'" class="d-flex justify-center align-center ">
                <img :src="blobUrl" :alt="fileName" class="viewer-image" />
            </div>

            <!-- Vídeo -->
            <div v-else-if="fileType === 'video'" class="d-flex justify-center align-center fill-height">
                <video :src="blobUrl" controls class="viewer-video" />
            </div>

            <!-- PDF -->
            <iframe v-else-if="fileType === 'pdf'" :src="blobUrl" class="viewer-iframe" />

            <!-- TXT -->
            <div v-else-if="fileType === 'text'" class="viewer-text pa-4">
                <pre>{{ textContent }}</pre>
            </div>

            <!-- Não suportado -->
            <div v-else class="d-flex justify-center align-center fill-height flex-column ga-4">
                <v-icon size="64" color="grey">mdi-file-off-outline</v-icon>
                <span class="text-grey">Tipo de arquivo não suportado</span>
                <v-btn color="primary" @click="download">Baixar arquivo</v-btn>
            </div>
        </div>


        <v-footer
            style="border-top: 1px solid #ccc ;background-color: #67921E; position: fixed; bottom: 0; left: 0; right: 0;z-index: 100;"
            class="py-2 border context-action pa-0 ma-0 ">

            <v-row class="w-100 ma-0 align-center justify-center pa-2" style="color: #ffffff; ">

                <!-- Download -->
                <v-col cols="2" class="d-flex justify-center flex-column align-center ga-1">
                    <v-btn height="auto" icon variant="text" @click="download">
                        <v-icon size="x-large">mdi-tray-arrow-down</v-icon>
                        <!-- <v-tooltip activator="parent" location="top">
                    Baixar
                </v-tooltip> -->
                    </v-btn>
                    <span class="font-weight-semibold" style="font-size: 1rem;">Baixar</span>
                </v-col>

                <v-divider vertical></v-divider>

                <!-- Compartilhar -->
                <v-col cols="2" class="d-flex justify-center flex-column align-center ga-1">
                    <v-btn height="auto" icon variant="text" @click="openModal = true">
                        <v-icon size="x-large">mdi-comment-outline</v-icon>
                        <!-- <v-tooltip activator="parent" location="top">
                    Compartilhar
                </v-tooltip> -->

                    </v-btn>
                    <span class="font-weight-semibold" style="font-size: 1rem;">Comentar</span>
                </v-col>

                <v-divider vertical></v-divider>

                <!-- Compartilhar -->
                <v-col cols="2" class="d-flex justify-center flex-column align-center ga-1">
                    <v-btn height="auto" icon variant="text" @click="share">
                        <v-icon size="x-large">mdi-share-variant-outline</v-icon>
                        <!-- <v-tooltip activator="parent" location="top">
                    Compartilhar
                </v-tooltip> -->

                    </v-btn>
                    <span class="font-weight-semibold" style="font-size: 1rem;">Compartilhar</span>
                </v-col>

                <v-divider vertical></v-divider>

                <!-- Mais opções -->
                <v-col cols="2" class="d-flex justify-center flex-column align-center ga-1">
                    <v-btn height="auto" icon variant="text">
                        <v-icon size="x-large">mdi-dots-vertical</v-icon>

                        <v-menu activator="parent">
                            <v-list>
                                <v-list-item title="Detalhes" prepend-icon="mdi-information-slab-circle-outline"
                                    @click="openDetails = true" />

                                <v-divider />

                                <v-list-item style="font-weight: bold;" title="Aprovar"
                                    prepend-icon="mdi-check-circle-outline" base-color="success" @click="moverArquivoParaAprovados()" />

                                <v-list-item title="Reprovar" prepend-icon="mdi-close-circle-outline" base-color="error"
                                    @click="moverArquivoParaReprovados()" />

                                <v-divider />

                                <v-list-item title="Renomear" prepend-icon="mdi-pencil-outline" @click="rename" />

                                <v-list-item title="Excluir" prepend-icon="mdi-delete-outline" base-color="error"
                                    @click="deleteFile" />
                            </v-list>
                        </v-menu>
                    </v-btn>
                    <span class="font-weight-semibold" style="font-size: 1rem;">Mais</span>
                </v-col>

            </v-row>


        </v-footer>

        <CommentSheet :modelValue="openModal" :fileId="fileId" @update:modelValue="openModal = $event" />
        <InfoDetails :modelValue="openDetails" :file="file" :fileExt="fileExt" @update:modelValue="openDetails = $event"
            :fileType="fileType" />
    </div>
</template>

<script>
import { authService } from '../auth/authService';
import CommentSheet from '@/component/CommentSheet.vue';
import InfoDetails from '@/component/InfoDetails.vue';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
const TEXT_EXTS = ['txt', 'csv', 'json', 'xml', 'md', 'log'];

export default {
    name: 'FileViewer',
    components: {
        CommentSheet,
        InfoDetails,
    },
    data: () => ({
        openModal: false,
        openDetails: false,
        loading: true,
        error: null,
        blobUrl: null,
        textContent: null,
        fileId: null,
        file: null,
        from: null,
        serverRelativeUrl: null,
        varFileType: null,
        aprovado: "/sites/ServidorGeraoBancria/Teste/Servidor Geração Bancária/Aprovados",
        reprovado: "/sites/ServidorGeraoBancria/Teste/Servidor Geração Bancária/Reprovados"
    }),

    computed: {
        filePath() {
            return this.$route.query.path;
        },
        fileName() {
            return this.$route.query.name || 'Arquivo';
        },
        fileExt() {
            return this.fileName.split('.').pop().toLowerCase();
        },
        fileType() {
            if (IMAGE_EXTS.includes(this.fileExt)) return 'image';
            if (VIDEO_EXTS.includes(this.fileExt)) return 'video';
            if (this.fileExt === 'pdf') return 'pdf';
            if (TEXT_EXTS.includes(this.fileExt)) return 'text';
            return 'unsupported';
        },
    },

    methods: {
        async fetchFileItem() {
            try {
                const token = await authService.acquireSharePointToken()
                const path = this.$route.query.path

                // Lembrar de deixar dinâmico o nome do servidor e site no futuro, por enquanto tá hardcoded
                const res = await fetch(
                    `https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api/web/GetFileByServerRelativeUrl('${encodeURIComponent(path)}')?$expand=ListItemAllFields,Author,ModifiedBy`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json;odata=verbose',
                        }
                    }
                )

                const data = await res.json()
                this.fileId = data.d.ListItemAllFields.Id
                this.file = data.d
                console.log('Item do arquivo:', this.file)

            } catch (error) {
                console.error('Erro ao buscar item do arquivo:', error)
            }
        },

        async moverArquivoParaAprovados() {
            const baseUrl = "https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api";
            const nomeDoArquivo = this.file?.ServerRelativeUrl.split("/").pop();
            const token = await authService.acquireSharePointToken();

            await fetch(`${baseUrl}/Web/GetFileByServerRelativePath(decodedurl='${this.file?.ServerRelativeUrl}')/MoveTo(newUrl='${this.aprovado}/${nomeDoArquivo}',flags=1)`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json;odata=verbose"
                }
            });
            this.$router.replace(this.from)
        },

        async moverArquivoParaReprovados() {
            const baseUrl = "https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api";
            const nomeDoArquivo = this.file?.ServerRelativeUrl.split("/").pop();
            const token = await authService.acquireSharePointToken();

            await fetch(`${baseUrl}/Web/GetFileByServerRelativePath(decodedurl='${this.file?.ServerRelativeUrl}')/MoveTo(newUrl='${this.reprovado}/${nomeDoArquivo}',flags=1)`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json;odata=verbose"
                }
            });
            this.$router.replace(this.from)
        },

        async loadFile() {
            this.loading = true;
            this.error = null;

            try {
                const token = await authService.acquireSharePointToken();

                // monta a URL via API REST do SharePoint
                // Lembrar de deixar dinâmico o nome do servidor e site no futuro, por enquanto tá hardcoded                
                const apiUrl = `https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api/web/getFileByServerRelativeUrl('${encodeURIComponent(this.serverRelativeUrl)}')/$value`;

                const response = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json;odata=verbose'
                    }
                });
                console.log('Resposta da API:', response);
                if (!response.ok) throw new Error(`Erro ${response.status}`);

                if (this.fileType === 'text') {
                    this.textContent = await response.text();
                } else {
                    const blob = await response.blob();
                    this.blobUrl = URL.createObjectURL(blob);
                }

            } catch (err) {
                this.error = `Não foi possível carregar o arquivo. ${err.message}`;
            } finally {
                this.loading = false;
            }
        },

        async download() {
            try {
                const token = await authService.acquireSharePointToken();
                const response = await fetch(
                    `https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api/web/getFileByServerRelativeUrl('${encodeURIComponent(this.filePath)}')/$value`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = this.fileName;
                a.click();
                URL.revokeObjectURL(url);
            } catch (err) {
                console.error('Erro ao baixar:', err);
            }
        },
    },

    async mounted() {
        console.log(this.$route.query)
        if (!this.filePath) {
            this.error = 'URL do arquivo não informada.';
            this.loading = false;
            return;
        }
        this.from = this.$route.query.from || null
        console.log('Rota de origem:', this.from);
        this.serverRelativeUrl = this.$route.query.path
        console.log('URL do arquivo:', this.serverRelativeUrl);
        await this.loadFile();
        this.file = history.state.file || null
        console.log('Arquivo carregado:', this.file);
        this.fetchFileItem();
    },

    beforeUnmount() {
        if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
    },
};
</script>

<style scoped>
/* .viewer-container {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;      
} */

.viewer-content {
    flex: 1;
    overflow-y: scroll;
    height: 100dvh;
    display: flex;
    padding-bottom: 120px;
    flex-direction: column;
    /* ← só o conteúdo rola */
    /* ← espaço pra não ficar atrás da barra fixa */
}

.viewer-content>div {
    flex: 1;
    /* ← faz a div crescer e preencher */
}

.viewer-image {
    border-radius: 20px;
    max-width: 100%;
    max-height: 100%;
    /* ← era calc(100vh - 80px) */
    object-fit: contain;
    /* ← descomenta isso */
}

.viewer-video {
    max-width: 100%;
    max-height: calc(100vh - 80px);
}

.viewer-iframe {
    width: 100%;
    height: calc(100vh - 64px);
    border: none;
}

.viewer-text pre {
    white-space: pre-wrap;
    word-break: break-word;
    font-family: monospace;
    font-size: 0.9rem;
}
</style>