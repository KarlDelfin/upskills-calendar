<template>
  <div v-if="$route.path !== '/'" class="sidebar-container">
    <div
      v-if="isMobile && !isCollapsed"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="isCollapsed = true"
    ></div>

    <el-aside
      :width="isCollapsed ? '64px' : '240px'"
      class="h-screen flex flex-col bg-[var(--priColor)] transition-all duration-300 relative z-50 overflow-hidden shadow-md"
      :class="{
        'fixed left-0 top-0': isMobile,
      }"
    >
      <div class="p-4 text-center border-b border-white/10 flex items-center justify-between min-h-[64px]">
        <h2 
          v-show="!isCollapsed" 
          class="text-[var(--thiColor)] m-0 text-sm md:text-base font-bold tracking-wider uppercase truncate px-2"
        >
          <a href="/" class="hover:text-[var(--secColor)] transition-colors">
            Company Name
          </a>
        </h2>

        <button
          @click="isCollapsed = !isCollapsed"
          class="text-[var(--thiColor)] hover:text-[var(--secColor)] p-2 rounded-md focus:outline-none transition-colors"
          :class="{ 'mx-auto': isCollapsed }"
          :title="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
        >
          <el-icon :size="20">
            <Expand v-if="isCollapsed" />
            <Fold v-else />
          </el-icon>
        </button>
      </div>

      <!-- SIDEBAR MENU -->
      <el-menu
        :default-active="$route.path"
        router
        background-color="var(--priColor)"
        text-color="var(--thiColor)"
        active-text-color="var(--secColor)"
        :collapse="isCollapsed"
        :collapse-transition="false"
        class="border-none flex-1 overflow-y-auto sidebar-menu"
      >
        <el-menu-item index="/">
          <el-icon><Notebook /></el-icon>
          <template #title>Home</template>
        </el-menu-item>

        <el-menu-item index="/about">
          <el-icon><Notebook /></el-icon>
          <template #title>About</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      isCollapsed: false,
      isMobile: false
    }
  },
  mounted() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      const width = window.innerWidth;
      this.isMobile = width < 768;

      if (width < 1024) {
        this.isCollapsed = true;
      } else {
        this.isCollapsed = false;
      }
    }
  }
}
</script>

<style scoped>
:deep(.el-menu--collapse) { width: 64px !important; }
:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) { font-size: 18px; }
:deep(.el-menu-item:hover) { background-color: rgba(255, 255, 255, 0.1) !important; color: var(--secColor) !important; }
:deep(.el-menu-item.is-active) { background-color: rgba(254, 184, 65, 0.15) !important; border-right: 4px solid var(--secColor); font-weight: 600; }
</style>