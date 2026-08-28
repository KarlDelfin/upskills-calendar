<template>
  <div v-if="authStore.loading" class="flex h-screen w-full items-center justify-center bg-slate-50">
    <div class="flex flex-col items-center gap-3">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-sky-600"></div>
      <p class="text-sm text-slate-500 font-medium">Authenticating, please wait...</p>
    </div>
  </div>

  <Login v-else-if="!authStore.isAuthenticated" />

  <div v-else class="flex h-screen overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-y-auto">
      <el-header class="!flex bg-white border-b justify-end items-center px-6 h-16 shrink-0 !border-b !border-gray-300">
        <div class="flex items-center justify-between w-full py-2 px-4 bg-white border-b border-slate-200">
          <h1 class="text-lg font-bold text-slate-800 m-0">Hi, Welcome back!</h1>

          <div class="flex items-center gap-4">
            <div v-if="authStore.user" class="flex items-center gap-2.5">
              <img 
                class="!w-10 !h-10 !rounded-full !object-cover !border !border-slate-200 !shadow-sm" 
                :src="authStore.user.user_metadata?.avatar_url" 
                :alt="authStore.user.user_metadata?.name || 'User'"
              >
              <div class="flex flex-col">
                <span class="!text-sm !font-semibold !text-slate-700 !leading-tight">
                  {{ authStore.user.user_metadata?.name || 'User' }}
                </span>
                <span class="!text-xs !text-slate-400">
                  {{ authStore.user.email }}
                </span>
              </div>
            </div>

            <el-button 
              type="danger" 
              size="small" 
              plain 
              class="!rounded-md"
              @click="authStore.handleSignOut()"
            >
              Sign Out
            </el-button>
          </div>
        </div>
      </el-header>

      <main class="flex-1 p-6 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { supabase } from '@/utils/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import Sidebar from '@/components/Sidebar.vue'
import Login from '@/components/Login.vue'

export default {
  components: { Sidebar, Login },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  async mounted() {
    await this.authStore.initAuth()

    if(this.authStore.getUser) {
      if(this.$route.name === 'Admin') {
        this.$router.push('/admin/booking')
      }
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        this.authStore.setUser(null)
        this.authStore.loading = false
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await this.authStore.initAuth()
      }
    })
  }
}
</script>