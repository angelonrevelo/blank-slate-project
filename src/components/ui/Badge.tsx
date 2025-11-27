import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        error: "bg-error/10 text-error border border-error/20",
        secondary: "bg-secondary/50 text-foreground border border-border",
        outline: "border border-border text-muted-foreground",
        // Patient stage variants
        new: "bg-blue-500/10 text-blue-700 border border-blue-500/20",
        file: "bg-slate-500/10 text-slate-700 border border-slate-500/20",
        va: "bg-purple-500/10 text-purple-700 border border-purple-500/20",
        opth: "bg-indigo-500/10 text-indigo-700 border border-indigo-500/20",
        bio: "bg-cyan-500/10 text-cyan-700 border border-cyan-500/20",
        for_surgery: "bg-orange-500/10 text-orange-700 border border-orange-500/20",
        postponed: "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20",
        clearance: "bg-pink-500/10 text-pink-700 border border-pink-500/20",
        to_refer: "bg-red-500/10 text-red-700 border border-red-500/20",
        graduated: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
        // Status variants
        checkup: "bg-blue-500/10 text-blue-700 border border-blue-500/20",
        surgery: "bg-purple-500/10 text-purple-700 border border-purple-500/20",
        revisit: "bg-orange-500/10 text-orange-700 border border-orange-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
