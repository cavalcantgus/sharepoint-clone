<template>
  <v-bottom-sheet v-model="isOpen" :scrim="true" max-height="75vh">
    <v-card rounded="t-xl" class="d-flex flex-column" style="max-height: 75vh;">

      <!-- Handle de arraste -->
      <div class="d-flex justify-center pt-3 pb-1" @touchstart="dragStart" @touchmove="dragMove" @touchend="dragEnd"
        style="cursor: grab; touch-action: none;">
        <div style="width: 40px; height: 4px; border-radius: 2px; background: #e0e0e0;" />
      </div>

      <!-- Cabeçalho -->
      <v-card-title class="d-flex align-center justify-space-between px-4 pb-2">
        <v-btn icon class="elevation-0" @click="this.$emit('update:modelValue', false)">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <span class="text-h6">Comentários</span>
        <v-chip v-if="comments?.length > 0" size="small" color="primary" variant="tonal">
          {{ comments?.length || 0 }}
        </v-chip>
      </v-card-title>

      <v-divider />

      <!-- Lista de comentários -->
      <div ref="listRef" class="overflow-y-auto flex-grow-1 px-4 py-5" style="min-height: 0;">

        <!-- Loading inicial -->
        <div v-if="loadingComments" class="d-flex justify-center py-8">
          <v-progress-circular indeterminate color="primary" size="28" />
        </div>

        <!-- Erro ao carregar -->
        <div v-else-if="loadError" class="d-flex flex-column align-center py-8 ga-2">
          <v-icon color="error">mdi-alert-circle-outline</v-icon>
          <span class="text-body-2 text-medium-emphasis">Erro ao carregar comentários</span>
          <v-btn size="small" variant="tonal" @click="fetchComments">Tentar novamente</v-btn>
        </div>

        <!-- Sem comentários -->
        <div v-else-if="comments?.length === 0" class="d-flex flex-column align-center py-8 ga-2">
          <v-icon size="40" color="grey-lighten-1">mdi-comment-off-outline</v-icon>
          <span class="text-body-2 text-medium-emphasis">Nenhum comentário ainda</span>
          <span class="text-caption text-disabled">Seja o primeiro a comentar</span>
        </div>

        <!-- Lista -->
        <div v-else class="d-flex flex-column ga-4">
          <div v-for="comment in comments" :key="comment.id" class="d-flex ga-3">
            <!-- Avatar -->
            <v-avatar size="36" color="primary">
              <span class="text-caption font-weight-medium">
                {{ initials(comment.author.name) }}
              </span>
            </v-avatar>

            <!-- Conteúdo -->
            <div class="flex-grow-1">
              <div class="d-flex align-center ga-2">
                <span class="text-body-2 font-weight-medium">{{ comment.author.name }}</span>
                <span class="text-caption text-disabled">{{ formatDate(comment.createdDate) }}</span>
              </div>
              <p class="text-body-2 mt-1 mb-0" style="line-height: 1.5;">
                {{ comment.text }}
              </p>
            </div>
          </div>
        </div>

      </div>

      <v-divider />

      <!-- Input de novo comentário -->
      <div class="px-4 py-3">
        <v-textarea v-model="newComment" placeholder="Escreva um comentário..." rows="1" auto-grow max-rows="4"
          variant="outlined" density="compact" hide-details :disabled="sending" @keydown.enter.exact.prevent="submit">
          <template #append-inner>
            <v-btn icon variant="text" color="primary" size="small" :loading="sending" :disabled="!newComment.trim()"
              @click="submit">
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </template>
        </v-textarea>
        <span class="text-caption text-disabled mt-1 d-block">Enter para enviar</span>
      </div>

    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { authService } from '../auth/authService';
import axios from '../service/axios.js';

