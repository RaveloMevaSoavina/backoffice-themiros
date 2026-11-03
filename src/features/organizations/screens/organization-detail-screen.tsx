import { useQuery } from "@tanstack/react-query"
import { FilePlus, FolderPlus, MailPlus, Pencil, Trash2 } from "lucide-react"
import { type ReactNode, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { InvoiceDialog } from "@/features/billing/components/invoice-dialog"
import { InvoicesTable } from "@/features/billing/components/invoices-table"
import { SubscriptionDialog } from "@/features/billing/components/subscription-dialog"
import {
  EvaluationUsage,
  SubscriptionsTable,
} from "@/features/billing/components/subscriptions-table"
import { subscriptionStatusLabels } from "@/features/billing/model/types"
import { InvitationsTable } from "@/features/invitations/components/invitations-table"
import { InviteDialog } from "@/features/invitations/components/invite-dialog"
import { OrganizationFormDialog } from "@/features/organizations/components/organization-form-dialog"
import {
  deleteOrganization,
  getOrganization,
} from "@/features/organizations/services/organization-service"
import { ProfilesTable } from "@/features/profiles/components/profiles-table"
import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog"
import { ProjectsTable } from "@/features/projects/components/projects-table"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { formatDate, formatEur, formatPreciseEur } from "@/shared/lib/format"
import { labelOf, organizationTypeLabels } from "@/shared/lib/labels"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/base/button"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { PageHeader } from "@/shared/ui/page-header"
import { QueryState } from "@/shared/ui/query-state"
import { StatCard } from "@/shared/ui/stat-card"

const tabs = [
  { key: "members", label: "Comptes" },
  { key: "invitations", label: "Invitations" },
  { key: "projects", label: "Espaces" },
  { key: "billing", label: "Facturation" },
] as const
type TabKey = (typeof tabs)[number]["key"]

type Dialog =
  | "edit"
  | "delete"
  | "invite"
  | "project"
  | "subscription"
  | "invoice"
  | null

export function OrganizationDetailScreen() {
  const { organizationId = "" } = useParams()
  const navigate = useNavigate()
  const organization = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => getOrganization(organizationId),
  })
  const [tab, setTab] = useState<TabKey>("members")
  const [dialog, setDialog] = useState<Dialog>(null)
  const closeDialog = (open: boolean) => {
    if (!open) setDialog(null)
  }
  const deletion = useAdminMutation({
    mutationFn: deleteOrganization,
    success: "Organisation supprimée",
    onSuccess: () => {
      void navigate("/organizations", { replace: true })
    },
  })
  const data = organization.data
  const subscription = data?.subscription ?? null

  return (
    <QueryState error={organization.error} isLoading={organization.isLoading}>
      {data ? (
        <>
          <PageHeader
            actions={
              <>
                <Button
                  onClick={() => {
                    setDialog("invite")
                  }}
                >
                  <MailPlus />
                  Inviter
                </Button>
                <Button
                  onClick={() => {
                    setDialog("edit")
                  }}
                  variant="outline"
                >
                  <Pencil />
                  Modifier
                </Button>
                <Button
                  disabled={data.hasInvoices}
                  onClick={() => {
                    setDialog("delete")
                  }}
                  title={
                    data.hasInvoices
                      ? "Une organisation facturée ne se supprime pas"
                      : undefined
                  }
                  variant="destructive"
                >
                  <Trash2 />
                  Supprimer
                </Button>
              </>
            }
            description={[
              labelOf(organizationTypeLabels, data.type),
              data.country,
              `cliente depuis le ${formatDate(data.createdAt)}`,
            ]
              .filter((part) => part && part !== "—")
              .join(" · ")}
            eyebrow="Organisation"
            title={data.name}
          />

          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              hint={
                subscription
                  ? `${subscriptionStatusLabels[subscription.status]} jusqu'au ${formatDate(subscription.endsOn)}`
                  : "Aucun abonnement en cours"
              }
              label="Offre"
              value={subscription?.planName ?? "—"}
            />
            <StatCard
              label="Montant HT"
              value={subscription ? formatEur(subscription.priceEur) : "—"}
            />
            <StatCard
              label="Évaluations sur la période"
              value={
                subscription ? (
                  <div className="text-base font-normal">
                    <EvaluationUsage subscription={subscription} />
                  </div>
                ) : (
                  "—"
                )
              }
            />
            <StatCard
              hint={`Total : ${formatPreciseEur(data.aiCostEur)}`}
              label="Coût IA 30 jours"
              value={formatPreciseEur(data.aiCost30dEur)}
            />
          </div>

          <nav
            aria-label="Sections de l'organisation"
            className="mb-6 flex gap-1 overflow-x-auto border-b border-border"
          >
            {tabs.map((item) => (
              <button
                aria-current={tab === item.key ? "page" : undefined}
                className={cn(
                  "-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors",
                  tab === item.key
                    ? "border-foreground font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                key={item.key}
                onClick={() => {
                  setTab(item.key)
                }}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {tab === "members" ? (
            <ProfilesTable organizationId={data.id} />
          ) : null}
          {tab === "invitations" ? (
            <InvitationsTable organizationId={data.id} />
          ) : null}
          {tab === "projects" ? (
            <>
              <SectionActions>
                <Button
                  onClick={() => {
                    setDialog("project")
                  }}
                  variant="outline"
                >
                  <FolderPlus />
                  Nouvel espace
                </Button>
              </SectionActions>
              <ProjectsTable organizationId={data.id} />
            </>
          ) : null}
          {tab === "billing" ? (
            <div className="space-y-10">
              <section>
                <SectionActions title="Abonnements">
                  <Button
                    disabled={subscription !== null}
                    onClick={() => {
                      setDialog("subscription")
                    }}
                    title={
                      subscription
                        ? "Résiliez l'abonnement en cours avant d'en créer un autre"
                        : undefined
                    }
                    variant="outline"
                  >
                    Nouvel abonnement
                  </Button>
                </SectionActions>
                <SubscriptionsTable organizationId={data.id} />
              </section>
              <section>
                <SectionActions title="Factures">
                  <Button
                    onClick={() => {
                      setDialog("invoice")
                    }}
                    variant="outline"
                  >
                    <FilePlus />
                    Nouvelle facture
                  </Button>
                </SectionActions>
                <InvoicesTable organizationId={data.id} />
              </section>
              <section>
                <h2 className="mb-3 text-base font-semibold">
                  Coordonnées de facturation
                </h2>
                <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[12rem_1fr]">
                  <dt className="text-muted-foreground">E-mail</dt>
                  <dd>{data.billingEmail ?? "—"}</dd>
                  <dt className="text-muted-foreground">Adresse</dt>
                  <dd className="whitespace-pre-line">
                    {data.billingAddress ?? "—"}
                  </dd>
                  <dt className="text-muted-foreground">
                    N° de TVA / identifiant fiscal
                  </dt>
                  <dd>{data.vatNumber ?? "—"}</dd>
                  <dt className="text-muted-foreground">Notes internes</dt>
                  <dd className="whitespace-pre-line">{data.notes ?? "—"}</dd>
                </dl>
              </section>
            </div>
          ) : null}

          <OrganizationFormDialog
            onOpenChange={closeDialog}
            open={dialog === "edit"}
            organization={data}
          />
          <InviteDialog
            onOpenChange={closeDialog}
            open={dialog === "invite"}
            organizationId={data.id}
          />
          <ProjectFormDialog
            onOpenChange={closeDialog}
            onSaved={(id) => {
              void navigate(`/projects/${id}`)
            }}
            open={dialog === "project"}
            organizationId={data.id}
          />
          <SubscriptionDialog
            onOpenChange={closeDialog}
            open={dialog === "subscription"}
            organizationId={data.id}
          />
          <InvoiceDialog
            onOpenChange={closeDialog}
            open={dialog === "invoice"}
            organizationId={data.id}
          />
          <ConfirmDialog
            confirmLabel="Supprimer définitivement"
            description={`« ${data.name} » sera supprimée avec tous ses espaces, leurs documents et leurs résultats. Ses comptes restent, sans organisation. Cette action est irréversible.`}
            destructive
            isPending={deletion.isPending}
            onConfirm={() => {
              deletion.mutate(data.id)
            }}
            onOpenChange={closeDialog}
            open={dialog === "delete"}
            title="Supprimer l'organisation"
          />
        </>
      ) : null}
    </QueryState>
  )
}

function SectionActions({
  children,
  title,
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      {title ? <h2 className="text-base font-semibold">{title}</h2> : <span />}
      {children}
    </div>
  )
}
