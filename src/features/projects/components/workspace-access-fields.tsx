import { useQuery } from "@tanstack/react-query"

import { listWorkspaces } from "@/features/projects/services/project-service"
import {
  labelOf,
  type WorkspaceRole,
  workspaceKindLabels,
  workspaceRoleLabels,
  workspaceRoles,
} from "@/shared/lib/labels"
import { Field } from "@/shared/ui/field"
import { NativeSelect } from "@/shared/ui/native-select"

type WorkspaceAccess = {
  workspaceIds: string[]
  workspaceRole: WorkspaceRole
}

type WorkspaceAccessFieldsProps = WorkspaceAccess & {
  /** Prefixe des id de champ, unique dans le formulaire. */
  idPrefix: string
  onChange: (patch: Partial<WorkspaceAccess>) => void
  organizationId: string
}

/** Espaces ouverts a un nouveau compte (invitation ou creation manuelle). */
export function WorkspaceAccessFields({
  idPrefix,
  onChange,
  organizationId,
  workspaceIds,
  workspaceRole,
}: WorkspaceAccessFieldsProps) {
  const workspaces = useQuery({
    queryKey: ["workspaces", organizationId],
    queryFn: () => listWorkspaces(organizationId),
    enabled: Boolean(organizationId),
  })

  const toggleWorkspace = (id: string, checked: boolean) => {
    onChange({
      workspaceIds: checked
        ? [...workspaceIds, id]
        : workspaceIds.filter((workspaceId) => workspaceId !== id),
    })
  }

  return (
    <>
      <fieldset className="space-y-2 sm:col-span-2">
        <legend className="mb-1.5 text-xs text-muted-foreground">
          Espaces à ouvrir (facultatif)
        </legend>
        {!organizationId ? (
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
                  checked={workspaceIds.includes(workspace.id)}
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

      {workspaceIds.length > 0 ? (
        <Field
          className="sm:col-span-2"
          htmlFor={`${idPrefix}-workspace-role`}
          label="Rôle dans ces espaces"
        >
          <NativeSelect
            id={`${idPrefix}-workspace-role`}
            onChange={(event) => {
              onChange({ workspaceRole: event.target.value as WorkspaceRole })
            }}
            value={workspaceRole}
          >
            {workspaceRoles.map((role) => (
              <option key={role} value={role}>
                {workspaceRoleLabels[role]}
              </option>
            ))}
          </NativeSelect>
        </Field>
      ) : null}
    </>
  )
}
