import { useState } from "react"

import type { Invoice } from "@/features/billing/model/types"
import {
  issueInvoice,
  setInvoiceStatus,
} from "@/features/billing/services/billing-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { addDays, formatPreciseEur, todayIso } from "@/shared/lib/format"
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

export type InvoiceDateAction = { kind: "issue" | "pay"; invoice: Invoice }

type InvoiceDateDialogProps = {
  action: InvoiceDateAction | null
  onOpenChange: (open: boolean) => void
}

/** Emission (date et echeance) ou encaissement (date de paiement). */
export function InvoiceDateDialog({
  action,
  onOpenChange,
}: InvoiceDateDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={action !== null}>
      <DialogContent>
        {action ? (
          <InvoiceDateForm
            action={action}
            onDone={() => {
              onOpenChange(false)
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function InvoiceDateForm({
  action,
  onDone,
}: {
  action: InvoiceDateAction
  onDone: () => void
}) {
  const today = todayIso()
  const [issuedOn, setIssuedOn] = useState(today)
  const [dueOn, setDueOn] = useState(action.invoice.dueOn ?? addDays(today, 30))
  const [paidOn, setPaidOn] = useState(today)
  const issue = useAdminMutation({
    mutationFn: issueInvoice,
    success: (number) => `Facture ${number} émise`,
    onSuccess: onDone,
  })
  const pay = useAdminMutation({
    mutationFn: setInvoiceStatus,
    success: "Paiement enregistré",
    onSuccess: onDone,
  })
  const isIssue = action.kind === "issue"

  return (
    <form
      className="contents"
      onSubmit={(event) => {
        event.preventDefault()
        if (isIssue) {
          issue.mutate({ id: action.invoice.id, issuedOn, dueOn })
        } else {
          pay.mutate({ id: action.invoice.id, status: "paid", paidOn })
        }
      }}
    >
      <DialogHeader>
        <DialogTitle>
          {isIssue ? "Émettre la facture" : "Enregistrer le paiement"}
        </DialogTitle>
        <DialogDescription>
          {action.invoice.organizationName} · {action.invoice.label} ·{" "}
          {formatPreciseEur(action.invoice.totalEur)} TTC
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="grid gap-4 pb-1 sm:grid-cols-2">
        {isIssue ? (
          <>
            <Field htmlFor="invoice-issued" label="Date d'émission">
              <Input
                id="invoice-issued"
                onChange={(event) => {
                  setIssuedOn(event.target.value)
                }}
                required
                type="date"
                value={issuedOn}
              />
            </Field>
            <Field htmlFor="invoice-due" label="Échéance">
              <Input
                id="invoice-due"
                min={issuedOn}
                onChange={(event) => {
                  setDueOn(event.target.value)
                }}
                required
                type="date"
                value={dueOn}
              />
            </Field>
          </>
        ) : (
          <Field htmlFor="invoice-paid" label="Date du paiement">
            <Input
              id="invoice-paid"
              onChange={(event) => {
                setPaidOn(event.target.value)
              }}
              required
              type="date"
              value={paidOn}
            />
          </Field>
        )}
      </DialogBody>
      <DialogFooter>
        <Button disabled={issue.isPending || pay.isPending} type="submit">
          {isIssue ? "Émettre" : "Enregistrer"}
        </Button>
      </DialogFooter>
    </form>
  )
}
