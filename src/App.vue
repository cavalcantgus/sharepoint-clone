<template>
  <v-app>
    <v-layout>

      <AppDrawer v-if="$route.name !== 'Login'"/>

      <v-main>
        <router-view />
      </v-main>

    </v-layout>
  </v-app>
</template>

<script>

import AppDrawer from './component/navigationDrawer.vue'
export default {
  name: 'App',
  components: {
    AppDrawer
  }
}
</script>