import type { AlertVariants } from '@/components/ui/alert'
import type { BadgeVariants } from '@/components/ui/badge'

type BadgeTone = 'success' | 'warn' | 'danger' | 'secondary' | 'contrast'
type AlertTone = 'success' | 'warn' | 'error' | 'secondary' | 'info'

export function resolveBadgeVariant(tone: BadgeTone): BadgeVariants['variant'] {
  if (tone === 'danger') {
    return 'destructive'
  }

  if (tone === 'contrast') {
    return 'outline'
  }

  if (tone === 'secondary' || tone === 'warn') {
    return 'secondary'
  }

  return 'default'
}

export function resolveBadgeToneClass(tone: BadgeTone): string {
  if (tone === 'success') {
    return 'border-[var(--border)] bg-[var(--success-tint)] text-[var(--success-soft)]'
  }

  if (tone === 'warn') {
    return 'border-[var(--border)] bg-[var(--warning-tint)] text-[var(--warning-soft)]'
  }

  if (tone === 'danger') {
    return 'border-[var(--border)] bg-[var(--danger-tint)] text-[var(--danger-soft)]'
  }

  if (tone === 'contrast') {
    return 'border-[var(--border)] bg-[var(--neutral-tint)] text-[#424245]'
  }

  return 'border-[var(--border)] bg-[var(--neutral-tint)] text-[#424245]'
}

export function resolveAlertVariant(tone: AlertTone): AlertVariants['variant'] {
  if (tone === 'error') {
    return 'destructive'
  }

  return 'default'
}

export function resolveAlertToneClass(tone: AlertTone): string {
  if (tone === 'success') {
    return 'border-[var(--border)] bg-[var(--success-tint)] text-[var(--success-soft)]'
  }

  if (tone === 'warn') {
    return 'border-[var(--border)] bg-[var(--warning-tint)] text-[var(--warning-soft)]'
  }

  if (tone === 'error') {
    return 'border-[var(--border)] bg-[var(--danger-tint)] text-[var(--danger-soft)]'
  }

  if (tone === 'secondary') {
    return 'border-[var(--border)] bg-[var(--neutral-tint)] text-[#424245]'
  }

  return 'border-[var(--border)] bg-[var(--info-tint)] text-[#007aff]'
}
