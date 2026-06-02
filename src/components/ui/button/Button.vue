<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :disabled="disabled || loading"
    :class="cn(buttonVariants({ variant: resolvedVariant, size: resolvedSize }), rounded ? 'rounded-full' : '', props.class)"
    v-bind="delegatedProps"
  >
    <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" />
    <component :is="icon" v-else-if="icon" class="h-4 w-4" />
    <slot>{{ label }}</slot>
  </Primitive>
</template>

<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { computed, useSlots } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { LoaderCircle } from 'lucide-vue-next'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

type Severity = 'primary' | 'secondary' | 'danger' | 'contrast'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  disabled?: boolean
  icon?: object | null
  label?: string
  loading?: boolean
  outlined?: boolean
  rounded?: boolean
  severity?: Severity
  text?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  class: '',
  disabled: false,
  icon: null,
  label: '',
  loading: false,
  outlined: false,
  rounded: false,
  severity: 'primary',
  size: undefined,
  text: false,
  variant: undefined,
})

const slots = useSlots()

const resolvedVariant = computed<ButtonVariants['variant']>(() => {
  if (props.variant) {
    return props.variant
  }

  if (props.text) {
    return 'ghost'
  }

  if (props.outlined) {
    return 'outline'
  }

  if (props.severity === 'danger') {
    return 'destructive'
  }

  if (props.severity === 'secondary' || props.severity === 'contrast') {
    return 'secondary'
  }

  return 'default'
})

const resolvedSize = computed<ButtonVariants['size']>(() => {
  if (props.size) {
    return props.size
  }

  if (props.rounded && !props.label && !slots.default) {
    return 'icon'
  }

  return 'default'
})

const delegatedProps = reactiveOmit(
  props,
  'class',
  'variant',
  'size',
  'disabled',
  'icon',
  'label',
  'loading',
  'outlined',
  'rounded',
  'severity',
  'text',
)
</script>
