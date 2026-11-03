import type { ProfileRole, WorkspaceRole } from "@/shared/lib/labels"

export type Profile = {
  id: string
  email: string
  fullName: string | null
  role: ProfileRole | null
  lang: string
  organizationId: string | null
  organizationName: string | null
  isPlatformAdmin: boolean
  workspaceCount: number
  emailConfirmedAt: string | null
  lastSignInAt: string | null
  /** Archive : le compte ne peut plus se connecter, rien n'est efface. */
  archivedAt: string | null
  archivedByName: string | null
  createdAt: string
}

export type ProfileInput = {
  id: string
  fullName: string
  role: ProfileRole | ""
  organizationId: string | null
}

/** Compte cree a la main : mot de passe choisi ici, aucun e-mail envoye. */
export type ProfileCreateInput = {
  organizationId: string
  email: string
  fullName: string
  password: string
  role: ProfileRole
  workspaceIds: string[]
  workspaceRole: WorkspaceRole
}

export function profileDisplayName(profile: {
  fullName: string | null
  email: string
}) {
  return profile.fullName?.trim() || profile.email
}
