<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"]
  fluid?: boolean
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
    <input
    v-model="modelValue"
    data-slot="input"
    :class="cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-9 w-full min-w-0 rounded-lg border border-white/[0.08] bg-[#252538] px-3 py-1 text-base shadow-none transition-[color,box-shadow,background-color,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 md:text-sm',
      'focus-visible:border-primary/40 focus-visible:ring-primary/20 focus-visible:ring-[2px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      props.fluid ? 'w-full' : '',
      props.class,
    )"
  >
</template>
