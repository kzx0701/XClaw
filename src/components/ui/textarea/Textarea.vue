<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
  defaultValue?: string | number
  modelValue?: string | number
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
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :class="cn('placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-sm border border-[var(--border)] bg-[#f8f7f7] px-3 py-2 text-base text-[#201d1d] transition-[color,background-color,border-color] outline-none focus-visible:border-[#646262] focus-visible:bg-[#fdfcfc] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', props.class)"
  />
</template>
