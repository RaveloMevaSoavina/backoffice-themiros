import { useState } from "react"

import type { InvitationInput } from "@/features/invitations/model/types"
import { createInvitation } from "@/features/invitations/services/invitation-service"
import { OrganizationSelect } from "@/features/organizations/components/organization-select"
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

type InviteDialogProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
  /** Organisation imposee (fiche organisation). */
  organizationId?: string
}

export function InviteDialog({
  onOpenChange,
  open,
  organizationId,
}: InviteDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-xl">
        {open ? (
          <InviteForm
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

function InviteForm({
  onDone,
  organizationId,
}: {
  onDone: () => void
  organizationId?: string
}) {
  const [input, setInput] = useState<InvitationInput>({
    organizationId: organizationId ?? "",
    email: "",
    fullName: "",
    role: "analyste",
    workspaceIds: [],
    workspaceRole: "member",
  })
  const mutation = useAdminMutation({
    mutationFn: createInvitation,
    success: (result) =>
      result.delivery === "sent"
        ? `Invitation envoyée à ${input.email.trim()}`
        : `${input.email.trim()} avait déjà un compte : il est rattaché à l'organisation`,
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
        <DialogTitle>Inviter une personne</DialogTitle>
        <DialogDescription>
          Un lien de connexion part par e-mail. Si l'adresse a déjà un compte
          confirmé sans organisation, il est rattaché directement.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="grid gap-4 pb-1 sm:grid-cols-2">
        {organizationId ? null : (
          <Field
            className="sm:col-span-2"
            htmlFor="invite-organization"
            label="Organisation"
          >
            <OrganizationSelect
              id="invite-organization"
              onChange={(value) => {
                setInput({ ...input, organizationId: value, workspaceIds: [] })
              }}
              value={input.organizationId}
            />
          </Field>
        )}
        <Field htmlFor="invite-email" label="Adresse e-mail">
          <Input
            autoFocus
            id="invite-email"
            onChange={(event) => {
              setInput({ ...input, email: event.target.value })
            }}
            required
            type="email"
            value={input.email}
          />
        </Field>
        <Field htmlFor="invite-name" label="Nom complet">
          <Input
            id="invite-name"
            onChange={(event) => {
              setInput({ ...input, fullName: event.target.value })
            }}
            value={input.fullName}
          />
        </Field>
        <Field
          className="sm:col-span-2"
          htmlFor="invite-role"
          label="Rôle dans l'organisation"
        >
          <NativeSelect
            id="invite-role"
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
          idPrefix="invite"
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
          {mutation.isPending ? "Envoi..." : "Envoyer l'invitation"}
        </Button>
      </DialogFooter>
    </form>
  )
}
