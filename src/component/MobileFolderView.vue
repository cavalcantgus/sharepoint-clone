<template>
  <v-container class="pa-0">
    <v-row class="mt-6 bg-white">
      <v-col class="elevation-1 rounded-lg pa-2" v-for="(item, index) in filteredFolderData" :key="index" cols="12"
        sm="4" md="3" lg="2">

        <!-- Bottom Sheet — aberto pelo toque longo via openMenuIndex -->
        <v-bottom-sheet :model-value="openMenuIndex === index"
          @update:model-value="val => { if (!val) openMenuIndex = null }">

          <template #activator="{ props: sheetProps }">

            <v-card v-bind="sheetProps"
              class=" bg-transparent elevation-0 d-flex flex-row align-center justify-start text-center cursor-pointer item-card fill-height"
              @click.stop="handleClick(item)" @touchstart="startLongPress(item, index)" @touchend="cancelLongPress"
              @touchmove="cancelLongPress">

              <Icon :icon="item.tipo === 'pasta' ? 'ant-design:folder-filled' : 'ant-design:file-filled'" width="56"
                :color="item.tipo === 'pasta' ? '#98d72d' : '#ccc'" class="mb-3 folder-icon" :style="{
                  filter: item.tipo === 'pasta'
                    ? 'drop-shadow(0 6px 4px #6F9D21)'
                    : 'drop-shadow(0 6px 4px #888)'
                }">
              </Icon>
              <div class=" d-flex flex-column align-center justify-center text-start fill-height mx-2">
                <div class="text-body-1 font-weight-medium text-truncate w-100">
                  <span style="color: #476515; font-weight: 600; font-size: 1.2rem;">{{
                    item.Name }}</span>
                </div>

                <div class="text-caption text-grey text-truncate w-100 d-flex flex-row">
                  <!-- Pasta -->
                  <template v-if="item.tipo === 'pasta'">
                    <div class="d-flex flex-column">
                      <div class="d-flex flex-row">
                        <span style="color: #577B1A; font-size: 1rem;">
                          {{ item.ItemCount > 1 ? `${item.ItemCount} itens` : '1 item'
                          }}
                        </span>
                        <span style="color: #577B1A; font-size: 1rem;" class="mx-2">|</span>
                        <span style="color: #577B1A; font-size: 1rem;">
                          <template v-if="item.TotalSize === null">
                            calculando...</template>
                          <template v-else-if="item.TotalSize === -1"> —</template>
                          <template v-else> {{ formatBytes(item.TotalSize) }}</template>
                        </span>



                      </div>
                      <div class="d-flex align-center">
                        <v-icon>mdi-calendar</v-icon>
                        <span>Atualizado em: {{ formatDate(item.TimeLastModified) }}</span>
                      </div>
                    </div>

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
            <v-list-item v-for="opcao in item.tipo === 'pasta' ? opcoesPasta : opcoesArquivo" :key="opcao.label"
              @click="opcao.acao(item)">
              <v-list-item-title class="d-flex ga-3">
                <v-icon>{{ opcao.icon }}</v-icon>
                <span>{{ opcao.label }}</span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-bottom-sheet>

      </v-col>
      <v-col v-if="folderData?.length < 1" cols="12"
        class="d-flex flex-column align-center justify-center text-center py-12">
        <v-icon size="64" color="grey-darken-1" class="mb-4">
          mdi-folder-open-outline
        </v-icon>

        <h3 class="text-h6 font-weight-medium mb-2">
          Nenhum item encontrado
        </h3>

        <p class="text-medium-emphasis">
          Esta pasta está vazia no momento.
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'MobileFolderView',
  props: {
    folderData: {
      type: Array,
      required: true
    },

    search: {
      type: String,
      default: ''
    }
  },
  emits: ['handle-click'],

  data: () => ({
    openMenuIndex: null,
    longPressTimer: null,
    opcoesPasta: [
      { label: 'Renomear', icon: 'mdi-pencil', acao: (item) => { /* ... */ } },
      { label: 'Excluir', icon: 'mdi-delete', acao: (item) => { /* ... */ } },
    ],
    opcoesArquivo: [
      { label: 'Baixar', icon: 'mdi-download', acao: (item) => { /* ... */ } },
      { label: 'Excluir', icon: 'mdi-delete', acao: (item) => { /* ... */ } },
    ],
  }),
  computed: {
    filteredFolderData() {
      const search = this.search?.trim().toLowerCase()

      if (!search) {
        return this.folderData
      }

      return this.folderData.filter(item =>
        item.Name?.toLowerCase().includes(search)
      )
    }
  },

  methods: {
    handleClick(item) {
      // lógica do filho
      this.$emit('handle-click', item)
    },

    startLongPress(item, index) {
      this.longPressTimer = setTimeout(() => {
        this.openMenuIndex = index;
      }, 600); // 600ms para reconhecer como toque longo
    },
    cancelLongPress() {
      clearTimeout(this.longPressTimer);
    },
    formatBytes(bytes) {
      if (!bytes) return '0 B';
      if (bytes < 1024) return `${bytes} Bytes (B)`;
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KiloBytes (KB)`;
      return `${(bytes / 1048576).toFixed(2)} MegaBytes (MB)`;
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  mounted() {
    console.log('MobileFolderView montado com dados:', this.folderData);
  }
}

</script>
