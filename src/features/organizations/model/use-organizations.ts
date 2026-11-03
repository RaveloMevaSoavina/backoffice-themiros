import { useQuery } from "@tanstack/react-query"

import { listOrganizations } from "@/features/organizations/services/organization-service"

/** Liste partagee : ecran Organisations et listes de choix des formulaires. */
export function useOrganizations() {
  return useQuery({ queryKey: ["organizations"], queryFn: listOrganizations })
}
