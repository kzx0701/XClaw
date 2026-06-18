<template>
  <AlertDialog :open="confirmState.visible" @update:open="handleOpenChange">
    <AlertDialogContent
      v-if="activeConfirm"
      size="sm"
      class="max-w-[380px] gap-5 border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text-primary)] shadow-none"
    >
      <AlertDialogHeader class="items-center gap-3 text-center">
        <AlertDialogMedia class="bg-[var(--danger-tint)] text-[var(--danger-soft)]">
          <component :is="activeConfirm.icon || Trash2" class="size-4" />
        </AlertDialogMedia>
        <AlertDialogTitle class="text-center text-[16px] font-bold tracking-normal text-[var(--text-primary)]">
          {{ activeConfirm.header }}
        </AlertDialogTitle>
        <AlertDialogDescription
          v-if="activeConfirm.message"
          class="max-w-[280px] text-center text-[14px] leading-6 text-[var(--text-muted)]"
        >
          {{ activeConfirm.message }}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div
        v-if="activeConfirm.detailValue || activeConfirm.detailCode"
        class="rounded-sm border border-[var(--border)] bg-[var(--surface-hover)] px-4 py-3"
      >
        <p v-if="activeConfirm.detailLabel" class="mb-2 text-[11px] font-medium tracking-[0.08em] text-[var(--text-muted)] uppercase">
          {{ activeConfirm.detailLabel }}
        </p>
        <p v-if="activeConfirm.detailValue" class="m-0 break-words text-[14px] font-bold leading-6 text-[var(--text-primary)]">
          {{ activeConfirm.detailValue }}
        </p>
        <code
          v-if="activeConfirm.detailCode"
          class="mt-1 block break-all text-[14px] leading-6 text-[var(--text-secondary)]"
        >
          {{ activeConfirm.detailCode }}
        </code>
      </div>

      <AlertDialogFooter class="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <AlertDialogCancel
          variant="secondary"
          class="mt-0 h-9 w-full border border-[var(--border)] bg-[var(--surface-hover)] px-3 text-sm text-[var(--text-primary)] shadow-none hover:bg-[var(--surface-active)] hover:text-[var(--text-primary)]"
        >
          {{ activeConfirm.rejectLabel }}
        </AlertDialogCancel>
        <AlertDialogAction
          :variant="activeConfirm.acceptClass === 'p-button-danger' ? 'destructive' : 'default'"
          class="h-9 w-full border-0 px-3 text-sm shadow-none"
          @click="acceptConfirm"
        >
          {{ activeConfirm.acceptLabel }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { acceptConfirm, confirmState } from '@/services/ui/confirm'

const activeConfirm = computed(() => {
  if (!confirmState.current) {
    return null
  }

  return {
    ...confirmState.current,
    acceptLabel: confirmState.current.acceptLabel || '确认',
    header: confirmState.current.header || '请确认操作',
    rejectLabel: confirmState.current.rejectLabel || '取消',
  }
})

function handleOpenChange(open: boolean) {
  confirmState.visible = open
}
</script>
