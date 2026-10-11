import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-md border-[1.5px] border-input bg-white px-3.5 py-3 text-base text-ink transition-colors outline-none hover:border-ash-700 focus-visible:border-ink placeholder:text-ash-500 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:bg-[#fff6f5]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
