import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/CalendarView.vue'),
      meta: { title: 'Calendar' }
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'Home' }
    },
  ],
})

router.beforeEach((to, from) => {
  const companyName = 'COMPANY NAME'

  if (to.name === 'Home') {
    document.title = companyName
  } else {
    const baseTitle = to.meta.title || companyName
    document.title = `${baseTitle} | ${companyName}`
  }
})

export default router
