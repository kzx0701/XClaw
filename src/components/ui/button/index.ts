import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-sm border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-0",
  {
    variants: {
      variant: {
        default:
          "border-[#201d1d] bg-[#201d1d] text-[#fdfcfc] hover:bg-[#0f0000]",
        destructive:
          "border-[#ff3b30] bg-[#ff3b30] text-[#fdfcfc] hover:bg-[#d70015] focus-visible:ring-destructive/20",
        outline:
          "border-[var(--border)] bg-[#fdfcfc] text-[#201d1d] hover:bg-[#f1eeee]",
        secondary:
          "border-[var(--border)] bg-[#f8f7f7] text-[#201d1d] hover:bg-[#f1eeee]",
        ghost:
          "border-transparent text-[#424245] hover:border-[var(--border)] hover:bg-[#f8f7f7] hover:text-[#201d1d]",
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
