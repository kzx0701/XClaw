<template>
  <RouterView />
  <ConfirmDialogHost />
  <ToastViewport />
  <DeploymentProgressWidget v-if="!isTrayPopup" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'

import ConfirmDialogHost from '@/components/ui/confirm/ConfirmDialogHost.vue'
import DeploymentProgressWidget from '@/components/DeploymentProgressWidget.vue'
import ToastViewport from '@/components/ui/toast/ToastViewport.vue'

const route = useRoute()
const isTrayPopup = computed(() => route.name === 'tray-popup')
</script>
