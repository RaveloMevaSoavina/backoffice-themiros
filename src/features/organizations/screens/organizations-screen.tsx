import { Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { subscriptionStatusLabels } from "@/features/billing/model/types"
import { OrganizationFormDialog } from "@/features/organizations/components/organization-form-dialog"
import { useOrganizations } from "@/features/organizations/model/use-organizations"
import { formatDate, formatInteger } from "@/shared/lib/format"
import { labelOf, organizationTypeLabels } from "@/shared/lib/labels"
import { Badge } from "@/shared/ui/base/badge"
import { Button } from "@/shared/ui/base/button"
import { Input } from "@/shared/ui/base/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/base/table"
import { PageHeader } from "@/shared/ui/page-header"
import { EmptyRow, QueryState } from "@/shared/ui/query-state"

export function OrganizationsScreen() {
  const navigate = useNavigate()
  const organizations = useOrganizations()
  const [search, setSearch] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return (organizations.data ?? []).filter(
      (organization) =>
        !needle || organization.name.toLowerCase().includes(needle)
    )
  }, [organizations.data, search])

  return (
    <>
      <PageHeader
        actions={
          <Button
            onClick={() => {
              setIsCreating(true)
            }}
          >
            <Plus />
            Nouvelle organisation
          </Button>
        }
        description="Clients de la plateforme, leurs comptes, leurs espaces et leur abonnement."
        title="Organisations"
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Rechercher une organisation"
          className="pl-8"
          onChange={(event) => {
            setSearch(event.target.value)
          }}
          placeholder="Rechercher"
          value={search}
        />
      </div>

      <QueryState
        error={organizations.error}
        isLoading={organizations.isLoading}
      >
        {visible.length === 0 ? (
          <EmptyRow>Aucune organisation.</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Comptes</TableHead>
                <TableHead className="text-right">Espaces</TableHead>
                <TableHead className="text-right">Invitations</TableHead>
                <TableHead>Offre</TableHead>
                <TableHead>Échéance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((organization) => (
                <TableRow key={organization.id}>
                  <TableCell className="font-medium">
                    <Link
                      className="hover:underline"
                      to={`/organizations/${organization.id}`}
                    >
                      {organization.name}
                    </Link>
                    {organization.country ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {organization.country}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {labelOf(organizationTypeLabels, organization.type)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatInteger(organization.memberCount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatInteger(organization.workspaceCount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {organization.pendingInvitationCount > 0
                      ? `${organization.pendingInvitationCount} en attente`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {organization.subscription ? (
                      <span className="flex items-center gap-2">
                        {organization.subscription.planName}
                        {organization.subscription.status !== "active" ? (
                          <Badge variant="warning">
                            {
                              subscriptionStatusLabels[
                                organization.subscription.status
                              ]
                            }
                          </Badge>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Aucune</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(organization.subscription?.endsOn)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </QueryState>

      <OrganizationFormDialog
        onOpenChange={setIsCreating}
        onSaved={(id) => {
          void navigate(`/organizations/${id}`)
        }}
        open={isCreating}
      />
    </>
  )
}
