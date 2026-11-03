import type {
  BillingPlan,
  BillingSummary,
  Invoice,
  InvoiceInput,
  InvoiceStatus,
  Subscription,
  SubscriptionInput,
} from "@/features/billing/model/types"
import { supabase } from "@/shared/lib/supabase"

export type SubscriptionRow = {
  id: string
  organization_id: string
  organization_name: string
  plan_code: string
  plan_name: string
  billing_cycle: Subscription["billingCycle"]
  status: Subscription["status"]
  price_eur: number | string
  evaluations_included: number | null
  evaluations_used: number
  ai_cost_eur: number | string
  starts_on: string
  ends_on: string
  auto_renew: boolean
  notes: string | null
}

type InvoiceRow = {
  id: string
  organization_id: string
  organization_name: string
  subscription_id: string | null
  number: string | null
  label: string
  amount_eur: number | string
  vat_rate: number | string
  total_eur: number | string
  status: InvoiceStatus
  overdue: boolean
  issued_on: string | null
  due_on: string | null
  paid_on: string | null
  notes: string | null
}

type PlanRow = {
  code: string
  name: string
  billing_cycle: BillingPlan["billingCycle"]
  list_price_eur: number | string | null
  evaluations_included: number | null
  active: boolean
}

/* PostgREST renvoie les numeric en chaine dans un jsonb construit. */
export function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    planCode: row.plan_code,
    planName: row.plan_name,
    billingCycle: row.billing_cycle,
    status: row.status,
    priceEur: Number(row.price_eur),
    evaluationsIncluded: row.evaluations_included,
    evaluationsUsed: Number(row.evaluations_used),
    aiCostEur: Number(row.ai_cost_eur),
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    autoRenew: row.auto_renew,
    notes: row.notes,
  }
}

function toInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    subscriptionId: row.subscription_id,
    number: row.number,
    label: row.label,
    amountEur: Number(row.amount_eur),
    vatRate: Number(row.vat_rate),
    totalEur: Number(row.total_eur),
    status: row.status,
    overdue: row.overdue,
    issuedOn: row.issued_on,
    dueOn: row.due_on,
    paidOn: row.paid_on,
    notes: row.notes,
  }
}

export async function listPlans(): Promise<BillingPlan[]> {
  const { data, error } = await supabase.rpc("backoffice_list_plans")
  if (error) throw error
  return (data as PlanRow[]).map((row) => ({
    code: row.code,
    name: row.name,
    billingCycle: row.billing_cycle,
    listPriceEur:
      row.list_price_eur === null ? null : Number(row.list_price_eur),
    evaluationsIncluded: row.evaluations_included,
    active: row.active,
  }))
}

export async function getBillingSummary(): Promise<BillingSummary> {
  const { data, error } = await supabase.rpc("backoffice_billing_summary")
  if (error) throw error
  const row = data as Record<string, number | string>
  return {
    arrEur: Number(row.arr_eur),
    liveSubscriptionCount: Number(row.live_subscription_count),
    renewals90dCount: Number(row.renewals_90d_count),
    outstandingEur: Number(row.outstanding_eur),
    overdueEur: Number(row.overdue_eur),
    paidYtdEur: Number(row.paid_ytd_eur),
    aiCost30dEur: Number(row.ai_cost_30d_eur),
  }
}

export async function listSubscriptions(
  organizationId?: string
): Promise<Subscription[]> {
  const { data, error } = await supabase.rpc("backoffice_list_subscriptions", {
    p_organization_id: organizationId ?? null,
  })
  if (error) throw error
  return (data as SubscriptionRow[]).map(toSubscription)
}

export async function saveSubscription(input: SubscriptionInput) {
  const { data, error } = await supabase.rpc("backoffice_save_subscription", {
    p_subscription_id: input.id,
    p_organization_id: input.organizationId,
    p_plan_code: input.planCode,
    p_status: input.status,
    p_price_eur: input.priceEur,
    p_evaluations_included: input.evaluationsIncluded,
    p_starts_on: input.startsOn,
    p_ends_on: input.endsOn,
    p_auto_renew: input.autoRenew,
    p_notes: input.notes,
  })
  if (error) throw error
  return data as string
}

export async function listInvoices(
  organizationId?: string
): Promise<Invoice[]> {
  const { data, error } = await supabase.rpc("backoffice_list_invoices", {
    p_organization_id: organizationId ?? null,
  })
  if (error) throw error
  return (data as InvoiceRow[]).map(toInvoice)
}

export async function saveInvoice(input: InvoiceInput) {
  const { data, error } = await supabase.rpc("backoffice_save_invoice", {
    p_invoice_id: input.id,
    p_organization_id: input.organizationId,
    p_subscription_id: input.subscriptionId,
    p_label: input.label,
    p_amount_eur: input.amountEur,
    p_vat_rate: input.vatRate,
    p_due_on: input.dueOn,
    p_notes: input.notes,
  })
  if (error) throw error
  return data as string
}

export async function issueInvoice(input: {
  id: string
  issuedOn: string
  dueOn: string
}) {
  const { data, error } = await supabase.rpc("backoffice_issue_invoice", {
    p_invoice_id: input.id,
    p_issued_on: input.issuedOn,
    p_due_on: input.dueOn,
  })
  if (error) throw error
  return data as string
}

export async function setInvoiceStatus(input: {
  id: string
  status: Exclude<InvoiceStatus, "draft">
  paidOn?: string
}) {
  const { error } = await supabase.rpc("backoffice_set_invoice_status", {
    p_invoice_id: input.id,
    p_status: input.status,
    p_paid_on: input.paidOn ?? null,
  })
  if (error) throw error
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.rpc("backoffice_delete_invoice", {
    p_invoice_id: id,
  })
  if (error) throw error
}
