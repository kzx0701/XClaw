<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { NumberFieldInput } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <NumberFieldInput
    data-slot="input"
    :class="cn('flex h-9 w-full rounded-sm border border-[var(--border)] bg-[#f8f7f7] py-1 text-sm text-center transition-[color,background-color] placeholder:text-muted-foreground focus-visible:bg-[#fdfcfc] focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50', props.class)"
  />
</template>
