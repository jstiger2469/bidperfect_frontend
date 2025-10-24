import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          "hover:border-ring/20 focus:border-ring/50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 

// NumberInput with formatting (commas) while preserving numeric value
export const NumberInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { onValueChange?: (num: number | null) => void; formatOnBlur?: boolean }> = ({ onValueChange, value, onChange, formatOnBlur = true, ...props }) => {
  const [display, setDisplay] = React.useState<string>(typeof value === 'number' ? (value as number).toLocaleString() : (value as any) || '')

  React.useEffect(() => {
    if (typeof value === 'number') setDisplay((value as number).toLocaleString())
    else if (typeof value === 'string') setDisplay(value)
  }, [value])

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const numeric = raw.replace(/,/g, '').replace(/[^0-9.]/g, '')
    const num = numeric ? Number(numeric) : null
    // While typing, avoid heavy formatting; just reflect raw input
    setDisplay(raw)
    onValueChange?.(isNaN(Number(num)) ? null : num)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!formatOnBlur) return
    const numeric = display.replace(/,/g, '').replace(/[^0-9.]/g, '')
    const num = numeric ? Number(numeric) : null
    if (num != null && !isNaN(num)) setDisplay(num.toLocaleString())
  }

  return <input {...props} value={display} onChange={handle} onBlur={handleBlur} inputMode="decimal" className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", props.className)} />
}