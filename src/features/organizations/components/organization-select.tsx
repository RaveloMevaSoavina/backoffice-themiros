import { useOrganizations } from "@/features/organizations/model/use-organizations"
import { NativeSelect } from "@/shared/ui/native-select"

type OrganizationSelectProps = {
  allowNone?: boolean
  disabled?: boolean
  id: string
  onChange: (organizationId: string) => void
  value: string
}

export function OrganizationSelect({
  allowNone = false,
  disabled,
  id,
  onChange,
  value,
}: OrganizationSelectProps) {
  const organizations = useOrganizations()

  return (
    <NativeSelect
      disabled={disabled || organizations.isLoading}
      id={id}
      onChange={(event) => {
        onChange(event.target.value)
      }}
      required={!allowNone}
      value={value}
    >
      <option value="">
        {allowNone ? "Aucune organisation" : "Choisir une organisation"}
      </option>
      {(organizations.data ?? []).map((organization) => (
        <option key={organization.id} value={organization.id}>
          {organization.name}
        </option>
      ))}
    </NativeSelect>
  )
}
