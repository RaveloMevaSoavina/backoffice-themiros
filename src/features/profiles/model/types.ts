import type { ProfileRole } from "@/shared/lib/labels"

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
  createdAt: string
}

export type ProfileInput = {
  id: string
  fullName: string
  role: ProfileRole | ""
  organizationId: string | null
}

export function profileDisplayName(profile: {
  fullName: string | null
  email: string
}) {
  return profile.fullName?.trim() || profile.email
}
