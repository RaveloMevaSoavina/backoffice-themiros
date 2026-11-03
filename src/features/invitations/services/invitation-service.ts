import type {
  Invitation,
  InvitationDelivery,
  InvitationInput,
} from "@/features/invitations/model/types"
import { apiRequest } from "@/shared/lib/api"
import { supabase } from "@/shared/lib/supabase"

type InvitationRow = {
  id: string
  organization_id: string
  organization_name: string
  email: string
  full_name: string | null
  role: Invitation["role"]
  workspace_role: Invitation["workspaceRole"]
  workspaces: { id: string; name: string }[]
  status: Invitation["status"]
  invited_by_name: string | null
  sent_count: number
  last_sent_at: string | null
  accepted_at: string | null
  created_at: string
}

type InvitationResult = { id: string; delivery: InvitationDelivery }

async function accessToken() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!data.session) throw new Error("Session expirée : reconnectez-vous.")
  return data.session.access_token
}

export async function listInvitations(
  organizationId?: string
): Promise<Invitation[]> {
  const { data, error } = await supabase.rpc("backoffice_list_invitations", {
    p_organization_id: organizationId ?? null,
  })
  if (error) throw error
  return (data as InvitationRow[]).map((row) => ({
    id: row.id,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    workspaceRole: row.workspace_role,
    workspaces: row.workspaces,
    status: row.status,
    invitedByName: row.invited_by_name,
    sentCount: Number(row.sent_count),
    lastSentAt: row.last_sent_at,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
  }))
}

/* L'envoi de l'e-mail demande la cle serveur : il passe par l'API. */
export async function createInvitation(input: InvitationInput) {
  return apiRequest<InvitationResult>("/api/v1/admin/invitations", {
    method: "POST",
    accessToken: await accessToken(),
    body: JSON.stringify({
      organization_id: input.organizationId,
      email: input.email.trim(),
      full_name: input.fullName.trim() || null,
      role: input.role,
      workspace_ids: input.workspaceIds,
      workspace_role: input.workspaceRole,
    }),
  })
}

export async function resendInvitation(id: string) {
  return apiRequest<InvitationResult>(
    `/api/v1/admin/invitations/${id}/resend`,
    { method: "POST", accessToken: await accessToken() }
  )
}

export async function revokeInvitation(id: string) {
  await apiRequest<void>(`/api/v1/admin/invitations/${id}/revoke`, {
    method: "POST",
    accessToken: await accessToken(),
  })
}
