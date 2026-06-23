import { createPinia } from 'pinia'
import { createApp } from 'vue'
import 'vue-sonner/style.css'

import App from './App.vue'
import router from './router'
import './styles/main.css'

function initTheme() {
  const STORAGE_KEY = 'claw-deploy:theme'
  let theme = 'system'

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'system' || saved === 'dark' || saved === 'light') {
      theme = saved
    }
  } catch {}

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    document.documentElement.classList.add('dark')
  }
}

// popup 窗口：在 Vue 挂载前立即透明化 html/body，让原生 vibrancy 透出
if (window.location.hash === '#/tray-popup') {
  document.documentElement.classList.add('tray-popup-window')
}

initTheme()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
