import { useQuery } from "@tanstack/react-query"
import { UserPlus, X } from "lucide-react"
import { useState } from "react"

import { profileDisplayName } from "@/features/profiles/model/types"
import { listProfiles } from "@/features/profiles/services/profile-service"
import type { WorkspaceDetails } from "@/features/projects/model/types"
import {
  removeWorkspaceMember,
  setWorkspaceMember,
} from "@/features/projects/services/project-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { formatDate } from "@/shared/lib/format"
import {
  type WorkspaceRole,
  workspaceRoleLabels,
  workspaceRoles,
} from "@/shared/lib/labels"
import { Button } from "@/shared/ui/base/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/base/table"
import { NativeSelect } from "@/shared/ui/native-select"
import { EmptyRow } from "@/shared/ui/query-state"

/**
 * Membres d'un espace. Seuls les comptes de l'organisation de l'espace
 * peuvent y entrer ; le dernier administrateur ne se retire pas (la base
 * le refuse aussi).
 */
export function WorkspaceMembers({
  workspace,
}: {
  workspace: WorkspaceDetails
}) {
  const organizationProfiles = useQuery({
    queryKey: ["profiles", workspace.organizationId],
    queryFn: () => listProfiles(workspace.organizationId),
  })
  const [newMemberId, setNewMemberId] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<WorkspaceRole>("member")
  const setMember = useAdminMutation({
    mutationFn: setWorkspaceMember,
    success: "Membres mis à jour",
    onSuccess: () => {
      setNewMemberId("")
    },
  })
  const removeMember = useAdminMutation({
    mutationFn: removeWorkspaceMember,
    success: "Membre retiré",
  })

  const memberIds = new Set(workspace.members.map((member) => member.profileId))
  const candidates = (organizationProfiles.data ?? []).filter(
    (profile) => !memberIds.has(profile.id)
  )

  return (
    <div className="space-y-4">
      {workspace.members.length === 0 ? (
        <EmptyRow>Aucun membre.</EmptyRow>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Compte</TableHead>
              <TableHead className="w-44">Rôle</TableHead>
              <TableHead>Ajouté le</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {workspace.members.map((member) => (
              <TableRow key={member.profileId}>
                <TableCell>
                  <div className="font-medium">
                    {profileDisplayName(member)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {member.email}
                  </div>
                </TableCell>
                <TableCell>
                  <NativeSelect
                    aria-label={`Rôle de ${member.email}`}
                    disabled={setMember.isPending}
                    onChange={(event) => {
                      setMember.mutate({
                        workspaceId: workspace.id,
                        profileId: member.profileId,
                        role: event.target.value as WorkspaceRole,
                      })
                    }}
                    value={member.role}
                  >
                    {workspaceRoles.map((role) => (
                      <option key={role} value={role}>
                        {workspaceRoleLabels[role]}
                      </option>
                    ))}
                  </NativeSelect>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(member.addedAt)}
                </TableCell>
                <TableCell>
                  <Button
                    aria-label={`Retirer ${member.email}`}
                    disabled={removeMember.isPending}
                    onClick={() => {
                      removeMember.mutate({
                        workspaceId: workspace.id,
                        profileId: member.profileId,
                      })
                    }}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <X />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault()
          setMember.mutate({
            workspaceId: workspace.id,
            profileId: newMemberId,
            role: newMemberRole,
          })
        }}
      >
        <NativeSelect
          aria-label="Compte à ajouter"
          className="sm:max-w-xs"
          onChange={(event) => {
            setNewMemberId(event.target.value)
          }}
          required
          value={newMemberId}
        >
          <option value="">
            {candidates.length === 0
              ? "Tous les comptes de l'organisation sont membres"
              : "Ajouter un compte de l'organisation"}
          </option>
          {candidates.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profileDisplayName(profile)}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Rôle du nouveau membre"
          className="sm:w-40"
          onChange={(event) => {
            setNewMemberRole(event.target.value as WorkspaceRole)
          }}
          value={newMemberRole}
        >
          {workspaceRoles.map((role) => (
            <option key={role} value={role}>
              {workspaceRoleLabels[role]}
            </option>
          ))}
        </NativeSelect>
        <Button
          disabled={!newMemberId || setMember.isPending}
          type="submit"
          variant="outline"
        >
          <UserPlus />
          Ajouter
        </Button>
      </form>
    </div>
  )
}
