import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * shadcn Button, restyled to the house language (CLAUDE.md §5 — the default
 * zinc theme is never shipped). The API is untouched so Phase 7's forms and
 * dialogs drop straight in.
 *
 * What changed and why:
 * - Montserrat, uppercase, 0.14em tracking. Buttons are the smallest place the
 *   letter-spacing aesthetic still reads; below that it just looks broken.
 * - 2px corners. Softly rounded buttons read as SaaS, not cinema.
 * - `default` is gold and should be rare — one per view. Most buttons on this
 *   site want `outline` or `ghost`.
 * - No `focus-visible:ring`. The gold focus outline is declared once globally
 *   in globals.css so every interactive element matches; a ring here would
 *   double it up. That only holds if this file doesn't also carry its own
 *   `outline-none` — Tailwind's `utilities` layer sits after `base`, so a
 *   bare `outline-none` here silently wins over the global rule and every
 *   button-styled element loses its focus indicator outright. Caught by
 *   tabbing to a real `<Button>` and reading its computed `outline-style`,
 *   which came back `none` before this was removed.
 * - `outline`/`link` text is `--gold-bright`, not `--gold` — CLAUDE.md §3:
 *   button label text is small, and `--gold` is reserved for large text.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-sm font-body text-[0.75rem] font-semibold tracking-[0.14em] whitespace-nowrap uppercase transition-all ease-cinema dur-fast disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-void hover:bg-gold-bright active:translate-y-px",
        outline:
          "border border-gold-dim/60 text-gold-bright bg-transparent hover:border-gold hover:bg-gold/8",
        secondary:
          "bg-surface-3 text-hi hover:bg-surface-3/70",
        ghost:
          "text-mid hover:text-hi hover:bg-surface-3/60",
        link: "text-gold-bright underline-offset-4 hover:text-gold-bright hover:underline",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/85",
      },
      size: {
        default: "h-10 px-6 has-[>svg]:px-5",
        sm: "h-8 gap-1.5 px-4 text-[0.6875rem] tracking-[0.12em] has-[>svg]:px-3",
        lg: "h-12 px-8 text-[0.8125rem] has-[>svg]:px-6",
        icon: "size-10 tracking-normal",
        "icon-sm": "size-8 tracking-normal",
        "icon-lg": "size-12 tracking-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
