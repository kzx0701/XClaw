<template>
  <RouterView />
  <ConfirmDialogHost />
  <ToastViewport />
  <DeploymentProgressWidget />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import ConfirmDialogHost from '@/components/ui/confirm/ConfirmDialogHost.vue'
import DeploymentProgressWidget from '@/components/DeploymentProgressWidget.vue'
import ToastViewport from '@/components/ui/toast/ToastViewport.vue'
</script>
