import type { Profile, ProfileInput } from "@/features/profiles/model/types"
import { supabase } from "@/shared/lib/supabase"

type ProfileRow = {
  id: string
  email: string
  full_name: string | null
  role: Profile["role"]
  lang: string
  organization_id: string | null
  organization_name: string | null
  is_platform_admin: boolean
  workspace_count: number
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  created_at: string
}

export async function listProfiles(
  organizationId?: string
): Promise<Profile[]> {
  const { data, error } = await supabase.rpc("backoffice_list_profiles", {
    p_organization_id: organizationId ?? null,
  })
  if (error) throw error
  return (data as ProfileRow[]).map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    lang: row.lang,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    isPlatformAdmin: row.is_platform_admin,
    workspaceCount: Number(row.workspace_count),
    emailConfirmedAt: row.email_confirmed_at,
    lastSignInAt: row.last_sign_in_at,
    createdAt: row.created_at,
  }))
}

export async function updateProfile(input: ProfileInput) {
  const { error } = await supabase.rpc("backoffice_update_profile", {
    p_profile_id: input.id,
    p_full_name: input.fullName,
    p_role: input.role,
    p_organization_id: input.organizationId,
  })
  if (error) throw error
}

export async function setPlatformAdmin(input: {
  profileId: string
  enabled: boolean
}) {
  const { error } = await supabase.rpc("backoffice_set_platform_admin", {
    p_profile_id: input.profileId,
    p_enabled: input.enabled,
  })
  if (error) throw error
}
