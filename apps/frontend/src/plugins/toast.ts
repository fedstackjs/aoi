import Toast, { POSITION, type PluginOptions } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default Toast

export const toastOptions: PluginOptions = {
  position: POSITION.BOTTOM_RIGHT
}
