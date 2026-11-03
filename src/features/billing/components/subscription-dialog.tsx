import { useState } from "react"

import {
  type Subscription,
  type SubscriptionInput,
  type SubscriptionStatus,
  subscriptionStatuses,
  subscriptionStatusLabels,
} from "@/features/billing/model/types"
import { usePlans } from "@/features/billing/model/use-plans"
import { saveSubscription } from "@/features/billing/services/billing-service"
import { OrganizationSelect } from "@/features/organizations/components/organization-select"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { addYears, formatEur, todayIso } from "@/shared/lib/format"
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

type SubscriptionDialogProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
  organizationId?: string
  /** Present : modification. */
  subscription?: Subscription | null
}

export function SubscriptionDialog({
  onOpenChange,
  open,
  organizationId,
  subscription,
}: SubscriptionDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-xl">
        {open ? (
          <SubscriptionForm
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

function SubscriptionForm({
  onDone,
  organizationId,
  subscription,
}: {
  onDone: () => void
  organizationId?: string
  subscription?: Subscription | null
}) {
  const plans = usePlans()
  const today = todayIso()
  const [input, setInput] = useState<SubscriptionInput>(() =>
    subscription
      ? {
          id: subscription.id,
          organizationId: subscription.organizationId,
          planCode: subscription.planCode,
          status: subscription.status,
          priceEur: subscription.priceEur,
          evaluationsIncluded: subscription.evaluationsIncluded,
          startsOn: subscription.startsOn,
          endsOn: subscription.endsOn,
          autoRenew: subscription.autoRenew,
          notes: subscription.notes ?? "",
        }
      : {
          id: null,
          organizationId: organizationId ?? "",
          planCode: "",
          status: "active",
          priceEur: 0,
          evaluationsIncluded: null,
          startsOn: today,
          endsOn: addYears(today, 1),
          autoRenew: true,
          notes: "",
        }
  )
  const mutation = useAdminMutation({
    mutationFn: saveSubscription,
    success: subscription ? "Abonnement mis à jour" : "Abonnement créé",
    onSuccess: onDone,
  })
  const update = (patch: Partial<SubscriptionInput>) => {
    setInput((current) => ({ ...current, ...patch }))
  }

  /* Choisir une offre reprend son prix catalogue et son volume : le montant
     negocie se corrige ensuite. */
  const choosePlan = (code: string) => {
    const plan = plans.data?.find((candidate) => candidate.code === code)
    update({
      planCode: code,
      priceEur: plan?.listPriceEur ?? input.priceEur,
      evaluationsIncluded: plan?.evaluationsIncluded ?? null,
      autoRenew: plan?.billingCycle === "annual",
    })
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
          {subscription ? "Modifier l'abonnement" : "Nouvel abonnement"}
        </DialogTitle>
        <DialogDescription>
          {subscription
            ? subscription.organizationName
            : "Un seul abonnement en cours par organisation. Pour changer d'offre, résiliez l'actuel puis créez le suivant."}
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="grid gap-4 pb-1 sm:grid-cols-2">
        {organizationId || subscription ? null : (
          <Field
            className="sm:col-span-2"
            htmlFor="subscription-organization"
            label="Organisation"
          >
            <OrganizationSelect
              id="subscription-organization"
              onChange={(value) => {
                update({ organizationId: value })
              }}
              value={input.organizationId}
            />
          </Field>
        )}
        <Field htmlFor="subscription-plan" label="Offre">
          <NativeSelect
            id="subscription-plan"
            onChange={(event) => {
              choosePlan(event.target.value)
            }}
            required
            value={input.planCode}
          >
            <option value="">Choisir une offre</option>
            {(plans.data ?? []).map((plan) => (
              <option key={plan.code} value={plan.code}>
                {plan.name}
                {plan.listPriceEur !== null
                  ? ` — ${formatEur(plan.listPriceEur)}${plan.billingCycle === "annual" ? " / an" : ""}`
                  : " — sur devis"}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field htmlFor="subscription-status" label="Statut">
          <NativeSelect
            id="subscription-status"
            onChange={(event) => {
              update({ status: event.target.value as SubscriptionStatus })
            }}
            value={input.status}
          >
            {subscriptionStatuses.map((status) => (
              <option key={status} value={status}>
                {subscriptionStatusLabels[status]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field
          htmlFor="subscription-price"
          hint="Montant négocié pour la période."
          label="Montant HT (€)"
        >
          <Input
            id="subscription-price"
            min={0}
            onChange={(event) => {
              update({ priceEur: Number(event.target.value) })
            }}
            required
            step="0.01"
            type="number"
            value={input.priceEur}
          />
        </Field>
        <Field
          htmlFor="subscription-evaluations"
          hint="Vide : volume non plafonné."
          label="Évaluations incluses"
        >
          <Input
            id="subscription-evaluations"
            min={0}
            onChange={(event) => {
              update({
                evaluationsIncluded: event.target.value
                  ? Number(event.target.value)
                  : null,
              })
            }}
            type="number"
            value={input.evaluationsIncluded ?? ""}
          />
        </Field>
        <Field htmlFor="subscription-start" label="Début">
          <Input
            id="subscription-start"
            onChange={(event) => {
              update({ startsOn: event.target.value })
            }}
            required
            type="date"
            value={input.startsOn}
          />
        </Field>
        <Field htmlFor="subscription-end" label="Fin">
          <Input
            id="subscription-end"
            min={input.startsOn}
            onChange={(event) => {
              update({ endsOn: event.target.value })
            }}
            required
            type="date"
            value={input.endsOn}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            checked={input.autoRenew}
            className="size-4 accent-foreground"
            onChange={(event) => {
              update({ autoRenew: event.target.checked })
            }}
            type="checkbox"
          />
          Reconduction tacite
        </label>
        <Field
          className="sm:col-span-2"
          htmlFor="subscription-notes"
          label="Notes"
        >
          <Textarea
            id="subscription-notes"
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
