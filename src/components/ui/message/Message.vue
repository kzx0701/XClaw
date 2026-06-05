<template>
  <Alert :class="[toneClass, props.class]" :variant="variant">
    <slot />
  </Alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Alert from '@/components/ui/alert/Alert.vue'

const props = withDefaults(defineProps<{
  class?: string
  closable?: boolean
  severity?: 'success' | 'warn' | 'error' | 'secondary' | 'info'
}>(), {
  class: '',
  closable: false,
  severity: 'info',
})

const variant = computed(() => {
  if (props.severity === 'error') {
    return 'destructive'
  }

  return 'default'
})

const toneClass = computed(() => {
  if (props.severity === 'success') {
    return 'border-[#14532d] bg-[#0d2a1e] text-[#8ad48a]'
  }

  if (props.severity === 'warn') {
    return 'border-[#7c2d12] bg-[#2d1a0e] text-[#d4c48a]'
  }

  if (props.severity === 'error') {
    return 'border-[#7f1d1d] bg-[#2d1316] text-[#e06060]'
  }

  if (props.severity === 'secondary') {
    return 'border-[rgba(255,255,255,0.06)] bg-[#2a2a3c] text-[#8b8b9a]'
  }

  return 'border-[#1d4ed8] bg-[#121f3a] text-[#8ab4e0]'
})
</script>
