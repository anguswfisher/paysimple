import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  className?: string
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
  open?: boolean
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
  onSelect?: (value: string) => void
}

interface SelectValueProps {
  placeholder?: string
  value?: string
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {}
})

const Select: React.FC<SelectProps> = ({ value, onValueChange, children, placeholder, className }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className={cn("relative", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext)
    
    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue: React.FC<SelectValueProps> = ({ placeholder, value }) => {
  const { value: contextValue } = React.useContext(SelectContext)
  const displayValue = value || contextValue
  
  return (
    <span className={cn(!displayValue && "text-muted-foreground")}>
      {displayValue || placeholder}
    </span>
  )
}

const SelectContent: React.FC<SelectContentProps> = ({ children, className, open }) => {
  const { open: contextOpen } = React.useContext(SelectContext)
  
  if (!contextOpen && !open) return null
  
  return (
    <div className={cn(
      "absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      className
    )}>
      {children}
    </div>
  )
}

const SelectItem: React.FC<SelectItemProps> = ({ value, children, className, onSelect }) => {
  const { value: contextValue, onValueChange, setOpen } = React.useContext(SelectContext)
  const isSelected = value === contextValue
  
  const handleClick = () => {
    onValueChange?.(value)
    onSelect?.(value)
    setOpen(false)
  }
  
  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent/50",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={handleClick}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {children}
    </div>
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