export default {
  name: 'CommentsSheet',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    fileId: {
      type: [String, Number],
      required: false,
    },
  },

  emits: ['update:modelValue'],

  data: () => ({
    dragStartY: 0,
    isOpen: false,
    newComment: '',
    loadingComments: false,
    loadError: false,
    sending: false,
    comments: [],
    userProfile: null,
  }),

  watch: {
    modelValue(val) {
      this.isOpen = val
      // if (val) this.fetchComments() // descomente quando a API estiver pronta
    },

    isOpen(val) {
      this.$emit('update:modelValue', val)
    },

    fileId(val) {
      if (val) this.fetchComments()
    },
  },

  methods: {
    // ─── API ──────────────────────────────────────────────────────────────

    dragStart(e) {
      this.dragStartY = e.touches[0].clientY
    },
    dragMove(e) {
      // opcional: animar enquanto arrasta
    },
    dragEnd(e) {
      const delta = e.changedTouches[0].clientY - this.dragStartY
      if (delta > 80) { // arrastou 80px pra baixo → fecha
        this.$emit('update:modelValue', false)
      }
    },

    async fetchComments() {
      if (!this.fileId) return

      this.loadingComments = true
      this.loadError = false

      try {
        const token = await authService.acquireSharePointToken()

        const res = await fetch(
          `https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api/web/lists('b2365f70-d3a1-4f9f-94d0-321706bc96b8')/items(${this.fileId})/Comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json;odata=verbose',
            }
          }
        )

        if (!res.ok) throw new Error()

        const data = await res.json()
        this.comments = data.d?.results || []
        console.log('Comentários carregados:', this.comments)
      } catch {
        this.loadError = true
      } finally {
        this.loadingComments = false
      }
    },

    async fetchUserProfile() {
      const token = await authService.acquireToken();
      if (!token) return;

      try {
        // Busca os dados do perfil
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.userProfile = await response.json();
        console.log('Perfil do usuário:', this.userProfile);
        // Busca a foto separadamente
        const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (photoResponse.ok) {
          const blob = await photoResponse.blob();
          this.userPhoto = URL.createObjectURL(blob);
        }

      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
      }
    },

    mountOptimistiComment(newComment) {
      return {
        id: `temp-${Date.now()}`,
        text: newComment,
        author: {
          name: this.userProfile?.displayName || 'Você', // ou pegue do usuário logado se tiver disponível
          email: this.userProfile?.mail || this.userProfile?.userPrincipalName || '',
        },
        createdDate: new Date().toISOString(),
        modifiedDate: null,
        isLikedByUser: false,
        isReply: false,
        likeCount: 0,
        replyCount: 0,
        parentId: '0',
        itemId: this.fileId,
        listId: 'b2365f70-d3a1-4f9f-94d0-321706bc96b8',
        mentions: { results: [] },
        likedBy: {},
        replies: {},
        _pending: true,
      }
    },

    async submit() {
      const text = this.newComment.trim()
      if (!text || this.sending) return

      this.sending = true

      const optimisticComment = this.mountOptimistiComment(text)
      this.comments.push(optimisticComment)
      this.newComment = ''

      await this.$nextTick()
      if (this.$refs.listRef) {
        this.$refs.listRef.scrollTop = this.$refs.listRef.scrollHeight
      }

      try {
        const token = await authService.acquireSharePointToken() // 👈 dentro do try

        const { data } = await axios.create().post(
          `https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api/web/lists('b2365f70-d3a1-4f9f-94d0-321706bc96b8')/items(${this.fileId})/Comments`,
          JSON.stringify({ text }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            transformRequest: [], // 👈 desativa qualquer transformação do axios
          }
        )

        const created = data?.d ?? data
        const idx = this.comments.findIndex(c => c.id === optimisticComment.id)
        if (idx !== -1) this.comments.splice(idx, 1, created)

      } catch (err) {
        console.error('Erro ao enviar comentário:', err)
        this.comments = this.comments.filter(c => c.id !== optimisticComment.id)
        this.newComment = text
      } finally {
        this.sending = false
      }
    },
    // ─── Helpers ──────────────────────────────────────────────────────────

    initials(name = '') {
      return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('')
    },

    formatDate(iso) {
      if (!iso) return ''

      const date = new Date(iso)
      const now = new Date()
      const diff = Math.floor((now - date) / 1000)

      if (diff < 60) return 'agora'
      if (diff < 3600) return `${Math.floor(diff / 60)}min`
      if (diff < 86400) return `${Math.floor(diff / 3600)}h`

      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    },
  },

  mounted() {
    this.fetchUserProfile()
  },

}
</script>
