import { cn } from "@/lib/utils"

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white text-gray-900 shadow dark:bg-[#0b0f14] dark:text-gray-100 dark:border-gray-800",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        "text-xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

export function CardFooter({ className, ...props }) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
}

export default function DashboardCard() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>Overview of recent activity</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          You have 12 new orders pending.
        </p>
      </CardContent>
      <CardFooter>
        <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          View Details
        </button>
      </CardFooter>
    </Card>
  )
}
