import { useQuery } from "@tanstack/react-query"
import { MoreHorizontal, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { useAuth } from "@/features/auth/model/auth-provider"
import { ProfileEditDialog } from "@/features/profiles/components/profile-edit-dialog"
import {
  type Profile,
  profileDisplayName,
} from "@/features/profiles/model/types"
import {
  deleteProfile,
  listProfiles,
  setPlatformAdmin,
  setProfileArchived,
} from "@/features/profiles/services/profile-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { formatDate, formatDateTime, formatInteger } from "@/shared/lib/format"
import { labelOf, profileRoleLabels } from "@/shared/lib/labels"
import { Badge } from "@/shared/ui/base/badge"
import { Button } from "@/shared/ui/base/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/base/dropdown-menu"
import { Input } from "@/shared/ui/base/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/base/table"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { EmptyRow, QueryState } from "@/shared/ui/query-state"

type ProfilesTableProps = {
  /** Restreint la liste a une organisation (fiche organisation). */
  organizationId?: string
}

export function ProfilesTable({ organizationId }: ProfilesTableProps) {
  const { session } = useAuth()
  const profiles = useQuery({
    queryKey: ["profiles", organizationId ?? "all"],
    queryFn: () => listProfiles(organizationId),
  })
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Profile | null>(null)
  const [adminChange, setAdminChange] = useState<Profile | null>(null)
  const [archiveChange, setArchiveChange] = useState<Profile | null>(null)
  const [deleting, setDeleting] = useState<Profile | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const adminMutation = useAdminMutation({
    mutationFn: setPlatformAdmin,
    success: "Droits du backoffice mis à jour",
    onSuccess: () => {
      setAdminChange(null)
    },
  })

  const archiveMutation = useAdminMutation({
    mutationFn: setProfileArchived,
    success: (_, variables) =>
      variables.archived ? "Profil archivé" : "Profil restauré",
    onSuccess: () => {
      setArchiveChange(null)
    },
  })

  const deleteMutation = useAdminMutation({
    mutationFn: deleteProfile,
    success: "Compte supprimé définitivement",
    onSuccess: () => {
      setDeleting(null)
    },
  })

  const archivedCount = (profiles.data ?? []).filter(
    (profile) => profile.archivedAt
  ).length
  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return (profiles.data ?? []).filter(
      (profile) =>
        (showArchived || !profile.archivedAt) &&
        (!needle ||
          profile.email.toLowerCase().includes(needle) ||
          (profile.fullName ?? "").toLowerCase().includes(needle) ||
          (profile.organizationName ?? "").toLowerCase().includes(needle))
    )
  }, [profiles.data, search, showArchived])

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Rechercher un profil"
            className="pl-8"
            onChange={(event) => {
              setSearch(event.target.value)
            }}
            placeholder="Nom, e-mail ou organisation"
            value={search}
          />
        </div>
        {archivedCount > 0 ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              checked={showArchived}
              className="size-4 accent-foreground"
              onChange={(event) => {
                setShowArchived(event.target.checked)
              }}
              type="checkbox"
            />
            Afficher les archivés ({formatInteger(archivedCount)})
          </label>
        ) : null}
      </div>

      <QueryState error={profiles.error} isLoading={profiles.isLoading}>
        {visible.length === 0 ? (
          <EmptyRow>Aucun profil.</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compte</TableHead>
                {organizationId ? null : <TableHead>Organisation</TableHead>}
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Espaces</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((profile) => (
                <TableRow
                  className={profile.archivedAt ? "opacity-60" : undefined}
                  key={profile.id}
                >
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {profileDisplayName(profile)}
                      {profile.isPlatformAdmin ? (
                        <Badge variant="outline">Backoffice</Badge>
                      ) : null}
                      {profile.archivedAt ? (
                        <Badge
                          title={`Archivé le ${formatDate(profile.archivedAt)}${
                            profile.archivedByName
                              ? ` par ${profile.archivedByName}`
                              : ""
                          }`}
                          variant="secondary"
                        >
                          Archivé
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {profile.email}
                    </div>
                  </TableCell>
                  {organizationId ? null : (
                    <TableCell>
                      {profile.organizationId ? (
                        <Link
                          className="hover:underline"
                          to={`/organizations/${profile.organizationId}`}
                        >
                          {profile.organizationName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Aucune</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {labelOf(profileRoleLabels, profile.role)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatInteger(profile.workspaceCount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {profile.lastSignInAt ? (
                      formatDateTime(profile.lastSignInAt)
                    ) : (
                      <Badge variant="warning">Jamais connecté</Badge>
                    )}
                  </TableCell>
                  <TableCell>
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
                          onSelect={() => {
                            setEditing(profile)
                          }}
                        >
                          Modifier le profil
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={
                            profile.isPlatformAdmin &&
                            profile.id === session?.user.id
                          }
                          onSelect={() => {
                            setAdminChange(profile)
                          }}
                        >
                          {profile.isPlatformAdmin
                            ? "Retirer l'accès au backoffice"
                            : "Donner l'accès au backoffice"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={profile.id === session?.user.id}
                          onSelect={() => {
                            setArchiveChange(profile)
                          }}
                          variant={
                            profile.archivedAt ? "default" : "destructive"
                          }
                        >
                          {profile.archivedAt
                            ? "Restaurer le profil"
                            : "Archiver le profil"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={profile.id === session?.user.id}
                          onSelect={() => {
                            setDeleting(profile)
                          }}
                          variant="destructive"
                        >
                          Supprimer définitivement
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </QueryState>

      <ProfileEditDialog
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        profile={editing}
      />

      <ConfirmDialog
        confirmLabel={
          adminChange?.isPlatformAdmin ? "Retirer" : "Donner l'accès"
        }
        description={
          adminChange?.isPlatformAdmin
            ? `${adminChange.email} ne pourra plus ouvrir le backoffice.`
            : `${adminChange?.email} pourra administrer toutes les organisations, leurs comptes et leur facturation.`
        }
        destructive={adminChange?.isPlatformAdmin}
        isPending={adminMutation.isPending}
        onConfirm={() => {
          if (adminChange) {
            adminMutation.mutate({
              profileId: adminChange.id,
              enabled: !adminChange.isPlatformAdmin,
            })
          }
        }}
        onOpenChange={(open) => {
          if (!open) setAdminChange(null)
        }}
        open={adminChange !== null}
        title="Accès au backoffice"
      />

      <ConfirmDialog
        confirmLabel={archiveChange?.archivedAt ? "Restaurer" : "Archiver"}
        description={
          archiveChange?.archivedAt
            ? `${archiveChange.email} pourra de nouveau se connecter, avec son organisation et ses espaces d'avant.`
            : `${archiveChange?.email} ne pourra plus se connecter. Son organisation, ses espaces et son historique sont conservés : le profil se restaure à tout moment.`
        }
        destructive={!archiveChange?.archivedAt}
        isPending={archiveMutation.isPending}
        onConfirm={() => {
          if (archiveChange) {
            archiveMutation.mutate({
              profileId: archiveChange.id,
              archived: !archiveChange.archivedAt,
            })
          }
        }}
        onOpenChange={(open) => {
          if (!open) setArchiveChange(null)
        }}
        open={archiveChange !== null}
        title={
          archiveChange?.archivedAt
            ? "Restaurer le profil"
            : "Archiver le profil"
        }
      />

      <ConfirmDialog
        confirmLabel="Supprimer définitivement"
        description={`Le compte ${deleting?.email} est effacé, avec ses accès aux espaces et ses invitations. C'est irréversible. Un compte auteur de données (approches, cadres, documents…) ne se supprime pas : archivez-le.`}
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) {
            deleteMutation.mutate(deleting.id)
          }
        }}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        open={deleting !== null}
        title="Supprimer le compte"
      />
    </>
  )
}
