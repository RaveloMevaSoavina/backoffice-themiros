import { useQuery } from "@tanstack/react-query"
import { ExternalLink, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog"
import { WorkspaceMembers } from "@/features/projects/components/workspace-members"
import {
  deleteWorkspace,
  getWorkspace,
} from "@/features/projects/services/project-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import {
  formatDate,
  formatDateTime,
  formatInteger,
  formatPreciseEur,
} from "@/shared/lib/format"
import {
  frameworkStatusLabels,
  labelOf,
  workspaceKindLabels,
  workspaceStageLabels,
} from "@/shared/lib/labels"
import { Button } from "@/shared/ui/base/button"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { PageHeader } from "@/shared/ui/page-header"
import { QueryState } from "@/shared/ui/query-state"
import { StatCard } from "@/shared/ui/stat-card"

const dashboardUrl = (import.meta.env.VITE_DASHBOARD_URL ?? "").replace(
  /\/$/,
  ""
)

export function ProjectDetailScreen() {
  const { workspaceId = "" } = useParams()
  const navigate = useNavigate()
  const workspace = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspace(workspaceId),
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const deletion = useAdminMutation({
    mutationFn: deleteWorkspace,
    success: "Espace supprimé",
    onSuccess: () => {
      void navigate("/projects", { replace: true })
    },
  })
  const data = workspace.data

  return (
    <QueryState error={workspace.error} isLoading={workspace.isLoading}>
      {data ? (
        <>
          <PageHeader
            actions={
              <>
                {dashboardUrl ? (
                  <Button asChild variant="outline">
                    <a
                      href={`${dashboardUrl}/workspaces/${data.id}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink />
                      Dashboard
                    </a>
                  </Button>
                ) : null}
                <Button
                  onClick={() => {
                    setIsEditing(true)
                  }}
                  variant="outline"
                >
                  <Pencil />
                  Modifier
                </Button>
                <Button
                  onClick={() => {
                    setIsDeleting(true)
                  }}
                  variant="destructive"
                >
                  <Trash2 />
                  Supprimer
                </Button>
              </>
            }
            description={[
              workspaceKindLabels[data.kind],
              data.targetCountry,
              labelOf(workspaceStageLabels, data.declaredStage),
              data.startYear && data.endYear
                ? `${data.startYear}–${data.endYear}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
            eyebrow={
              <Link
                className="hover:underline"
                to={`/organizations/${data.organizationId}`}
              >
                {data.organizationName}
              </Link>
            }
            title={data.name}
          />

          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              hint={`Créé le ${formatDate(data.createdAt)}${data.createdByName ? ` par ${data.createdByName}` : ""}`}
              label="Cadre"
              value={labelOf(frameworkStatusLabels, data.frameworkStatus)}
            />
            <StatCard
              label="Documents"
              value={formatInteger(data.documentCount)}
            />
            <StatCard
              hint={
                data.lastRunAt
                  ? `Dernier le ${formatDateTime(data.lastRunAt)}`
                  : "Aucun run lancé"
              }
              label="Runs d'analyse"
              value={formatInteger(data.runCount)}
            />
            <StatCard
              hint="Tokens facturés par OpenAI"
              label="Coût IA"
              value={formatPreciseEur(data.aiCostEur)}
            />
          </div>

          <section>
            <h2 className="mb-3 text-base font-semibold">Membres</h2>
            <WorkspaceMembers workspace={data} />
          </section>

          <ProjectFormDialog
            onOpenChange={setIsEditing}
            open={isEditing}
            workspace={data}
          />
          <ConfirmDialog
            confirmLabel="Supprimer définitivement"
            description={`« ${data.name} » sera supprimé avec ses ${data.documentCount} documents, ses runs et leurs résultats. Cette action est irréversible.`}
            destructive
            isPending={deletion.isPending}
            onConfirm={() => {
              deletion.mutate(data.id)
            }}
            onOpenChange={setIsDeleting}
            open={isDeleting}
            title="Supprimer l'espace"
          />
        </>
      ) : null}
    </QueryState>
  )
}
