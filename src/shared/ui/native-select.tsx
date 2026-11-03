import type * as React from "react"

import { cn } from "@/shared/lib/utils"

/**
 * Liste deroulante native, aux dimensions de `Input` : le backoffice n'a
 * pas besoin de recherche ni de rendu personnalise dans ses listes.
 */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-transparent [&>option]:bg-popover [&>option]:text-popover-foreground",
        className
      )}
      {...props}
    />
  )
}

export { NativeSelect }
