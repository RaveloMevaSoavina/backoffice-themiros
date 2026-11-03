import { useState } from "react"

import type {
  Organization,
  OrganizationInput,
} from "@/features/organizations/model/types"
import { saveOrganization } from "@/features/organizations/services/organization-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import {
  type OrganizationType,
  organizationTypeLabels,
  organizationTypes,
} from "@/shared/lib/labels"
import { Button } from "@/shared/ui/base/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/base/dialog"
import { Input } from "@/shared/ui/base/input"
import { Field } from "@/shared/ui/field"
import { NativeSelect } from "@/shared/ui/native-select"
import { Textarea } from "@/shared/ui/textarea"

type OrganizationFormDialogProps = {
  onOpenChange: (open: boolean) => void
  onSaved?: (organizationId: string) => void
  open: boolean
  /** Absente : creation. */
  organization?: Organization | null
}

function initialInput(organization?: Organization | null): OrganizationInput {
  return {
    id: organization?.id ?? null,
    name: organization?.name ?? "",
    type: organization?.type ?? "",
    country: organization?.country ?? "",
    billingEmail: organization?.billingEmail ?? "",
    billingAddress: organization?.billingAddress ?? "",
    vatNumber: organization?.vatNumber ?? "",
    notes: organization?.notes ?? "",
  }
}

export function OrganizationFormDialog({
  onOpenChange,
  onSaved,
  open,
  organization,
}: OrganizationFormDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-xl">
        {/* Remonte a chaque ouverture : le formulaire repart de la fiche. */}
        {open ? (
          <OrganizationForm
            onDone={(id) => {
              onOpenChange(false)
              onSaved?.(id)
            }}
            organization={organization}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function OrganizationForm({
  onDone,
  organization,
}: {
  onDone: (id: string) => void
  organization?: Organization | null
}) {
  const [input, setInput] = useState(() => initialInput(organization))
  const mutation = useAdminMutation({
    mutationFn: saveOrganization,
    success: organization ? "Organisation mise à jour" : "Organisation créée",
    onSuccess: onDone,
  })
  const update = (patch: Partial<OrganizationInput>) => {
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
        <DialogTitle>
          {organization ? "Modifier l'organisation" : "Nouvelle organisation"}
        </DialogTitle>
      </DialogHeader>
      <DialogBody className="grid gap-4 pb-1 sm:grid-cols-2">
        <Field className="sm:col-span-2" htmlFor="org-name" label="Nom">
          <Input
            autoFocus
            id="org-name"
            onChange={(event) => {
              update({ name: event.target.value })
            }}
            required
            value={input.name}
          />
        </Field>
        <Field htmlFor="org-type" label="Type">
          <NativeSelect
            id="org-type"
            onChange={(event) => {
              update({ type: event.target.value as OrganizationType | "" })
            }}
            value={input.type}
          >
            <option value="">Non précisé</option>
            {organizationTypes.map((type) => (
              <option key={type} value={type}>
                {organizationTypeLabels[type]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field htmlFor="org-country" label="Pays" hint="Code ISO, ex. SN">
          <Input
            id="org-country"
            maxLength={2}
            onChange={(event) => {
              update({ country: event.target.value.toUpperCase() })
            }}
            value={input.country}
          />
        </Field>
        <Field htmlFor="org-billing-email" label="E-mail de facturation">
          <Input
            id="org-billing-email"
            onChange={(event) => {
              update({ billingEmail: event.target.value })
            }}
            type="email"
            value={input.billingEmail}
          />
        </Field>
        <Field htmlFor="org-vat" label="N° de TVA / identifiant fiscal">
          <Input
            id="org-vat"
            onChange={(event) => {
              update({ vatNumber: event.target.value })
            }}
            value={input.vatNumber}
          />
        </Field>
        <Field
          className="sm:col-span-2"
          htmlFor="org-address"
          label="Adresse de facturation"
        >
          <Textarea
            id="org-address"
            onChange={(event) => {
              update({ billingAddress: event.target.value })
            }}
            rows={3}
            value={input.billingAddress}
          />
        </Field>
        <Field
          className="sm:col-span-2"
          htmlFor="org-notes"
          label="Notes internes"
        >
          <Textarea
            id="org-notes"
            onChange={(event) => {
              update({ notes: event.target.value })
            }}
            rows={2}
            value={input.notes}
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
