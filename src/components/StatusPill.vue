<template>
  <Tag :severity="severity" rounded>{{ label }}</Tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'

const props = defineProps<{
  label: string
  status: 'disconnected' | 'connecting' | 'connected'
}>()

const severity = computed(() => {
  if (props.status === 'connected') {
    return 'success'
  }

  if (props.status === 'connecting') {
    return 'warn'
  }

  return 'danger'
})
</script>
