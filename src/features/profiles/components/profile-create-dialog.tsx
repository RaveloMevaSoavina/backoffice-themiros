import { RefreshCw } from "lucide-react"
import { useState } from "react"

import { OrganizationSelect } from "@/features/organizations/components/organization-select"
import type { ProfileCreateInput } from "@/features/profiles/model/types"
import { createProfile } from "@/features/profiles/services/profile-service"
import { WorkspaceAccessFields } from "@/features/projects/components/workspace-access-fields"
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

/* Meme borne que l'API : en dessous de 8, refuse ; au-dela de 72, bcrypt
   ignore la fin. */
const PASSWORD_MIN = 8
const PASSWORD_MAX = 72
/* Sans caracteres ambigus (0/O, 1/l/I) : le mot de passe se dicte. */
const PASSWORD_ALPHABET =
  "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generatePassword(length = 16) {
  const values = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(
    values,
    (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]
  ).join("")
}

type ProfileCreateDialogProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
  /** Organisation imposee (fiche organisation). */
  organizationId?: string
}

export function ProfileCreateDialog({
  onOpenChange,
  open,
  organizationId,
}: ProfileCreateDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-xl">
        {open ? (
          <ProfileCreateForm
            onDone={() => {
              onOpenChange(false)
            }}
            organizationId={organizationId}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ProfileCreateForm({
  onDone,
  organizationId,
}: {
  onDone: () => void
  organizationId?: string
}) {
  const [input, setInput] = useState<ProfileCreateInput>(() => ({
    organizationId: organizationId ?? "",
    email: "",
    fullName: "",
    password: generatePassword(),
    role: "analyste",
    workspaceIds: [],
    workspaceRole: "member",
  }))
  const mutation = useAdminMutation({
    mutationFn: createProfile,
    success: () =>
      `Compte créé pour ${input.email.trim()} : transmettez-lui son mot de passe`,
    onSuccess: onDone,
  })

  return (
    <form
      className="contents"
      onSubmit={(event) => {
        event.preventDefault()
        mutation.mutate(input)
      }}
    >
      <DialogHeader>
        <DialogTitle>Créer un profil</DialogTitle>
        <DialogDescription>
          Le compte est actif tout de suite, sans e-mail : communiquez vous-même
          l'adresse et le mot de passe à la personne.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="grid gap-4 pb-1 sm:grid-cols-2">
        {organizationId ? null : (
          <Field
            className="sm:col-span-2"
            htmlFor="profile-create-organization"
            label="Organisation"
          >
            <OrganizationSelect
              id="profile-create-organization"
              onChange={(value) => {
                setInput({ ...input, organizationId: value, workspaceIds: [] })
              }}
              value={input.organizationId}
            />
          </Field>
        )}
        <Field htmlFor="profile-create-email" label="Adresse e-mail">
          <Input
            autoComplete="off"
            autoFocus
            id="profile-create-email"
            onChange={(event) => {
              setInput({ ...input, email: event.target.value })
            }}
            required
            type="email"
            value={input.email}
          />
        </Field>
        <Field htmlFor="profile-create-name" label="Nom complet">
          <Input
            id="profile-create-name"
            onChange={(event) => {
              setInput({ ...input, fullName: event.target.value })
            }}
            value={input.fullName}
          />
        </Field>
        <Field
          className="sm:col-span-2"
          htmlFor="profile-create-password"
          label="Mot de passe"
        >
          <div className="flex gap-2">
            {/* En clair : l'administrateur doit pouvoir le recopier. */}
            <Input
              autoComplete="new-password"
              className="font-mono"
              id="profile-create-password"
              maxLength={PASSWORD_MAX}
              minLength={PASSWORD_MIN}
              onChange={(event) => {
                setInput({ ...input, password: event.target.value })
              }}
              required
              spellCheck={false}
              type="text"
              value={input.password}
            />
            <Button
              onClick={() => {
                setInput({ ...input, password: generatePassword() })
              }}
              type="button"
              variant="outline"
            >
              <RefreshCw />
              Générer
            </Button>
          </div>
        </Field>
        <Field
          className="sm:col-span-2"
          htmlFor="profile-create-role"
          label="Rôle dans l'organisation"
        >
          <NativeSelect
            id="profile-create-role"
            onChange={(event) => {
              setInput({ ...input, role: event.target.value as ProfileRole })
            }}
            value={input.role}
          >
            {profileRoles.map((role) => (
              <option key={role} value={role}>
                {profileRoleLabels[role]}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <WorkspaceAccessFields
          idPrefix="profile-create"
          onChange={(patch) => {
            setInput({ ...input, ...patch })
          }}
          organizationId={input.organizationId}
          workspaceIds={input.workspaceIds}
          workspaceRole={input.workspaceRole}
        />
      </DialogBody>
      <DialogFooter>
        <Button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "Création..." : "Créer le compte"}
        </Button>
      </DialogFooter>
    </form>
  )
}
