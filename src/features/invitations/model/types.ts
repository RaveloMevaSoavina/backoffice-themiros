import type { ProfileRole, WorkspaceRole } from "@/shared/lib/labels"

export type InvitationStatus = "pending" | "accepted" | "revoked"

export const invitationStatusLabels: Record<InvitationStatus, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  revoked: "Révoquée",
}

export type Invitation = {
  id: string
  organizationId: string
  organizationName: string
  email: string
  fullName: string | null
  role: ProfileRole
  workspaceRole: WorkspaceRole
  workspaces: { id: string; name: string }[]
  status: InvitationStatus
  invitedByName: string | null
  sentCount: number
  lastSentAt: string | null
  acceptedAt: string | null
  createdAt: string
}

export type InvitationInput = {
  organizationId: string
  email: string
  fullName: string
  role: ProfileRole
  workspaceIds: string[]
  workspaceRole: WorkspaceRole
}

/** sent : lien envoye ; attached : compte existant rattache sans e-mail. */
export type InvitationDelivery = "sent" | "attached"
