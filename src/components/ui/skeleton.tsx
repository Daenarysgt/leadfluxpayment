import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md", className)}
      style={{ opacity: 0 }}
      {...props}
    />
  )
}

export { Skeleton }
