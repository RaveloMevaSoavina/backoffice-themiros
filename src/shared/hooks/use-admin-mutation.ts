import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/shared/lib/errors"

type AdminMutationOptions<TVariables, TResult> = {
  mutationFn: (variables: TVariables) => Promise<TResult>
  /** Message de succes ; une fonction pour le composer avec le resultat. */
  success?: string | ((result: TResult) => string)
  onSuccess?: (result: TResult) => void
}

/**
 * Mutation du backoffice : toute ecriture peut changer un compteur affiche
 * ailleurs (membres d'une organisation, evaluations consommees, encours),
 * on invalide donc tout le cache plutot que de tenir la liste des cles
 * concernees. Les volumes du backoffice le permettent.
 */
export function useAdminMutation<TVariables = void, TResult = unknown>({
  mutationFn,
  success,
  onSuccess,
}: AdminMutationOptions<TVariables, TResult>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries()
      if (success) {
        toast.success(typeof success === "function" ? success(result) : success)
      }
      onSuccess?.(result)
    },
    onError: (error) => {
      toast.error(errorMessage(error))
    },
  })
}
