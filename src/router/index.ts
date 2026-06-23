import { createRouter, createWebHashHistory } from 'vue-router'

import WorkspaceView from '@/views/WorkspaceView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'workspace',
      component: WorkspaceView,
    },
    {
      path: '/tray-popup',
      name: 'tray-popup',
      component: () => import('@/views/TrayPopupView.vue'),
    },
  ],
})

export default router
