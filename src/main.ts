import './assets/css/tailwind.css'
import './assets/css/style.css'

import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import VCalendar from 'v-calendar'
import 'v-calendar/style.css'

import { useAuthStore } from './stores/useAuthStore'
import { supabase } from './utils/supabaseClient'

import 'tippy.js/dist/tippy.css'

async function initApp() {
  const app = createApp(App)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
  const pinia = createPinia()
  app.use(pinia)
 
  const authStore = useAuthStore(pinia)

  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    authStore.setUser(session)
  }

  supabase.auth.onAuthStateChange((event, session) => {
    const authStore = useAuthStore()
    
    if (session) {
      authStore.setUser(session)
      app.config.globalProperties.$userId = session.user.id
    } else {
      authStore.setUser(null)
      app.config.globalProperties.$userId = null
    }
  })

  app.use(router)
  app.use(ElementPlus)
  app.use(VCalendar, {})

  app.mount('#app')
}

initApp()