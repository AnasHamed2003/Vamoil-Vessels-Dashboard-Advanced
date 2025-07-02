"use client"

import React from "react"
import { cn } from "../../lib/utils"

const ChartContainer = React.forwardRef(({ className, children, config, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {children}
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = ({ active, payload, label, labelFormatter, formatter }) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="font-medium">{labelFormatter ? labelFormatter(label) : label}</div>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm">
              {entry.name}: {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ChartTooltipContent = ChartTooltip

export { ChartContainer, ChartTooltip, ChartTooltipContent }
