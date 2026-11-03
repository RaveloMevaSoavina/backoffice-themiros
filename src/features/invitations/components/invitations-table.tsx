import { useQuery } from "@tanstack/react-query"
import { MoreHorizontal } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import {
  type Invitation,
  type InvitationStatus,
  invitationStatusLabels,
} from "@/features/invitations/model/types"
import {
  listInvitations,
  resendInvitation,
  revokeInvitation,
} from "@/features/invitations/services/invitation-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { formatDateTime } from "@/shared/lib/format"
import { profileRoleLabels, workspaceRoleLabels } from "@/shared/lib/labels"
import { Badge } from "@/shared/ui/base/badge"
import { Button } from "@/shared/ui/base/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/base/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/base/table"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { NativeSelect } from "@/shared/ui/native-select"
import { EmptyRow, QueryState } from "@/shared/ui/query-state"

const statusVariant = {
  pending: "warning",
  accepted: "secondary",
  revoked: "outline",
} as const

type InvitationsTableProps = {
  organizationId?: string
}

export function InvitationsTable({ organizationId }: InvitationsTableProps) {
  const invitations = useQuery({
    queryKey: ["invitations", organizationId ?? "all"],
    queryFn: () => listInvitations(organizationId),
  })
  const [status, setStatus] = useState<InvitationStatus | "all">("all")
  const [revoking, setRevoking] = useState<Invitation | null>(null)
  const resendMutation = useAdminMutation({
    mutationFn: resendInvitation,
    success: (result) =>
      result.delivery === "sent"
        ? "Invitation renvoyée"
        : "Le compte était déjà confirmé : il est rattaché",
  })
  const revokeMutation = useAdminMutation({
    mutationFn: revokeInvitation,
    success: "Invitation révoquée",
    onSuccess: () => {
      setRevoking(null)
    },
  })

  const visible = useMemo(
    () =>
      (invitations.data ?? []).filter(
        (invitation) => status === "all" || invitation.status === status
      ),
    [invitations.data, status]
  )

  return (
    <>
      <div className="mb-4 max-w-48">
        <NativeSelect
          aria-label="Filtrer par statut"
          onChange={(event) => {
            setStatus(event.target.value as InvitationStatus | "all")
          }}
          value={status}
        >
          <option value="all">Tous les statuts</option>
          {(Object.keys(invitationStatusLabels) as InvitationStatus[]).map(
            (value) => (
              <option key={value} value={value}>
                {invitationStatusLabels[value]}
              </option>
            )
          )}
        </NativeSelect>
      </div>

      <QueryState error={invitations.error} isLoading={invitations.isLoading}>
        {visible.length === 0 ? (
          <EmptyRow>Aucune invitation.</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invité</TableHead>
                {organizationId ? null : <TableHead>Organisation</TableHead>}
                <TableHead>Rôle</TableHead>
                <TableHead>Espaces</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernier envoi</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div className="font-medium">
                      {invitation.fullName ?? invitation.email}
                    </div>
                    {invitation.fullName ? (
                      <div className="text-xs text-muted-foreground">
                        {invitation.email}
                      </div>
                    ) : null}
                  </TableCell>
                  {organizationId ? null : (
                    <TableCell>
                      <Link
                        className="hover:underline"
                        to={`/organizations/${invitation.organizationId}`}
                      >
                        {invitation.organizationName}
                      </Link>
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {profileRoleLabels[invitation.role]}
                  </TableCell>
                  <TableCell className="max-w-56 text-muted-foreground">
                    {invitation.workspaces.length === 0 ? (
                      "—"
                    ) : (
                      <span
                        className="block truncate"
                        title={invitation.workspaces
                          .map((workspace) => workspace.name)
                          .join(", ")}
                      >
                        {invitation.workspaces.length} ·{" "}
                        {workspaceRoleLabels[invitation.workspaceRole]}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[invitation.status]}>
                      {invitationStatusLabels[invitation.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invitation.status === "accepted"
                      ? `Connecté le ${formatDateTime(invitation.acceptedAt)}`
                      : invitation.lastSentAt
                        ? `${formatDateTime(invitation.lastSentAt)}${invitation.sentCount > 1 ? ` (×${invitation.sentCount})` : ""}`
                        : "Rattaché sans e-mail"}
                  </TableCell>
                  <TableCell>
                    {invitation.status === "pending" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-label="Actions"
                            size="icon-sm"
                            variant="ghost"
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled={resendMutation.isPending}
                            onSelect={() => {
                              resendMutation.mutate(invitation.id)
                            }}
                          >
                            Renvoyer l'e-mail
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setRevoking(invitation)
                            }}
                            variant="destructive"
                          >
                            Révoquer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </QueryState>

      <ConfirmDialog
        confirmLabel="Révoquer"
        description={`Le lien envoyé à ${revoking?.email} ne donnera plus accès à ${revoking?.organizationName}. Le compte est retiré de l'organisation et de ses espaces.`}
        destructive
        isPending={revokeMutation.isPending}
        onConfirm={() => {
          if (revoking) revokeMutation.mutate(revoking.id)
        }}
        onOpenChange={(open) => {
          if (!open) setRevoking(null)
        }}
        open={revoking !== null}
        title="Révoquer l'invitation"
      />
    </>
  )
}
