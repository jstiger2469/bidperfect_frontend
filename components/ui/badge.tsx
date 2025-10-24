import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-success-500 text-white shadow hover:bg-success-600",
        warning:
          "border-transparent bg-warning-500 text-white shadow hover:bg-warning-600",
        error:
          "border-transparent bg-error-500 text-white shadow hover:bg-error-600",
        glass:
          "border-glass-border bg-glass-white backdrop-blur-sm text-foreground shadow-soft",
        "glass-primary":
          "border-primary/30 bg-primary/10 backdrop-blur-sm text-primary shadow-soft",
        "glass-success":
          "border-success-300/30 bg-success-100/50 backdrop-blur-sm text-success-700 shadow-soft",
        "glass-warning":
          "border-warning-300/30 bg-warning-100/50 backdrop-blur-sm text-warning-700 shadow-soft",
        "glass-error":
          "border-error-300/30 bg-error-100/50 backdrop-blur-sm text-error-700 shadow-soft",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-2xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 