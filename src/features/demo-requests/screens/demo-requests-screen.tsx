import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { DemoRequestsTable } from "@/features/demo-requests/components/demo-requests-table"
import { listDemoRequests } from "@/features/demo-requests/services/demo-request-service"
import { PageHeader } from "@/shared/ui/page-header"
import { QueryState } from "@/shared/ui/query-state"
import { StatCard } from "@/shared/ui/stat-card"

const DAY_MS = 24 * 60 * 60 * 1000

export function DemoRequestsScreen() {
  const requests = useQuery({
    queryKey: ["demo-requests"],
    queryFn: listDemoRequests,
  })

  const stats = useMemo(() => {
    const list = requests.data
    if (!list) return null
    const since = Date.now() - 30 * DAY_MS
    const count = (predicate: (status: string) => boolean) =>
      list.filter((request) => predicate(request.status)).length
    return {
      fresh: count((status) => status === "new"),
      inProgress: count(
        (status) => status === "contacted" || status === "scheduled"
      ),
      completed: count((status) => status === "completed"),
      last30d: list.filter(
        (request) => new Date(request.createdAt).getTime() >= since
      ).length,
      total: list.length,
    }
  }, [requests.data])

  return (
    <>
      <PageHeader
        description="Demandes envoyées depuis le formulaire de la landing page."
        title="Demandes de démo"
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          hint="Personne ne les a encore prises"
          label="Nouvelles"
          value={stats?.fresh ?? "—"}
        />
        <StatCard
          hint="Contactées ou démo planifiée"
          label="En cours"
          value={stats?.inProgress ?? "—"}
        />
        <StatCard label="Démos réalisées" value={stats?.completed ?? "—"} />
        <StatCard
          hint={stats ? `${stats.total} au total` : undefined}
          label="Reçues sur 30 jours"
          value={stats?.last30d ?? "—"}
        />
      </div>

      <QueryState error={requests.error} isLoading={requests.isLoading}>
        <DemoRequestsTable requests={requests.data ?? []} />
      </QueryState>
    </>
  )
}
