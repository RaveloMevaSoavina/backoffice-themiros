import type { ReactNode } from "react"

type PageHeaderProps = {
  actions?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  title: string
}

export function PageHeader({
  actions,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <div className="text-xs text-muted-foreground">{eyebrow}</div>
        ) : null}
        <h1 className="truncate text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </header>
  )
}
