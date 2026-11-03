import type { ReactNode } from "react"

import { cn } from "@/shared/lib/utils"
import { Label } from "@/shared/ui/base/label"

type FieldProps = {
  children: ReactNode
  className?: string
  hint?: string
  htmlFor: string
  label: string
}

/** Libelle, controle et aide sous le controle. */
export function Field({
  children,
  className,
  hint,
  htmlFor,
  label,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground" htmlFor={htmlFor}>
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
