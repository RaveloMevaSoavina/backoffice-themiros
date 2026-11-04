import { useState } from "react"

import { OrganizationSelect } from "@/features/organizations/components/organization-select"
import {
  type Profile,
  profileDisplayName,
} from "@/features/profiles/model/types"
import { updateProfile } from "@/features/profiles/services/profile-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { formatInteger } from "@/shared/lib/format"
import { Button } from "@/shared/ui/base/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/base/dialog"
import { Field } from "@/shared/ui/field"

type ProfileOrganizationDialogProps = {
  onOpenChange: (open: boolean) => void
  profile: Profile | null
}

/**
 * Deplacer un compte vers une autre organisation. Le RPC le retire de tous
 * les espaces de l'ancienne organisation et vide son espace courant : on
 * l'annonce avant d'enregistrer.
 */
export function ProfileOrganizationDialog({
  onOpenChange,
  profile,
}: ProfileOrganizationDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={profile !== null}>
      <DialogContent>
        {profile ? (
          <OrganizationForm
            onDone={() => {
              onOpenChange(false)
            }}
            profile={profile}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function OrganizationForm({
  onDone,
  profile,
}: {
  onDone: () => void
  profile: Profile
}) {
  const [organizationId, setOrganizationId] = useState(
    profile.organizationId ?? ""
  )
  const mutation = useAdminMutation({
    mutationFn: updateProfile,
    success: "Organisation du compte modifiée",
    onSuccess: onDone,
  })
  const target = organizationId || null
  const changed = target !== profile.organizationId
  const losesWorkspaces =
    changed && profile.organizationId !== null && profile.workspaceCount > 0

  return (
    <form
      className="contents"
      onSubmit={(event) => {
        event.preventDefault()
        if (!changed) return
        mutation.mutate({
          id: profile.id,
          fullName: profile.fullName ?? "",
          role: profile.role ?? "",
          organizationId: target,
        })
      }}
    >
      <DialogHeader>
        <DialogTitle>Changer d'organisation</DialogTitle>
        <DialogDescription>
          {profileDisplayName(profile)} · actuellement{" "}
          {profile.organizationName ?? "sans organisation"}
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="space-y-4 pb-1">
        <Field
          htmlFor="profile-move-organization"
          label="Nouvelle organisation"
        >
          <OrganizationSelect
            allowNone
            id="profile-move-organization"
            onChange={setOrganizationId}
            value={organizationId}
          />
        </Field>
        {losesWorkspaces ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            Le compte sera retiré de{" "}
            {profile.workspaceCount > 1
              ? `ses ${formatInteger(profile.workspaceCount)} espaces`
              : "son espace"}{" "}
            dans {profile.organizationName}. Ses données restent dans
            l'organisation d'origine ; il faudra lui ouvrir l'accès aux espaces
            de la nouvelle.
          </p>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Button
          disabled={!changed || mutation.isPending}
          type="submit"
          variant={losesWorkspaces ? "destructive" : "default"}
        >
          Déplacer le compte
        </Button>
      </DialogFooter>
    </form>
  )
}
