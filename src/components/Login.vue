<template>
  <el-container class="h-screen flex justify-center items-center max-w-[400px] w-full mx-auto">
    <el-card class="w-[420px] p-5 rounded-xl text-center border-none w-full" shadow="always">
      <div class="flex flex-col gap-1 mb-2">
        <h2 class="text-[#136cb3] text-2xl font-extrabold tracking-wide uppercase m-0">
          <a href="/">Calendar</a>
        </h2>
        <p class="text-xs font-medium m-0">
          Admin Gateway
        </p>
      </div>
      
      <el-divider class="my-4" />
      
      <div class="mt-6">
        <el-button 
          type="primary" 
          size="large" 
          class="w-full font-semibold flex items-center justify-center gap-2.5 transition-all duration-200"
          color="#136cb3" 
          @click="authStore.handleGoogleLogin"
          :disabled="authStore.loading"
        >
          <img 
            src="https://authjs.dev/img/providers/google.svg" 
            alt="Google Logo" 
            class="w-[18px] aspect-square p-[1px] !mr-1" 
          />
          Continue with Google
        </el-button>
      </div>
    </el-card>
  </el-container>
</template>

<script lang="ts">
import { useAuthStore } from '@/stores/useAuthStore';

export default {
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
    };
  },
}
</script>