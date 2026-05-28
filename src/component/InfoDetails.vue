<template>
    <v-bottom-sheet v-model="isOpen" :scrim="true" max-height="75vh">
        <v-sheet class="py-1" style="background-color: ;">
            <v-row class="d-flex justify-center align-center">
                <v-col cols="1">
                    <v-btn class="elevation-0">
                        <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="10" class="d-flex justify-center ga-1" style="color: #3D5612;">
                    <v-icon>mdi-information</v-icon>
                    <span class="font-weight-semibold">Informações</span>
                </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row class="pt-4 pa-2" style="background-color: #edebeb;">
                <v-col cols="12" class="border pa-4 elevation-0 rounded-lg" style="background-color: #fff;">
                    <v-card class="elevation-0">
                        <div class="px-3 d-flex align-center ga-3">
                            <v-icon size="30px" class="pa-5 rounded-md"
                                style="background-color: #E4F4C7; color: #3D5612;">mdi-file</v-icon>
                            <div class="d-flex flex-column">
                                <span class="font-weight-semibold">
                                    {{ file?.Name || '-' }}
                                </span>
                                <div class="d-flex ga-2">
                                    <span>{{ fileNormalizedType }}</span>
                                    <span>{{ fileExt.toUpperCase() }}</span>
                                </div>
                            </div>
                        </div>
                        <v-divider class="my-2"></v-divider>
                        <v-card-title class="font-weight-bold pb-4 d-flex flex-column pb-5" style="color: #517318;">
                            <span>Detalhes </span>
                            <span style="line-height: 0px;">__</span>
                        </v-card-title>
                        <v-card-text class="d-flex flex-row">
                            <v-row class="d-flex flex-row border rounded-lg pa-3" dense>
                                <v-col v-for="(item, index) in fileDetails" :key="index" cols="12"
                                    class="d-flex flex-column ga-4 pt-1" :class="item.class || ''">
                                    <v-row class="d-flex align-center" density="compact">
                                        <v-col cols="4">
                                            <div class="d-flex ga-2 align-center">
                                                <v-icon class="pa-3 d-flex align-center justify-center"
                                                    style="background-color: #EAF7D5; border-radius: 100%;">{{ item.icon
                                                    }}</v-icon>
                                                <span>{{ item.label }}</span>
                                            </div>
                                        </v-col>
                                        <v-divider class="mr-2" inset vertical></v-divider>
                                        <v-col cols="7">
                                            <span class="font-weight-semibold">
                                                {{ item.value }}
                                            </span>
                                        </v-col>
                                        <v-divider class="pa-0 ma-0"></v-divider>
                                    </v-row>
                                </v-col>

                            </v-row>
                        </v-card-text>
                    </v-card>
                    <div class="d-flex flex-row ga-2 pa-3 border rounded-md"
                        style="background-color: #F8FCF1; border-radius: 8px;">
                        <v-icon class="pa-3 d-flex align-center justify-center"
                            style="color: #3D5612; background-color: #EAF7D5; border-radius: 100%;">mdi-security</v-icon>
                        <div class="d-flex flex-column ga-2">
                            <span class="font-weight-bold" style="color: #3D5612;">Informação do arquivo</span>
                            <span>Esses detalhes foram obtidos do arquivo armazenado no Microsoft SharePoint da Marcos
                                Maluf</span>
                        </div>
                    </div>

                    <!-- Ultima v-row -->
                    <v-row class="pa-0 ma-0 mx-n4 mb-n4 d-flex justify-center align-center py-5 px-3"> 
                        <v-col cols="4"
                            class="d-flex flex-row align-start ga-2">
                            <v-icon class="pa-3 d-flex align-center justify-center"
                                style="color: #3D5612; background-color: #EAF7D5; border-radius: 100%;">mdi-calendar-range</v-icon>
                            <div class="d-flex flex-column">
                                <span class="text-title-small" style="color: #3D5612;">Últ. modif.</span>
                                <span class="font-weight-semibold" style="font-size: 0.7rem;">{{ formatDate(file?.TimeLastModified) }}</span>
                            </div>
                        </v-col>

                        <v-col cols="4" class="d-flex flex-row align-start ga-2">
                            <v-icon class="pa-3 d-flex align-center justify-center"
                                style="color: #3D5612; background-color: #EAF7D5; border-radius: 100%;">mdi-account-outline</v-icon>
                            <div class="d-flex flex-column">
                                <span class="text-title-small">Modif. por</span>
                                <span class="font-weight-semibold" style="font-size: 0.7rem;">{{ abbreviateName(file.ModifiedBy.Title) }}</span>
                            </div>
                        </v-col>
                        <v-col cols="4" class="d-flex flex-row align-start ga-2">
                            <v-icon class="pa-3 d-flex align-center justify-center"
                                style="color: #3D5612; background-color: #EAF7D5; border-radius: 100%;">mdi-folder-outline</v-icon>
                            <div class="d-flex flex-column">
                                <span class="text-title-small">Local</span>
                                <span class="font-weight-semibold" style="font-size: 0.7rem;">Servidor Geração Bancária</span>
                            </div>
                        </v-col>
                    </v-row>
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
        fileDetails() {
            return [
                {
                    label: 'Nome',
                    icon: 'mdi-tag-text-outline',
                    value: this.file?.Name || '__',
                },
                {
                    label: 'Tipo',
                    icon: 'mdi-file-document-outline',
                    value: this.fileNormalizedType,
                },
                {
                    label: 'Formato',
                    icon: 'mdi-file-jpg-box',
                    value: this.fileExt?.toUpperCase() || '__',
                },
                {
                    label: 'Dimensões',
                    icon: 'mdi-pencil-ruler-outline',
                    value: this.fileDimensions || '__',
                },
                {
                    label: 'Tamanho',
                    icon: 'mdi-arrow-expand-all',
                    value: this.fileSize || '__',
                },
                {
                    label: 'Caminho',
                    icon: 'mdi-folder-arrow-right-outline',
                    value: this.file?.ServerRelativeUrl || '__'
                },
            ];
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

        abbreviateName(fullName) {
            const parts = fullName.trim().split(' ')
            if (parts.length === 1) return parts[0]
            return `${parts[0]} ${parts[1][0].toUpperCase()}.`
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
        // console.log('InfoDetails mounted with file:', this.file.ServerRelativeUrl)
    },
}
</script>

<style scoped>
::v-deep(.icon-tag::before) {
    line-height: 1;
    margin: 0;
    display: block;
}
</style>