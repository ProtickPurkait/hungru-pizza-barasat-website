import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

// Pill buttons, like a dough ball pressed flat. Sizes are tuned for touch: every size is at least 44px tall.
// A pressed button sinks by a pixel, like a real switch.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full text-base font-semibold whitespace-nowrap transition-[background-color,color,border-color,transform] duration-200 outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-maroon-600",
        whatsapp: "bg-whatsapp text-ink hover:bg-whatsapp-600",
        dark: "bg-ink text-white hover:bg-ash-800",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border-[1.5px] border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
        "outline-light": "border-[1.5px] border-white/60 bg-transparent text-white hover:border-white hover:bg-white hover:text-ink",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/85",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-ink underline underline-offset-4 decoration-maroon-500 decoration-2 hover:decoration-ink",
      },
      size: {
        default: "h-12 px-5 has-[>svg]:px-4",
        sm: "h-11 px-4 text-sm has-[>svg]:px-3.5",
        lg: "h-14 px-7 text-[1.05rem] has-[>svg]:px-6",
        icon: "size-12",
        "icon-sm": "size-11",
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
