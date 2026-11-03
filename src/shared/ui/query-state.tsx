import type { ReactNode } from "react"

import { errorMessage } from "@/shared/lib/errors"
import { Skeleton } from "@/shared/ui/base/skeleton"

type QueryStateProps = {
  error: unknown
  isLoading: boolean
  children: ReactNode
}

/** Chargement et erreur d'une requete, communs a tous les ecrans. */
export function QueryState({ children, error, isLoading }: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-lg p-4 text-sm ring-1 ring-border">
        {errorMessage(error)}
      </p>
    )
  }

  return children
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg p-6 text-center text-sm text-muted-foreground ring-1 ring-border/60 ring-inset">
      {children}
    </p>
  )
}
