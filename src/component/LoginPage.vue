<template>
  <!-- Alterado bg-white para bg-black para unificar o tema dark -->
  <v-container fluid class="fill-height d-flex justify-center align-center bg-black">
    <v-row justify="center" class="w-100 d-flex justify-center align-center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-8 login-card d-flex flex-column ga-3" flat>

          <v-card-title class="text-center justify-center text-h5 font-weight-bold text-white pt-2">
            Bem-vindo de volta
          </v-card-title>

          <v-card-subtitle class="text-center text-grey-lighten-1 pb-4 mt-n3">
            <span class="">Não tem cadastro? Fale com seu administrador</span>
          </v-card-subtitle>

          <!-- Mensagem de erro - Mantido variant, ajustado o layout -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-2 text-caption"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>

          <!-- Formulário - Adicionado o modificador .prevent direto no botão se preferir, ou mantido no form -->
          <v-form class="d-flex flex-column ga-2" @submit.prevent="loginWithCredentials">
            <!-- color="#87d209" garante que o foco do input fique verde -->
            <v-text-field
              v-model="email"
              variant="solo-filled"
              density="comfortable"
              prepend-inner-icon="mdi-email-outline"
              label="Endereço de E-mail"
              type="email"
              color="#87d209"
              :disabled="loading"
              hide-details="auto"
            />

            <v-text-field
              v-model="password"
              variant="solo-filled"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              label="Senha"
              color="#87d209"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :disabled="loading"
              hide-details="auto"
            />

            <v-card-actions class="pa-0 mt-4">
              <v-btn
                type="submit"
                block
                size="large"
                variant="outlined"
                class="login-btn font-weight-bold text-none"
                :loading="loading && loginMethod === 'credentials'"
                :disabled="loading || !email || !password"
              >
                Entrar
              </v-btn>
            </v-card-actions>
          </v-form>

          <v-divider class="my-4" color="grey-lighten-1" opacity="0.2">
            <span class="text-grey-darken-1 text-caption px-2">Ou</span>
          </v-divider>

          <v-card-actions class="pa-0 justify-center">
            <v-btn
              block
              size="large"
              variant="outlined"
              class="microsoft-btn text-none text-body-2"
              :loading="loading && loginMethod === 'microsoft'"
              :disabled="loading"
              @click="loginWithMicrosoft"
            >
              <Icon icon="logos:microsoft-icon" size="18" class="mr-2">mdi-microsoft</Icon>
              Entrar com Microsoft
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../auth/authService';

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter();

    const email = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const loading = ref(false);
    const loginMethod = ref(''); // 'credentials' | 'microsoft'
    const errorMessage = ref('');

    const handleSuccess = (response) => {
      // window.dispatchEvent(new Event('msal:loginSuccess'));
      router.push('/site/mmmalufconsultoria.sharepoint.com,b64909bd-3f9b-4c8f-8f60-9aa4cf79e086,85441a70-d838-4bbb-b9dc-ebfbbfdd723a');
    };

    const loginWithCredentials = async () => {
      if (!email.value || !password.value) return;

      loading.value = true;
      loginMethod.value = 'credentials';
      errorMessage.value = '';

      try {
        const response = await authService.loginWithEmailPassword(
          email.value,
          password.value
        );

        if (response) {
          handleSuccess(response);
        } else {
          errorMessage.value = 'E-mail ou senha inválidos.';
        }
      } catch (err) {
        errorMessage.value = 'Erro ao fazer login. Tente novamente.';
        console.error(err);
      } finally {
        loading.value = false;
        loginMethod.value = '';
      }
    };

    const loginWithMicrosoft = async () => {
      loading.value = true;
      loginMethod.value = 'microsoft';
      errorMessage.value = '';

      try {
        const response = await authService.login();
        if (response) {
          handleSuccess(response);
        } else {
          errorMessage.value = 'Login com Microsoft cancelado ou falhou.';
        }
      } catch (err) {
        errorMessage.value = 'Erro ao autenticar com Microsoft.';
        console.error(err);
      } finally {
        loading.value = false;
        loginMethod.value = '';
      }
    };

    onMounted(() => {
      const account = authService.getAccount();
      console.log('Conta atual:', account);
      if (account) {
        router.push('/site/mmmalufconsultoria.sharepoint.com,b64909bd-3f9b-4c8f-8f60-9aa4cf79e086,85441a70-d838-4bbb-b9dc-ebfbbfdd723a');
      }
    });

    return {
      email,
      password,
      showPassword,
      loading,
      loginMethod,
      errorMessage,
      loginWithCredentials,
      loginWithMicrosoft,
    };
  }
};
</script>

<style scoped>
.login-card {
  border: 1px solid rgb(45, 45, 45) !important;
  border-radius: 12px;
  background: rgb(20, 20, 20) !important;
}

/* Customização dos inputs mantendo o variant solo-filled */
::v-deep(.v-field--variant-solo-filled) {
  background: rgb(10, 10, 10) !important;
  color: #fff !important;
  border: 1px solid rgb(40, 40, 40);
  transition: border-color 0.2s ease;
}

::v-deep(.v-field--variant-solo-filled.v-field--focused) {
  border-color: #87d209;
}

/* Estilização moderna do botão principal verde/preto */
.login-btn {
  border-color: #87d209 !important;
  color: #87d209 !important;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background-color: #87d209 !important;
  color: #000000 !important;
}

/* Estilização do botão da Microsoft para o tema dark */
.microsoft-btn {
  border-color: rgb(60, 60, 60) !important;
  color: rgb(230, 230, 230) !important;
  background-color: rgb(15, 15, 15) !important;
  transition: background-color 0.2s ease;
}

.microsoft-btn:hover {
  background-color: rgb(30, 30, 30) !important;
}
</style>
