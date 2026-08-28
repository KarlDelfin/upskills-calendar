import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Calendar',
      component: () => import('../views/CalendarView.vue'),
      meta: { title: 'Calendar' }
    },
  ],
})

router.beforeEach((to, from, next) => {
  const companyName = 'COMPANY NAME'

  if (to.name === 'Home') {
    document.title = companyName
  } else {
    const baseTitle = to.meta.title || companyName
    document.title = `${baseTitle} | ${companyName}`
  }
  next()
  
})

export default router
