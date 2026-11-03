import type { Subscription } from "@/features/billing/model/types"
import type { OrganizationType } from "@/shared/lib/labels"

export type OrganizationSummary = {
  id: string
  name: string
  type: OrganizationType | null
  country: string | null
  createdAt: string
  memberCount: number
  workspaceCount: number
  pendingInvitationCount: number
  subscription: Subscription | null
}

export type Organization = {
  id: string
  name: string
  type: OrganizationType | null
  country: string | null
  billingEmail: string | null
  billingAddress: string | null
  vatNumber: string | null
  notes: string | null
  createdAt: string
  aiCostEur: number
  aiCost30dEur: number
  subscription: Subscription | null
  hasInvoices: boolean
}

export type OrganizationInput = {
  id: string | null
  name: string
  type: OrganizationType | ""
  country: string
  billingEmail: string
  billingAddress: string
  vatNumber: string
  notes: string
}
