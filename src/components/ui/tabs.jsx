"use client"

import React, { useState } from "react"
import { cn } from "../../lib/utils"

const TabsContext = React.createContext(null)

const Tabs = ({ defaultValue, value, onValueChange, children, ...props }) => {
  const [selectedTab, setSelectedTab] = useState(value || defaultValue)

  const handleValueChange = (newValue) => {
    setSelectedTab(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <TabsContext.Provider value={{ selectedTab, handleValueChange }}>
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { selectedTab, handleValueChange } = React.useContext(TabsContext)
  const isActive = selectedTab === value

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-[#2e1a47] text-white shadow-sm" : "",
        className,
      )}
      onClick={() => handleValueChange(value)}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { selectedTab } = React.useContext(TabsContext)
  const isActive = selectedTab === value

  if (!isActive) return null

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
