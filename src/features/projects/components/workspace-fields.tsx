import type { WorkspaceInput } from "@/features/projects/model/types"
import {
  type WorkspaceStage,
  workspaceStageLabels,
  workspaceStages,
} from "@/shared/lib/labels"
import { Input } from "@/shared/ui/base/input"
import { Field } from "@/shared/ui/field"
import { NativeSelect } from "@/shared/ui/native-select"

type WorkspaceFieldsProps = {
  input: WorkspaceInput
  onChange: (patch: Partial<WorkspaceInput>) => void
}

function toYear(value: string) {
  return value ? Number(value) : null
}

/** Champs communs a la creation et a la modification d'un espace. */
export function WorkspaceFields({ input, onChange }: WorkspaceFieldsProps) {
  return (
    <>
      <Field className="sm:col-span-2" htmlFor="workspace-name" label="Nom">
        <Input
          id="workspace-name"
          onChange={(event) => {
            onChange({ name: event.target.value })
          }}
          required
          value={input.name}
        />
      </Field>
      <Field htmlFor="workspace-country" label="Pays cible" hint="Code ISO">
        <Input
          id="workspace-country"
          maxLength={2}
          onChange={(event) => {
            onChange({ targetCountry: event.target.value.toUpperCase() })
          }}
          value={input.targetCountry}
        />
      </Field>
      <Field htmlFor="workspace-stage" label="Phase déclarée">
        <NativeSelect
          id="workspace-stage"
          onChange={(event) => {
            onChange({
              declaredStage: event.target.value as WorkspaceStage | "",
            })
          }}
          value={input.declaredStage}
        >
          <option value="">Non précisée</option>
          {workspaceStages.map((stage) => (
            <option key={stage} value={stage}>
              {workspaceStageLabels[stage]}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field htmlFor="workspace-start" label="Année de début">
        <Input
          id="workspace-start"
          max={2100}
          min={1990}
          onChange={(event) => {
            onChange({ startYear: toYear(event.target.value) })
          }}
          type="number"
          value={input.startYear ?? ""}
        />
      </Field>
      <Field htmlFor="workspace-end" label="Année de fin">
        <Input
          id="workspace-end"
          max={2100}
          min={input.startYear ?? 1990}
          onChange={(event) => {
            onChange({ endYear: toYear(event.target.value) })
          }}
          type="number"
          value={input.endYear ?? ""}
        />
      </Field>
    </>
  )
}
