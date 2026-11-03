import type { ReactNode } from "react"

type StatCardProps = {
  hint?: ReactNode
  label: string
  value: ReactNode
}

export function StatCard({ hint, label, value }: StatCardProps) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-border/60">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  )
}
