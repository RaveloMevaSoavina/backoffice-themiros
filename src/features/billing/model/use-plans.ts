import { useQuery } from "@tanstack/react-query"

import { listPlans } from "@/features/billing/services/billing-service"

export function usePlans() {
  return useQuery({
    queryKey: ["billing", "plans"],
    queryFn: listPlans,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
