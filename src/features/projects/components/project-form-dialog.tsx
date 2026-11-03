import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { OrganizationSelect } from "@/features/organizations/components/organization-select"
import { profileDisplayName } from "@/features/profiles/model/types"
import { listProfiles } from "@/features/profiles/services/profile-service"
import { WorkspaceFields } from "@/features/projects/components/workspace-fields"
import type {
  CreateWorkspaceInput,
  WorkspaceDetails,
  WorkspaceInput,
} from "@/features/projects/model/types"
import {
  createWorkspace,
  updateWorkspace,
} from "@/features/projects/services/project-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import {
  type WorkspaceKind,
  workspaceKindLabels,
  workspaceKinds,
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
import { Field } from "@/shared/ui/field"
import { NativeSelect } from "@/shared/ui/native-select"

type ProjectFormDialogProps = {
  onOpenChange: (open: boolean) => void
  onSaved?: (workspaceId: string) => void
  open: boolean
  organizationId?: string
  /** Present : modification. */
  workspace?: WorkspaceDetails | null
}

export function ProjectFormDialog({
  onOpenChange,
  onSaved,
  open,
  organizationId,
  workspace,
}: ProjectFormDialogProps) {
  const onDone = (id: string) => {
    onOpenChange(false)
    onSaved?.(id)
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-xl">
        {open && workspace ? (
          <EditForm onDone={onDone} workspace={workspace} />
        ) : open ? (
          <CreateForm onDone={onDone} organizationId={organizationId} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function CreateForm({
  onDone,
  organizationId,
}: {
  onDone: (id: string) => void
  organizationId?: string
}) {
  const [input, setInput] = useState<CreateWorkspaceInput>({
    organizationId: organizationId ?? "",
    kind: "project",
    ownerProfileId: "",
    name: "",
    targetCountry: "",
    declaredStage: "",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 2,
  })
  const members = useQuery({
    queryKey: ["profiles", input.organizationId],
    queryFn: () => listProfiles(input.organizationId),
    enabled: Boolean(input.organizationId),
  })
  const mutation = useAdminMutation({
    mutationFn: createWorkspace,
    success: "Espace créé",
    onSuccess: onDone,
  })
  const update = (patch: Partial<CreateWorkspaceInput>) => {
    setInput((current) => ({ ...current, ...patch }))
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
        <DialogTitle>Nouvel espace</DialogTitle>
        <DialogDescription>
          L'espace est créé vide : son responsable le complète (financeurs,
          thématiques, démarche) depuis le dashboard.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="grid gap-4 pb-1 sm:grid-cols-2">
        {organizationId ? null : (
          <Field
            className="sm:col-span-2"
            htmlFor="workspace-organization"
            label="Organisation"
          >
            <OrganizationSelect
              id="workspace-organization"
              onChange={(value) => {
                update({ organizationId: value, ownerProfileId: "" })
              }}
              value={input.organizationId}
            />
          </Field>
        )}
        <Field htmlFor="workspace-kind" label="Nature">
          <NativeSelect
            id="workspace-kind"
            onChange={(event) => {
              update({ kind: event.target.value as WorkspaceKind })
            }}
            value={input.kind}
          >
            {workspaceKinds.map((kind) => (
              <option key={kind} value={kind}>
                {workspaceKindLabels[kind]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field
          htmlFor="workspace-owner"
          hint="Devient administrateur de l'espace."
          label="Responsable"
        >
          <NativeSelect
            disabled={!input.organizationId}
            id="workspace-owner"
            onChange={(event) => {
              update({ ownerProfileId: event.target.value })
            }}
            required
            value={input.ownerProfileId}
          >
            <option value="">Choisir un compte</option>
            {(members.data ?? []).map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profileDisplayName(profile)}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <WorkspaceFields input={input} onChange={update} />
      </DialogBody>
      <DialogFooter>
        <Button disabled={mutation.isPending} type="submit">
          Créer l'espace
        </Button>
      </DialogFooter>
    </form>
  )
}

function EditForm({
  onDone,
  workspace,
}: {
  onDone: (id: string) => void
  workspace: WorkspaceDetails
}) {
  const [input, setInput] = useState<WorkspaceInput>({
    name: workspace.name,
    targetCountry: workspace.targetCountry ?? "",
    declaredStage: workspace.declaredStage ?? "",
    startYear: workspace.startYear,
    endYear: workspace.endYear,
  })
  const mutation = useAdminMutation({
    mutationFn: (value: WorkspaceInput) => updateWorkspace(workspace.id, value),
    success: "Espace mis à jour",
    onSuccess: () => {
      onDone(workspace.id)
    },
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
        <DialogTitle>Modifier l'espace</DialogTitle>
        <DialogDescription>
          La nature ({workspaceKindLabels[workspace.kind].toLowerCase()}) ne
          change pas : elle fixe la démarche et le cadre déjà générés.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="grid gap-4 pb-1 sm:grid-cols-2">
        <WorkspaceFields
          input={input}
          onChange={(patch) => {
            setInput((current) => ({ ...current, ...patch }))
          }}
        />
      </DialogBody>
      <DialogFooter>
        <Button disabled={mutation.isPending} type="submit">
          Enregistrer
        </Button>
      </DialogFooter>
    </form>
  )
}
