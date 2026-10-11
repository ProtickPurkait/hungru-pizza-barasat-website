import * as React from "react"
import { cn } from "@/lib/utils"
import { PlusIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-t border-ash-300 last:border-b", className)}
      {...props}
    />
  )
}

// Large editorial question rows. The plus turns into a cross when open.
function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex min-h-16 flex-1 items-start justify-between gap-6 py-5 text-left font-sans text-[1.08rem] leading-snug font-semibold tracking-normal text-ink [font-stretch:100%] transition-colors outline-none hover:text-maroon-600 disabled:pointer-events-none disabled:opacity-50 sm:text-[1.2rem]",
          className
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] border-current transition-[transform,background-color,color] duration-300 ease-out-expo group-data-[state=open]:rotate-45 group-data-[state=open]:border-maroon-500 group-data-[state=open]:bg-maroon-500 group-data-[state=open]:text-white"
        >
          <PlusIcon className="size-4" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-base data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("max-w-[62ch] pt-0 pr-14 pb-6", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
