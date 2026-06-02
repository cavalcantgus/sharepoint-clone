<template>
  <v-app>
    <template v-if="$route.name !== 'Login'">
      <!-- App Bar -->
      <v-app-bar v-if="isMobile" class="elevation-0 py-2" style="background-color: #67921E;">
        <v-app-bar-nav-icon @click="drawer = !drawer" style="color: #fff;" />
        <!-- ... resto do app bar -->
      </v-app-bar>

      <!-- Navigation Drawer -->
      <AppDrawer
        v-model="drawer"
        :temporary="isMobile"
        :permanent="!isMobile"
        width="280"
        class="pa-2"
      >
        <DrawerContent />
      </AppDrawer>
    </template>

  <v-main style="display: flex; flex-direction: column; overflow: hidden;">
  <router-view style="flex: 1; min-height: 0; display: flex; flex-direction: column;" />
</v-main>
  </v-app>
</template>
<script>
import AppDrawer from './component/navigationDrawer.vue'

export default {
  name: 'App',
  components: { AppDrawer }
}
</script>


<style>
.v-main {
  max-height: 100dvh !important;
  overflow: hidden !important;
}
</style>
