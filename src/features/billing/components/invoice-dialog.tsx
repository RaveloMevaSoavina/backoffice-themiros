import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import type {
  Invoice,
  InvoiceInput,
  Subscription,
} from "@/features/billing/model/types"
import {
  listSubscriptions,
  saveInvoice,
} from "@/features/billing/services/billing-service"
import { OrganizationSelect } from "@/features/organizations/components/organization-select"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { formatDate, formatPreciseEur } from "@/shared/lib/format"
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
import { Textarea } from "@/shared/ui/textarea"

type InvoiceDialogProps = {
  /** Brouillon a modifier. */
  invoice?: Invoice | null
  onOpenChange: (open: boolean) => void
  open: boolean
  organizationId?: string
  /** Facture preremplie depuis un abonnement. */
  subscription?: Subscription | null
}

export function InvoiceDialog({
  invoice,
  onOpenChange,
  open,
  organizationId,
  subscription,
}: InvoiceDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-xl">
        {open ? (
          <InvoiceForm
            invoice={invoice}
            onDone={() => {
              onOpenChange(false)
            }}
            organizationId={organizationId}
            subscription={subscription}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function initialInput({
  invoice,
  organizationId,
  subscription,
}: Omit<InvoiceDialogProps, "onOpenChange" | "open">): InvoiceInput {
  if (invoice) {
    return {
      id: invoice.id,
      organizationId: invoice.organizationId,
      subscriptionId: invoice.subscriptionId,
      label: invoice.label,
      amountEur: invoice.amountEur,
      vatRate: invoice.vatRate,
      dueOn: invoice.dueOn,
      notes: invoice.notes ?? "",
    }
  }
  return {
    id: null,
    organizationId: subscription?.organizationId ?? organizationId ?? "",
    subscriptionId: subscription?.id ?? null,
    label: subscription
      ? `Abonnement ${subscription.planName} — du ${formatDate(subscription.startsOn)} au ${formatDate(subscription.endsOn)}`
      : "",
    amountEur: subscription?.priceEur ?? 0,
    vatRate: 20,
    dueOn: null,
    notes: "",
  }
}

function InvoiceForm({
  invoice,
  onDone,
  organizationId,
  subscription,
}: Omit<InvoiceDialogProps, "onOpenChange" | "open"> & {
  onDone: () => void
}) {
  const [input, setInput] = useState(() =>
    initialInput({ invoice, organizationId, subscription })
  )
  const subscriptions = useQuery({
    queryKey: ["billing", "subscriptions", input.organizationId],
    queryFn: () => listSubscriptions(input.organizationId),
    enabled: Boolean(input.organizationId),
  })
  const mutation = useAdminMutation({
    mutationFn: saveInvoice,
    success: invoice ? "Brouillon mis à jour" : "Brouillon de facture créé",
    onSuccess: onDone,
  })
  const update = (patch: Partial<InvoiceInput>) => {
    setInput((current) => ({ ...current, ...patch }))
  }
  const total = Math.round(input.amountEur * (100 + input.vatRate)) / 100
  const organizationFixed = Boolean(invoice || subscription || organizationId)

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
          {invoice ? "Modifier le brouillon" : "Nouvelle facture"}
        </DialogTitle>
        <DialogDescription>
          La facture reste un brouillon jusqu'à son émission, qui lui donne son
          numéro. Une facture émise ne se modifie plus.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="grid gap-4 pb-1 sm:grid-cols-2">
        {organizationFixed ? null : (
          <Field
            className="sm:col-span-2"
            htmlFor="invoice-organization"
            label="Organisation"
          >
            <OrganizationSelect
              id="invoice-organization"
              onChange={(value) => {
                update({ organizationId: value, subscriptionId: null })
              }}
              value={input.organizationId}
            />
          </Field>
        )}
        <Field
          className="sm:col-span-2"
          htmlFor="invoice-subscription"
          label="Abonnement lié"
        >
          <NativeSelect
            disabled={!input.organizationId}
            id="invoice-subscription"
            onChange={(event) => {
              update({ subscriptionId: event.target.value || null })
            }}
            value={input.subscriptionId ?? ""}
          >
            <option value="">Aucun (prestation ponctuelle)</option>
            {(subscriptions.data ?? []).map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.planName} · {formatDate(candidate.startsOn)} →{" "}
                {formatDate(candidate.endsOn)}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field
          className="sm:col-span-2"
          htmlFor="invoice-label"
          label="Libellé"
        >
          <Input
            id="invoice-label"
            onChange={(event) => {
              update({ label: event.target.value })
            }}
            required
            value={input.label}
          />
        </Field>
        <Field htmlFor="invoice-amount" label="Montant HT (€)">
          <Input
            id="invoice-amount"
            min={0}
            onChange={(event) => {
              update({ amountEur: Number(event.target.value) })
            }}
            required
            step="0.01"
            type="number"
            value={input.amountEur}
          />
        </Field>
        <Field
          htmlFor="invoice-vat"
          hint={`Total TTC : ${formatPreciseEur(total)}`}
          label="TVA (%)"
        >
          <Input
            id="invoice-vat"
            max={100}
            min={0}
            onChange={(event) => {
              update({ vatRate: Number(event.target.value) })
            }}
            required
            step="0.01"
            type="number"
            value={input.vatRate}
          />
        </Field>
        <Field className="sm:col-span-2" htmlFor="invoice-notes" label="Notes">
          <Textarea
            id="invoice-notes"
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
          Enregistrer le brouillon
        </Button>
      </DialogFooter>
    </form>
  )
}
