import { useToast } from 'vue-toastification'

export const toast = {
  success(message) {
    useToast().success(message)
  },

  error(message) {
    useToast().error(message)
  },

  warning(message) {
    useToast().warning(message)
  },

  info(message) {
    useToast().info(message)
  }
}
