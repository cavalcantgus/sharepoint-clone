<template>
    <div class="viewer-container">
        <div class="viewer-content">
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

        <v-bottom-app-bar color="white" elevation="4" class="py-2">

            <v-row class="w-100 ma-0 align-center" style="color: #476515;">

                <!-- Download -->
                <v-col cols="3" class="d-flex justify-center flex-column align-center">
                    <v-btn icon variant="text" @click="download">
                        <v-icon size="x-large">mdi-tray-arrow-down</v-icon>
                        <!-- <v-tooltip activator="parent" location="top">
                    Baixar
                </v-tooltip> -->
                    </v-btn>
                    <span style="font-size: 1.10rem;">Baixar</span>
                </v-col>

                <!-- Compartilhar -->
                <v-col cols="3" class="d-flex justify-center flex-column align-center">
                    <v-btn icon variant="text" @click="openModal = true">
                        <v-icon size="x-large">mdi-comment-outline</v-icon>
                        <!-- <v-tooltip activator="parent" location="top">
                    Compartilhar
                </v-tooltip> -->

                    </v-btn>
                    <span style="font-size: 1.10rem;">Comentar</span>
                </v-col>

                <!-- Compartilhar -->
                <v-col cols="3" class="d-flex justify-center flex-column align-center">
                    <v-btn icon variant="text" @click="share">
                        <v-icon size="x-large">mdi-share-variant-outline</v-icon>
                        <!-- <v-tooltip activator="parent" location="top">
                    Compartilhar
                </v-tooltip> -->

                    </v-btn>
                    <span style="font-size: 1.10rem;">Compartilhar</span>
                </v-col>

                <!-- Mais opções -->
                <v-col cols="3" class="d-flex justify-center flex-column align-center">
                    <v-btn icon variant="text">
                        <v-icon size="x-large">mdi-dots-vertical</v-icon>

                        <v-menu activator="parent">
                            <v-list>
                                <v-list-item title="Renomear" prepend-icon="mdi-pencil" @click="rename" />

                                <v-list-item title="Excluir" prepend-icon="mdi-delete-outline" base-color="error"
                                    @click="deleteFile" />
                            </v-list>
                        </v-menu>
                    </v-btn>
                    <span style="font-size: 1.10rem;">Mais</span>
                </v-col>

            </v-row>


        </v-bottom-app-bar>
        <CommentSheet :modelValue="openModal" :fileId="file" @update:modelValue="openModal = $event" />
    </div>
</template>

<script>
import { authService } from '../auth/authService';
import CommentSheet from '@/component/CommentSheet.vue';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
const TEXT_EXTS = ['txt', 'csv', 'json', 'xml', 'md', 'log'];

export default {
    name: 'FileViewer',
    components: {
        CommentSheet
    },
    data: () => ({
        openModal: false,
        loading: true,
        error: null,
        blobUrl: null,
        textContent: null,
        file: history.state.file || null
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
                this.file = data.d.ListItemAllFields.Id

            } catch (error) {
                console.error('Erro ao buscar item do arquivo:', error)
            }
        },

        async loadFile() {
            this.loading = true;
            this.error = null;

            try {
                const token = await authService.acquireSharePointToken();

                // monta a URL via API REST do SharePoint
                // Lembrar de deixar dinâmico o nome do servidor e site no futuro, por enquanto tá hardcoded                
                const apiUrl = `https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api/web/getFileByServerRelativeUrl('${encodeURIComponent(this.filePath)}')/$value`;

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
.viewer-container {
    display: flex;
    flex-direction: column;
}

.viewer-content {
    /* flex: 1; */
    overflow: auto;
    /* margin-top: 64px; */
}

.viewer-image {
    max-width: 100%;
    max-height: calc(100vh - 80px);
    /* object-fit: contain; */
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