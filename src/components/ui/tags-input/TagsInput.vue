<script setup lang="ts">
import type { TagsInputRootEmits, TagsInputRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { TagsInputRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<TagsInputRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<TagsInputRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <TagsInputRoot
    v-slot="slotProps" v-bind="forwarded" :class="cn(
      'flex flex-wrap gap-2 items-center rounded-sm border border-[var(--border)] bg-[#f8f7f7] px-2 py-1 text-sm shadow-none transition-colors outline-none',
      'focus-within:bg-[#fdfcfc] focus-within:ring-0',
      'aria-invalid:ring-0',
      props.class)"
  >
    <slot v-bind="slotProps" />
  </TagsInputRoot>
</template>
