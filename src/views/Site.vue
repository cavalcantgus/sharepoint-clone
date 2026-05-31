<template>
  <v-container style="background-color: #67921E; height: 100vh;">

    <!-- Visualização Mobile -->
    <v-sheet style="background-color: #67921E;" class="my-4" v-if="isMobile" >

       <v-row class="d-flex flex-row justify-space-between justify-center mb-8">
        <v-col cols="auto" class="d-flex text-white flex-column ">
          <span class="text-headline-medium" style="color: #fff; font-weight: bold; line-height: 1; font-size: 2.5rem;">
            Pastas</span>
          <span>Organize e acesse seus arquivos</span>
        </v-col>
        <v-col cols="auto" class="">
          <v-btn icon class="elevation-0 d-flex align-center" style="color: #fff; background-color: #1E2B0980;">
            <v-icon size="25">mdi-magnify</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-sheet>
    <v-sheet v-if="isMobile"  style="background-color: #fff; border-top-left-radius: 34px; border-top-right-radius: 34px;" class="my-4 mx-n4 h-100" >

      <!-- Botões de ação e contagem -->
      <v-row class="px-6 py-4 d-flex justify-space-between justify-center " dense>
        <v-col class="">
          <v-btn class="bg-transparent elevation-0 d-flex" color="#EAF7D5" style="color: #476415">
            <Icon width="25" icon="mdi:filter-variant">
            </Icon>
            <span class="font-weight-semibold">Filtros</span>
          </v-btn>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="auto">
          <v-btn class="bg-transparent pa-0" :elevation="grid ? 1 : 0" min-width="0" width="36" height="36" @click="grid = !grid">
            <Icon color="#476415" width="25" icon="mingcute:grid-line" />
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn class="bg-transparent" :elevation="grid === false ? 1 : 0" min-width="0" width="36" height="36" @click="grid = false">
            <Icon color="#476415" width="25" icon="ic:baseline-format-list-bulleted"></Icon>
          </v-btn>
        </v-col>

        <v-col cols="12">
          <span class="font-weight-semibold" style="font-size: 1.10rem;">Pastas</span>
          <div>
            <span>{{ this.folderData?.length }} <span>{{ this.folderData?.length === 1 ? 'pasta' :
              'pastas' }} •
              </span></span>
            <span>{{ this.totalItems }} <span>{{ this.totalItems === 1 ? 'item' : 'itens'
            }}</span></span>
          </div>
        </v-col>
      </v-row>

      <v-row density="compact" class="px-4">
        <v-col>
          <MobileFolderView v-if="grid" @handle-click="handleClick" :folderData="folderData">
          </MobileFolderView>
          <MobileFolderViewLine v-if="!grid" @handle-click="handleClick" :folderData="folderData">
          </MobileFolderViewLine>
        </v-col>
      </v-row>
    </v-sheet>

  </v-container>
</template>

<script>
import { useSiteStore } from '../stores/siteStore'
import { authService } from '../auth/authService';
import MobileFolderView from '@/component/MobileFolderView.vue';
import MobileFolderViewLine from '@/component/MobileFolderViewLine.vue';

export default {
  name: 'SiteDetails',
  components: {
    MobileFolderView,
    MobileFolderViewLine
  },
  emits: ['handle-click'],
  data: () => ({
    openMenuIndex: null,
    grid: true,
    timer: null,
    longPressed: false,
    folderData: null,
    loadingFolder: false,
    totalItems: 0,
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

        console.log(to.params.folderPath)
        console.log(typeof to.params.folderPath)
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
            name: item.Name,
            from: this.$route.fullPath
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
        this.totalItems = 0;

        this.folderData.forEach(item => {
          console.log('ItemCount:', item.ItemCount);

          this.totalItems += Number(item.ItemCount || 1);

          console.log('TotalItems acumulado:', this.totalItems);
        });

        console.log('Total de itens na pasta:', this.totalItems);
        console.log('Conteúdo da pasta:', this.folderData);
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

        this.totalItems = 0;

        this.folderData.forEach(item => {
          console.log('ItemCount:', item.ItemCount);

          this.totalItems += Number(item.ItemCount || 1);

          console.log('TotalItems acumulado:', this.totalItems);
        });
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
  },

  mounted() {
    this.drawer = !this.isMobile;
    this.fetchSharePointFolder();
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
