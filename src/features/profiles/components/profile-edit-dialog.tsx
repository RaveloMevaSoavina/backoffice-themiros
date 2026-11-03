import { useState } from "react"

import { OrganizationSelect } from "@/features/organizations/components/organization-select"
import type { Profile, ProfileInput } from "@/features/profiles/model/types"
import { updateProfile } from "@/features/profiles/services/profile-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import {
  type ProfileRole,
  profileRoleLabels,
  profileRoles,
} from "@/shared/lib/labels"
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
import { Input } from "@/shared/ui/base/input"
import { Field } from "@/shared/ui/field"
import { NativeSelect } from "@/shared/ui/native-select"

type ProfileEditDialogProps = {
  onOpenChange: (open: boolean) => void
  profile: Profile | null
}

export function ProfileEditDialog({
  onOpenChange,
  profile,
}: ProfileEditDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={profile !== null}>
      <DialogContent>
        {profile ? (
          <ProfileForm
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

function ProfileForm({
  onDone,
  profile,
}: {
  onDone: () => void
  profile: Profile
}) {
  const [input, setInput] = useState<ProfileInput>({
    id: profile.id,
    fullName: profile.fullName ?? "",
    role: profile.role ?? "",
    organizationId: profile.organizationId,
  })
  const mutation = useAdminMutation({
    mutationFn: updateProfile,
    success: "Profil mis à jour",
    onSuccess: onDone,
  })
  const movesOut =
    profile.organizationId !== null &&
    input.organizationId !== profile.organizationId

  return (
    <form
      className="contents"
      onSubmit={(event) => {
        event.preventDefault()
        mutation.mutate(input)
      }}
    >
      <DialogHeader>
        <DialogTitle>Modifier le profil</DialogTitle>
        <DialogDescription>{profile.email}</DialogDescription>
      </DialogHeader>
      <DialogBody className="space-y-4 pb-1">
        <Field htmlFor="profile-name" label="Nom complet">
          <Input
            id="profile-name"
            onChange={(event) => {
              setInput({ ...input, fullName: event.target.value })
            }}
            value={input.fullName}
          />
        </Field>
        <Field
          htmlFor="profile-role"
          hint="Le rôle fixe le persona de lecture dans le dashboard ; seul l'administrateur crée des espaces."
          label="Rôle dans l'organisation"
        >
          <NativeSelect
            id="profile-role"
            onChange={(event) => {
              setInput({
                ...input,
                role: event.target.value as ProfileRole | "",
              })
            }}
            value={input.role}
          >
            <option value="">Aucun</option>
            {profileRoles.map((role) => (
              <option key={role} value={role}>
                {profileRoleLabels[role]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field
          htmlFor="profile-organization"
          hint={
            movesOut
              ? "Le compte sera retiré de tous les espaces de son organisation actuelle."
              : undefined
          }
          label="Organisation"
        >
          <OrganizationSelect
            allowNone
            id="profile-organization"
            onChange={(organizationId) => {
              setInput({ ...input, organizationId: organizationId || null })
            }}
            value={input.organizationId ?? ""}
          />
        </Field>
      </DialogBody>
      <DialogFooter>
        <Button disabled={mutation.isPending} type="submit">
          Enregistrer
        </Button>
      </DialogFooter>
    </form>
  )
}
