import { useQuery } from "@tanstack/react-query"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { InvoiceDialog } from "@/features/billing/components/invoice-dialog"
import { SubscriptionDialog } from "@/features/billing/components/subscription-dialog"
import {
  type Subscription,
  subscriptionStatusLabels,
} from "@/features/billing/model/types"
import { listSubscriptions } from "@/features/billing/services/billing-service"
import { formatDate, formatEur, formatPreciseEur } from "@/shared/lib/format"
import { Badge } from "@/shared/ui/base/badge"
import { Button } from "@/shared/ui/base/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/base/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/base/table"
import { EmptyRow, QueryState } from "@/shared/ui/query-state"

const statusVariant = {
  trialing: "outline",
  active: "secondary",
  past_due: "warning",
  canceled: "outline",
} as const

/** Consommation : espaces crees sur la periode face au volume inclus. */
export function EvaluationUsage({
  subscription,
}: {
  subscription: Subscription
}) {
  const { evaluationsIncluded: included, evaluationsUsed: used } = subscription
  if (included === null) {
    return <span className="tabular-nums">{used} / illimité</span>
  }
  const ratio = included === 0 ? 1 : Math.min(used / included, 1)
  return (
    <div className="min-w-24 space-y-1">
      <div className="flex items-center gap-1.5 tabular-nums">
        {used} / {included}
        {used > included ? <Badge variant="warning">Dépassé</Badge> : null}
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  )
}

type SubscriptionsTableProps = {
  organizationId?: string
}

export function SubscriptionsTable({
  organizationId,
}: SubscriptionsTableProps) {
  const subscriptions = useQuery({
    queryKey: ["billing", "subscriptions", organizationId ?? "all"],
    queryFn: () => listSubscriptions(organizationId),
  })
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [invoicing, setInvoicing] = useState<Subscription | null>(null)

  return (
    <>
      <QueryState
        error={subscriptions.error}
        isLoading={subscriptions.isLoading}
      >
        {(subscriptions.data ?? []).length === 0 ? (
          <EmptyRow>Aucun abonnement.</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {organizationId ? null : <TableHead>Organisation</TableHead>}
                <TableHead>Offre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant HT</TableHead>
                <TableHead>Évaluations</TableHead>
                <TableHead className="text-right">Coût IA</TableHead>
                <TableHead>Période</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(subscriptions.data ?? []).map((subscription) => (
                <TableRow
                  className={
                    subscription.status === "canceled" ? "opacity-60" : ""
                  }
                  key={subscription.id}
                >
                  {organizationId ? null : (
                    <TableCell className="font-medium">
                      <Link
                        className="hover:underline"
                        to={`/organizations/${subscription.organizationId}`}
                      >
                        {subscription.organizationName}
                      </Link>
                    </TableCell>
                  )}
                  <TableCell>{subscription.planName}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[subscription.status]}>
                      {subscriptionStatusLabels[subscription.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatEur(subscription.priceEur)}
                  </TableCell>
                  <TableCell>
                    <EvaluationUsage subscription={subscription} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPreciseEur(subscription.aiCostEur)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(subscription.startsOn)} →{" "}
                    {formatDate(subscription.endsOn)}
                    {subscription.autoRenew ? (
                      <div className="text-xs">Reconduction tacite</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-label="Actions"
                          size="icon-sm"
                          variant="ghost"
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditing(subscription)
                          }}
                        >
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setInvoicing(subscription)
                          }}
                        >
                          Préparer la facture
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </QueryState>

      <SubscriptionDialog
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        open={editing !== null}
        subscription={editing}
      />
      <InvoiceDialog
        onOpenChange={(open) => {
          if (!open) setInvoicing(null)
        }}
        open={invoicing !== null}
        subscription={invoicing}
      />
    </>
  )
}
