import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-sm border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-0",
  {
    variants: {
      variant: {
        default:
          "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)] hover:bg-[var(--text-secondary)]",
        destructive:
          "border-[var(--destructive)] bg-[var(--destructive)] text-[var(--surface)] hover:bg-[var(--danger-soft)] focus-visible:ring-destructive/20",
        outline:
          "border-[var(--card-border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-active)]",
        secondary:
          "border-[var(--card-border)] bg-[var(--surface-hover)] text-[var(--text-primary)] hover:bg-[var(--surface-active)]",
        ghost:
          "border-transparent text-[var(--text-secondary)] hover:border-[var(--card-border)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        "default": "h-9 px-5 py-1 has-[>svg]:px-4",
        "sm": "h-8 gap-1.5 px-4 has-[>svg]:px-3",
        "lg": "h-10 px-6 has-[>svg]:px-5",
        "icon": "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
