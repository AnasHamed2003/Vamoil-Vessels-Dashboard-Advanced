import React from "react"
import { cn } from "../../lib/utils"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return <div className={cn("grid gap-2", className)} {...props} ref={ref} />
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, id, ...props }, ref) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={id}
        ref={ref}
        className={cn(
          "h-4 w-4 rounded-full border border-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary",
          className,
        )}
        {...props}
      />
    </div>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
