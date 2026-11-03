import {
  type SubscriptionRow,
  toSubscription,
} from "@/features/billing/services/billing-service"
import type {
  Organization,
  OrganizationInput,
  OrganizationSummary,
} from "@/features/organizations/model/types"
import { supabase } from "@/shared/lib/supabase"

type OrganizationSummaryRow = {
  id: string
  name: string
  type: OrganizationSummary["type"]
  country: string | null
  created_at: string
  member_count: number
  workspace_count: number
  pending_invitation_count: number
  subscription: SubscriptionRow | null
}

type OrganizationRow = {
  id: string
  name: string
  type: Organization["type"]
  country: string | null
  billing_email: string | null
  billing_address: string | null
  vat_number: string | null
  notes: string | null
  created_at: string
  ai_cost_eur: number | string
  ai_cost_30d_eur: number | string
  subscription: SubscriptionRow | null
  has_invoices: boolean
}

export async function listOrganizations(): Promise<OrganizationSummary[]> {
  const { data, error } = await supabase.rpc("backoffice_list_organizations")
  if (error) throw error
  return (data as OrganizationSummaryRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    country: row.country,
    createdAt: row.created_at,
    memberCount: Number(row.member_count),
    workspaceCount: Number(row.workspace_count),
    pendingInvitationCount: Number(row.pending_invitation_count),
    subscription: row.subscription ? toSubscription(row.subscription) : null,
  }))
}

export async function getOrganization(id: string): Promise<Organization> {
  const { data, error } = await supabase.rpc("backoffice_get_organization", {
    p_organization_id: id,
  })
  if (error) throw error
  const row = data as OrganizationRow
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    country: row.country,
    billingEmail: row.billing_email,
    billingAddress: row.billing_address,
    vatNumber: row.vat_number,
    notes: row.notes,
    createdAt: row.created_at,
    aiCostEur: Number(row.ai_cost_eur),
    aiCost30dEur: Number(row.ai_cost_30d_eur),
    subscription: row.subscription ? toSubscription(row.subscription) : null,
    hasInvoices: row.has_invoices,
  }
}

export async function saveOrganization(input: OrganizationInput) {
  const { data, error } = await supabase.rpc("backoffice_save_organization", {
    p_organization_id: input.id,
    p_name: input.name,
    p_type: input.type,
    p_country: input.country,
    p_billing_email: input.billingEmail,
    p_billing_address: input.billingAddress,
    p_vat_number: input.vatNumber,
    p_notes: input.notes,
  })
  if (error) throw error
  return data as string
}

export async function deleteOrganization(id: string) {
  const { error } = await supabase.rpc("backoffice_delete_organization", {
    p_organization_id: id,
  })
  if (error) throw error
}
