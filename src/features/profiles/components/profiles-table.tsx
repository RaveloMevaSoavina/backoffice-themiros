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
  listProfiles,
  setPlatformAdmin,
} from "@/features/profiles/services/profile-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { formatDateTime, formatInteger } from "@/shared/lib/format"
import { labelOf, profileRoleLabels } from "@/shared/lib/labels"
import { Badge } from "@/shared/ui/base/badge"
import { Button } from "@/shared/ui/base/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const adminMutation = useAdminMutation({
    mutationFn: setPlatformAdmin,
    success: "Droits du backoffice mis à jour",
    onSuccess: () => {
      setAdminChange(null)
    },
  })

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return (profiles.data ?? []).filter(
      (profile) =>
        !needle ||
        profile.email.toLowerCase().includes(needle) ||
        (profile.fullName ?? "").toLowerCase().includes(needle) ||
        (profile.organizationName ?? "").toLowerCase().includes(needle)
    )
  }, [profiles.data, search])

  return (
    <>
      <div className="relative mb-4 max-w-sm">
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
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {profileDisplayName(profile)}
                      {profile.isPlatformAdmin ? (
                        <Badge variant="outline">Backoffice</Badge>
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
    </>
  )
}
