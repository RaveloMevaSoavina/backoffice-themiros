import { useQuery } from "@tanstack/react-query"
import { FilePlus, Plus } from "lucide-react"
import { useState } from "react"

import { InvoiceDialog } from "@/features/billing/components/invoice-dialog"
import { InvoicesTable } from "@/features/billing/components/invoices-table"
import { SubscriptionDialog } from "@/features/billing/components/subscription-dialog"
import { SubscriptionsTable } from "@/features/billing/components/subscriptions-table"
import { usePlans } from "@/features/billing/model/use-plans"
import { getBillingSummary } from "@/features/billing/services/billing-service"
import { formatEur, formatPreciseEur } from "@/shared/lib/format"
import { Button } from "@/shared/ui/base/button"
import { PageHeader } from "@/shared/ui/page-header"
import { StatCard } from "@/shared/ui/stat-card"

export function BillingScreen() {
  const summary = useQuery({
    queryKey: ["billing", "summary"],
    queryFn: getBillingSummary,
  })
  const plans = usePlans()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isInvoicing, setIsInvoicing] = useState(false)
  const data = summary.data

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button
              onClick={() => {
                setIsInvoicing(true)
              }}
              variant="outline"
            >
              <FilePlus />
              Nouvelle facture
            </Button>
            <Button
              onClick={() => {
                setIsSubscribing(true)
              }}
            >
              <Plus />
              Nouvel abonnement
            </Button>
          </>
        }
        description="Montants hors taxes sauf mention TTC."
        title="Facturation"
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          hint={data ? `${formatEur(data.arrEur / 12)} par mois` : undefined}
          label="Revenu annuel récurrent"
          value={data ? formatEur(data.arrEur) : "—"}
        />
        <StatCard
          hint={
            data
              ? `${data.renewals90dCount} à renouveler sous 90 jours`
              : undefined
          }
          label="Abonnements en cours"
          value={data?.liveSubscriptionCount ?? "—"}
        />
        <StatCard
          hint={
            data && data.overdueEur > 0
              ? `dont ${formatEur(data.overdueEur)} en retard`
              : "Aucun retard"
          }
          label="À encaisser (TTC)"
          value={data ? formatEur(data.outstandingEur) : "—"}
        />
        <StatCard
          hint={
            data
              ? `Coût IA 30 jours : ${formatPreciseEur(data.aiCost30dEur)}`
              : undefined
          }
          label="Encaissé cette année (TTC)"
          value={data ? formatEur(data.paidYtdEur) : "—"}
        />
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-base font-semibold">Abonnements</h2>
        <SubscriptionsTable />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-base font-semibold">Factures</h2>
        <InvoicesTable />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">Offres</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(plans.data ?? []).map((plan) => (
            <div
              className="rounded-xl p-4 text-sm ring-1 ring-border/60"
              key={plan.code}
            >
              <div className="font-medium">{plan.name}</div>
              <div className="mt-1 tabular-nums">
                {plan.listPriceEur === null
                  ? "Sur devis"
                  : plan.billingCycle === "annual"
                    ? `${formatEur(plan.listPriceEur)} / an`
                    : `dès ${formatEur(plan.listPriceEur)}`}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {plan.billingCycle === "annual" ? "Annuel" : "Forfait"}
                {plan.evaluationsIncluded !== null
                  ? ` · ${plan.evaluationsIncluded} évaluations / an`
                  : ""}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SubscriptionDialog
        onOpenChange={setIsSubscribing}
        open={isSubscribing}
      />
      <InvoiceDialog onOpenChange={setIsInvoicing} open={isInvoicing} />
    </>
  )
}
