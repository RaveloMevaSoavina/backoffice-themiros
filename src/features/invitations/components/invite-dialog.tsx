import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import type { InvitationInput } from "@/features/invitations/model/types"
import { createInvitation } from "@/features/invitations/services/invitation-service"
import { OrganizationSelect } from "@/features/organizations/components/organization-select"
import { listWorkspaces } from "@/features/projects/services/project-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import {
  labelOf,
  type ProfileRole,
  profileRoleLabels,
  profileRoles,
  type WorkspaceRole,
  workspaceKindLabels,
  workspaceRoleLabels,
  workspaceRoles,
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
  const workspaces = useQuery({
    queryKey: ["workspaces", input.organizationId],
    queryFn: () => listWorkspaces(input.organizationId),
    enabled: Boolean(input.organizationId),
  })
  const mutation = useAdminMutation({
    mutationFn: createInvitation,
    success: (result) =>
      result.delivery === "sent"
        ? `Invitation envoyée à ${input.email.trim()}`
        : `${input.email.trim()} avait déjà un compte : il est rattaché à l'organisation`,
    onSuccess: onDone,
  })

  const toggleWorkspace = (id: string, checked: boolean) => {
    setInput((current) => ({
      ...current,
      workspaceIds: checked
        ? [...current.workspaceIds, id]
        : current.workspaceIds.filter((workspaceId) => workspaceId !== id),
    }))
  }

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

        <fieldset className="space-y-2 sm:col-span-2">
          <legend className="mb-1.5 text-xs text-muted-foreground">
            Espaces à ouvrir (facultatif)
          </legend>
          {!input.organizationId ? (
            <p className="text-xs text-muted-foreground">
              Choisissez d'abord l'organisation.
            </p>
          ) : (workspaces.data ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {workspaces.isLoading
                ? "Chargement des espaces..."
                : "Cette organisation n'a encore aucun espace."}
            </p>
          ) : (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg p-2 ring-1 ring-border">
              {(workspaces.data ?? []).map((workspace) => (
                <label
                  className="flex items-center gap-2 rounded-md px-1 py-0.5 text-sm"
                  key={workspace.id}
                >
                  <input
                    checked={input.workspaceIds.includes(workspace.id)}
                    className="size-4 accent-foreground"
                    onChange={(event) => {
                      toggleWorkspace(workspace.id, event.target.checked)
                    }}
                    type="checkbox"
                  />
                  <span className="truncate">{workspace.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {labelOf(workspaceKindLabels, workspace.kind)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        {input.workspaceIds.length > 0 ? (
          <Field
            className="sm:col-span-2"
            htmlFor="invite-workspace-role"
            label="Rôle dans ces espaces"
          >
            <NativeSelect
              id="invite-workspace-role"
              onChange={(event) => {
                setInput({
                  ...input,
                  workspaceRole: event.target.value as WorkspaceRole,
                })
              }}
              value={input.workspaceRole}
            >
              {workspaceRoles.map((role) => (
                <option key={role} value={role}>
                  {workspaceRoleLabels[role]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "Envoi..." : "Envoyer l'invitation"}
        </Button>
      </DialogFooter>
    </form>
  )
}
