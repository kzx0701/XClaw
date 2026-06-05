<template>
  <AlertDialog :open="confirmState.visible" @update:open="handleOpenChange">
    <AlertDialogContent
      v-if="activeConfirm"
      size="sm"
      class="max-w-[380px] gap-5 border-[rgba(255,255,255,0.06)] bg-[#2a2a3c] p-6 text-[#e0e0e0] shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
    >
      <AlertDialogHeader class="items-center gap-3 text-center">
        <AlertDialogMedia class="bg-[rgba(239,68,68,0.12)] text-[#e06060]">
          <component :is="activeConfirm.icon || Trash2" class="size-4" />
        </AlertDialogMedia>
        <AlertDialogTitle class="text-center text-[17px] font-semibold tracking-[-0.01em] text-[#e0e0e0]">
          {{ activeConfirm.header }}
        </AlertDialogTitle>
        <AlertDialogDescription class="max-w-[280px] text-center text-[13px] leading-6 text-[#8b8b9a]">
          {{ activeConfirm.message }}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div
        v-if="activeConfirm.detailValue || activeConfirm.detailCode"
        class="rounded-lg border border-[rgba(148,163,184,0.14)] bg-[#111827] px-4 py-3"
      >
        <p v-if="activeConfirm.detailLabel" class="mb-2 text-[11px] font-medium tracking-[0.08em] text-[#6b6b7a] uppercase">
          {{ activeConfirm.detailLabel }}
        </p>
        <p v-if="activeConfirm.detailValue" class="m-0 break-words text-[13px] font-semibold leading-6 text-[#e0e0e0]">
          {{ activeConfirm.detailValue }}
        </p>
        <code
          v-if="activeConfirm.detailCode"
          class="mt-1 block break-all text-[12px] leading-6 text-[#8b8b9a]"
        >
          {{ activeConfirm.detailCode }}
        </code>
      </div>

      <AlertDialogFooter class="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <AlertDialogCancel
          variant="secondary"
          class="mt-0 h-9 w-full border border-[rgba(255,255,255,0.08)] bg-[#32324a] px-3 text-sm text-[#c0c0d0] shadow-none hover:bg-[#3a3a54] hover:text-[#e0e0e0]"
        >
          {{ activeConfirm.rejectLabel }}
        </AlertDialogCancel>
        <AlertDialogAction
          :variant="activeConfirm.acceptClass === 'p-button-danger' ? 'destructive' : 'default'"
          class="h-9 w-full border border-transparent px-3 text-sm shadow-none"
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
