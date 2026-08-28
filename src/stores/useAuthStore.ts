import { defineStore } from 'pinia'
import { supabase } from '../utils/supabaseClient'
import { ElMessage } from 'element-plus'
import router from '../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    loading: false as boolean,
  }),

  getters: {
    getUser: (state) => state.user,
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    setUser(user: any) {
      this.user = user
    },

    async initAuth() {
      try {
        this.loading = true
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session?.user) {
          this.user = session.user
        } else {
          this.user = null
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error)
        this.user = null
      } finally {
        this.loading = false
      }
    },

    async handleSignOut() {
      try {
        this.loading = true

        await supabase.auth.signOut()

        this.user = null

        ElMessage.info('Logged out securely.')
        router.push('/')

      } catch (error: any) {
        ElMessage.error(error.message || 'Logout failed.')
      } finally {
        this.loading = false
      }
    },

    async handleGoogleLogin() {
        try {
            this.loading = true
            
            const REDIRECTION_URL = `${window.location.origin}/`

            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { 
                  redirectTo: REDIRECTION_URL 
              }
            })

            if (error) throw error
            
        } catch (error: any) {
            ElMessage.error(`OAuth Initialization failure: ${error.message || error}`)
        } finally {
          this.loading = false
        }
    },
  },
})