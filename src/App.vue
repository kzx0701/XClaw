<template>
  <ToastBridge />
  <RouterView />
  <Toast position="top-right" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { RouterView } from 'vue-router'

import { registerToast } from '@/services/ui/toast'

const ToastBridge = {
  name: 'ToastBridge',
  setup() {
    const toast = useToast()

    onMounted(() => {
      registerToast(toast)
    })

    return () => null
  },
}
</script>
