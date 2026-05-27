<template>
    <v-bottom-sheet v-model="isOpen" :scrim="true" max-height="75vh">
        <v-sheet class="py-1">
            <v-row class="d-flex justify-center align-center">
                <v-col cols="1">
                    <v-btn class="elevation-0">
                        <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="10" class="d-flex justify-center "> 
                    <span>Informações</span>
                </v-col>
            </v-row>
            <v-row class="">
                <v-col cols="12">
                    <v-card class="elevation-0">
                        <v-card-title>Detalhes</v-card-title>
                        <v-card-text class="d-flex flex-column">
                            <v-row class="d-flex flex-column">
                                <v-col>
                                    
                                </v-col>
                                <v-col cols="12" class=" text-start d-flex ga-10">
                                    <span>Tipo:</span>
                                    <span>{{ fileNormalizedType }}</span>
                                </v-col>
                                <v-col cols="12" class=" text-start d-flex ga-10">
                                    <span>Formato:</span>
                                    <span>{{ fileExt.toUpperCase() }}</span>
                                </v-col>
                                <v-col cols="12" class=" text-start d-flex ga-10">
                                    <span>Dimensões:</span>
                                    <span>{{ fileDimensions }}</span>
                                </v-col>
                                <v-col cols="12" class=" text-start d-flex ga-10">
                                    <span>Tamanho:</span>
                                    <span>{{ fileSize }}</span>
                                </v-col>
                            </v-row>
                            <!-- <span>Tipo: <span>{{ fileNormalizedType }}</span></span>
                            <span>Formato: <span>{{ fileExt.toUpperCase() }}</span> </span>
                            <span>Dimensões: </span>
                            <span>Tamanho: </span>
                            <span>Caminho: </span> -->
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-sheet>
    </v-bottom-sheet>
</template>

<script>
// import { authService } from '../auth/authService';

export default {
    name: 'CommentsSheet',

    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        file: {
            type: Object,
            required: false,
        },
        fileType: {
            type: String,
            required: false,
        },
        fileExt: {
            type: String,
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
    }),

    watch: {
        modelValue(val) {
            this.isOpen = val
            // if (val) this.fetchComments() // descomente quando a API estiver pronta
        },

        isOpen(val) {
            this.$emit('update:modelValue', val)
        },

        // file(val) {
        //     if (val) this.fetchComments()
        // },
    },

    computed: {
        fileNormalizedType() {
            if (this.fileType === 'image') return 'Imagem';
            if (this.fileType === 'video') return 'Vídeo';
            if (this.fileType === 'pdf') return 'PDF';
            if (this.fileType === 'text') return 'Texto';
            return 'Não suportado';
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
}
</script>