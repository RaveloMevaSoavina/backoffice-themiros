export type BillingCycle = "annual" | "one_off"

export type BillingPlan = {
  code: string
  name: string
  billingCycle: BillingCycle
  /** Prix catalogue HT : par an, ou par engagement pour un forfait. */
  listPriceEur: number | null
  evaluationsIncluded: number | null
  active: boolean
}

export const subscriptionStatuses = [
  "trialing",
  "active",
  "past_due",
  "canceled",
] as const
export type SubscriptionStatus = (typeof subscriptionStatuses)[number]

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  trialing: "Essai / pilote",
  active: "Actif",
  past_due: "Impayé",
  canceled: "Résilié",
}

export type Subscription = {
  id: string
  organizationId: string
  organizationName: string
  planCode: string
  planName: string
  billingCycle: BillingCycle
  status: SubscriptionStatus
  priceEur: number
  /** Null : volume non plafonne. */
  evaluationsIncluded: number | null
  /** Espaces crees par l'organisation sur la periode. */
  evaluationsUsed: number
  aiCostEur: number
  startsOn: string
  endsOn: string
  autoRenew: boolean
  notes: string | null
}

export type SubscriptionInput = {
  id: string | null
  organizationId: string
  planCode: string
  status: SubscriptionStatus
  priceEur: number
  evaluationsIncluded: number | null
  startsOn: string
  endsOn: string
  autoRenew: boolean
  notes: string
}

export type InvoiceStatus = "draft" | "issued" | "paid" | "void"

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  issued: "Émise",
  paid: "Payée",
  void: "Annulée",
}

export type Invoice = {
  id: string
  organizationId: string
  organizationName: string
  subscriptionId: string | null
  number: string | null
  label: string
  amountEur: number
  vatRate: number
  totalEur: number
  status: InvoiceStatus
  overdue: boolean
  issuedOn: string | null
  dueOn: string | null
  paidOn: string | null
  notes: string | null
}

export type InvoiceInput = {
  id: string | null
  organizationId: string
  subscriptionId: string | null
  label: string
  amountEur: number
  vatRate: number
  dueOn: string | null
  notes: string
}

export type BillingSummary = {
  arrEur: number
  liveSubscriptionCount: number
  renewals90dCount: number
  outstandingEur: number
  overdueEur: number
  paidYtdEur: number
  aiCost30dEur: number
}
