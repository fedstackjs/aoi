/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, onMounted } from 'vue'

declare global {
  interface Window {
    vaptcha: any
    vaptchaObj: any
  }
}

export const useVaptcha = ({ onPass }: { onPass?: (token: string) => void } = {}) => {
  const token = ref('')

  const loadV3Script = () => {
    return new Promise<void>((resolve) => {
      if (typeof window.vaptcha === 'function') {
        resolve()
      } else {
        const script = document.createElement('script')
        script.src = 'https://v.vaptcha.com/v3.js'
        script.async = true
        script.addEventListener('load', () => resolve())
        document.getElementsByTagName('head')[0].appendChild(script)
      }
    })
  }

  onMounted(() => {
    const config = {
      vid: import.meta.env.VAPTCHA_VID,
      mode: 'click',
      scene: 0,
      container: document.getElementById('vaptcha'),
      style: 'light',
      color: '#00BFFF',
      lang: 'auto',
      area: 'auto'
    }
    console.log(config)
    loadV3Script().then(() => {
      window.vaptcha(config).then((obj: any) => {
        window.vaptchaObj = obj
        obj.listen('pass', () => {
          token.value = obj.getToken()
          onPass?.(token.value)
        })
        obj.listen('close', () => {
          obj.reset()
        })
        obj.render()
      })
    })
  })

  const reset = () => {
    window.vaptchaObj.reset()
  }

  return {
    token,
    reset
  }
}
