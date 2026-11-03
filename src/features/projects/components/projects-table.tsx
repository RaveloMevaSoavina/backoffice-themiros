import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { listWorkspaces } from "@/features/projects/services/project-service"
import {
  formatDate,
  formatInteger,
  formatPreciseEur,
} from "@/shared/lib/format"
import {
  frameworkStatusLabels,
  labelOf,
  type WorkspaceKind,
  workspaceKindLabels,
  workspaceKinds,
  workspaceStageLabels,
} from "@/shared/lib/labels"
import { Badge } from "@/shared/ui/base/badge"
import { Input } from "@/shared/ui/base/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/base/table"
import { NativeSelect } from "@/shared/ui/native-select"
import { EmptyRow, QueryState } from "@/shared/ui/query-state"

type ProjectsTableProps = {
  organizationId?: string
}

export function ProjectsTable({ organizationId }: ProjectsTableProps) {
  const workspaces = useQuery({
    queryKey: ["workspaces", organizationId ?? "all"],
    queryFn: () => listWorkspaces(organizationId),
  })
  const [search, setSearch] = useState("")
  const [kind, setKind] = useState<WorkspaceKind | "all">("all")

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return (workspaces.data ?? []).filter(
      (workspace) =>
        (kind === "all" || workspace.kind === kind) &&
        (!needle ||
          workspace.name.toLowerCase().includes(needle) ||
          workspace.organizationName.toLowerCase().includes(needle))
    )
  }, [workspaces.data, search, kind])

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Rechercher un espace"
            className="pl-8"
            onChange={(event) => {
              setSearch(event.target.value)
            }}
            placeholder={
              organizationId ? "Rechercher" : "Espace ou organisation"
            }
            value={search}
          />
        </div>
        <NativeSelect
          aria-label="Filtrer par nature"
          className="w-40"
          onChange={(event) => {
            setKind(event.target.value as WorkspaceKind | "all")
          }}
          value={kind}
        >
          <option value="all">Toutes natures</option>
          {workspaceKinds.map((value) => (
            <option key={value} value={value}>
              {workspaceKindLabels[value]}
            </option>
          ))}
        </NativeSelect>
      </div>

      <QueryState error={workspaces.error} isLoading={workspaces.isLoading}>
        {visible.length === 0 ? (
          <EmptyRow>Aucun espace.</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Espace</TableHead>
                {organizationId ? null : <TableHead>Organisation</TableHead>}
                <TableHead>Phase</TableHead>
                <TableHead>Cadre</TableHead>
                <TableHead className="text-right">Membres</TableHead>
                <TableHead className="text-right">Documents</TableHead>
                <TableHead className="text-right">Runs</TableHead>
                <TableHead className="text-right">Coût IA</TableHead>
                <TableHead>Créé le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell>
                    <Link
                      className="font-medium hover:underline"
                      to={`/projects/${workspace.id}`}
                    >
                      {workspace.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {workspaceKindLabels[workspace.kind]}
                      {workspace.targetCountry
                        ? ` · ${workspace.targetCountry}`
                        : ""}
                    </div>
                  </TableCell>
                  {organizationId ? null : (
                    <TableCell>
                      <Link
                        className="hover:underline"
                        to={`/organizations/${workspace.organizationId}`}
                      >
                        {workspace.organizationName}
                      </Link>
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {labelOf(workspaceStageLabels, workspace.declaredStage)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        workspace.frameworkStatus === "draft"
                          ? "warning"
                          : "outline"
                      }
                    >
                      {labelOf(
                        frameworkStatusLabels,
                        workspace.frameworkStatus
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatInteger(workspace.memberCount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatInteger(workspace.documentCount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatInteger(workspace.runCount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPreciseEur(workspace.aiCostEur)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(workspace.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </QueryState>
    </>
  )
}
