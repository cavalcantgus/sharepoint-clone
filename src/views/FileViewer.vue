<template>
  <div class="viewer-container">
    <div class="viewer-content px-2 d-flex align-center">
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
  <div class="text-center">
    <v-icon size="64" color="primary">mdi-video</v-icon>
    <p class="mt-4 text-body-1">O vídeo será aberto em uma nova aba.</p>
    <v-btn color="primary" :href="videoUrl" target="_blank">
      <v-icon left>mdi-open-in-new</v-icon>
      Abrir vídeo
    </v-btn>
  </div>
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
    <CommentSheet :modelValue="openModal" :fileId="fileId" @update:modelValue="openModal = $event" />
    <InfoDetails :modelValue="openDetails" :file="file" :fileExt="fileExt" @update:modelValue="openDetails = $event"
      :fileType="fileType" />
    <div class="viewer-footer py-2" style="border-top: 1px solid #ccc; background-color: #67921E;">


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

            <v-menu offset="30" activator="parent">
              <v-list>
                <v-list-item prepend-icon="mdi-information-slab-circle-outline" @click="openDetails = true"
                  append-icon="mdi-chevron-right">
                  <v-list-item-title class="font-weight-bold">Detalhes</v-list-item-title>

                  <v-list-item-subtitle>
                    Ver informações completas
                  </v-list-item-subtitle>
                </v-list-item>

                <v-divider />

                <v-list-item class="" style="font-weight: bold;" prepend-icon="mdi-check-circle"
                  append-icon="mdi-chevron-right" @click="moverArquivoParaAprovados()">
                  <v-list-item-title class="font-weight-bold">Aprovar</v-list-item-title>

                  <v-list-item-subtitle>
                    Mover para aprovados
                  </v-list-item-subtitle>

                </v-list-item>


                <v-divider />

                <v-list-item style="font-weight: bold;" prepend-icon="mdi-close-circle" append-icon="mdi-chevron-right"
                  @click="moverArquivoParaReprovados()">
                  <v-list-item-title class="font-weight-bold">Reprovar</v-list-item-title>

                  <v-list-item-subtitle>
                    Mover para reprovados
                  </v-list-item-subtitle>
                </v-list-item>

                <v-divider />

                <v-list-item style="font-weight: bold;" prepend-icon="mdi-pencil-outline"
                  append-icon="mdi-chevron-right" base-color="primary" @click="moverArquivoParaAprovados()">
                  <v-list-item-title class="font-weight-bold">Renomear</v-list-item-title>

                  <v-list-item-subtitle>
                    Alterar nome do arquivo
                  </v-list-item-subtitle>
                </v-list-item>

                <v-divider />

                <v-list-item style="font-weight: bold;" prepend-icon="mdi-trash-can-outline"
                  append-icon="mdi-chevron-right" base-color="error" @click="moverArquivoParaAprovados()">
                  <v-list-item-title class="font-weight-bold">Deletar</v-list-item-title>

                  <v-list-item-subtitle>
                    Remover arquivo permanentemente
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
          <span class="font-weight-semibold" style="font-size: 1rem;">Mais</span>
        </v-col>

      </v-row>

    </div>
  </div>

</template>

<script>
import { authService } from '../auth/authService';
import CommentSheet from '@/component/CommentSheet.vue';
import InfoDetails from '@/component/InfoDetails.vue';
import { toast } from '@/plugins/toast.js'

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
    videoUrl: null,
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

    // Busca de metadados do arquivo em visualização
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
      toast.success("Arquivo movido para aprovados.");
      this.$router.go(-1)
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
      toast.success("Arquivo movido para reprovados.");
      this.$router.go(-1)
    },

    async loadFile() {
      this.loading = true;
      this.error = null;
      try {
        const token = await authService.acquireSharePointToken();
        const apiUrl = `https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api/web/getFileByServerRelativeUrl('${encodeURIComponent(this.serverRelativeUrl)}')/$value`;

        if (this.fileType === 'video') {
  const token = await authService.acquireSharePointToken();
  const infoUrl = `https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api/web/getFileByServerRelativeUrl('${encodeURIComponent(this.serverRelativeUrl)}')?$select=UniqueId`;

  const resp = await fetch(infoUrl, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json;odata=verbose' }
  });
  const data = await resp.json();
  const uniqueId = data.d?.UniqueId;

  window.open(
    `https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_layouts/15/embed.aspx?UniqueId=${uniqueId}`,
    '_blank'
  );
  return;
}

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json;odata=verbose'
          }
        });

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

    async loadVideoStream(apiUrl, token) {
      const mediaSource = new MediaSource();
      this.blobUrl = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener('sourceopen', async () => {
        try {
          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json;odata=verbose'
            }
          });

          if (!response.ok) throw new Error(`Erro ${response.status}`);

          // Detecta o mime type (ajuste se necessário)
          const mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
          const sourceBuffer = mediaSource.addSourceBuffer(mimeType);

          const reader = response.body.getReader();

          const pump = async () => {
            const { done, value } = await reader.read();
            if (done) {
              mediaSource.endOfStream();
              return;
            }
            // Aguarda o buffer estar pronto antes de adicionar mais dados
            if (sourceBuffer.updating) {
              await new Promise(resolve => sourceBuffer.addEventListener('updateend', resolve, { once: true }));
            }
            sourceBuffer.appendBuffer(value);
            await new Promise(resolve => sourceBuffer.addEventListener('updateend', resolve, { once: true }));
            pump();
          };

          pump();
        } catch (err) {
          this.error = `Erro no stream do vídeo: ${err.message}`;
        }
      });
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
.viewer-footer {
  flex-shrink: 0;
}

.viewer-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.viewer-content {
  border: 2px solid #222222;
  background-color: #222222;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.viewer-content>div {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.viewer-video {
  max-width: 100%;
  max-height: 100%;
}

.viewer-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.viewer-text pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
  font-size: 0.9rem;
}
</style>
